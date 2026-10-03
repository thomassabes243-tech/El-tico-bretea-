import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { isLoginRateLimited, recordFailedLogin, clearLoginRateLimit } from "@/lib/rate-limit";

const LOGIN_MAX_ATTEMPTS = 8;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Vercel es un host confiable (el proxy fija X-Forwarded-Host de forma
  // correcta) -- se fija acá en vez de depender solo de AUTH_TRUST_HOST
  // (una env var más, con el mismo riesgo de quedar cargada vacía que ya
  // tumbó todo el sitio con AUTH_SECRET).
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/iniciar-sesion",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        // Limita intentos por correo (no por IP): protege una cuenta puntual
        // de fuerza bruta sin depender de la IP del cliente, que el
        // provider de credenciales no expone de forma confiable acá.
        const rateLimitKey = `login:${email}`;
        if (await isLoginRateLimited(rateLimitKey, LOGIN_MAX_ATTEMPTS)) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.isBlocked) {
          await recordFailedLogin(rateLimitKey, LOGIN_WINDOW_MS);
          return null;
        }

        const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!isValid) {
          await recordFailedLogin(rateLimitKey, LOGIN_WINDOW_MS);
          return null;
        }

        await clearLoginRateLimit(rateLimitKey);
        return { id: user.id, email: user.email, role: user.role };
      },
    }),
    Credentials({
      id: "email-code",
      name: "Código por correo",
      credentials: {
        email: { label: "Correo", type: "email" },
        code: { label: "Código", type: "text" },
      },
      authorize: async (credentials) => {
        const email = String(credentials.email || "").trim().toLowerCase();
        const code = String(credentials.code || "").trim();
        if (!/^\S+@\S+\.\S+$/.test(email) || !/^\d{6}$/.test(code)) return null;

        const rateLimitKey = `email-code-login:${email}`;
        if (await isLoginRateLimited(rateLimitKey, LOGIN_MAX_ATTEMPTS)) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.isBlocked) {
          await recordFailedLogin(rateLimitKey, LOGIN_WINDOW_MS);
          return null;
        }
        const candidates = await prisma.passwordlessCode.findMany({
          where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: "desc" },
          take: 5,
        });
        let matched: (typeof candidates)[number] | undefined;
        for (const candidate of candidates) {
          if (await bcrypt.compare(code, candidate.codeHash)) {
            matched = candidate;
            break;
          }
        }
        if (!matched) {
          await recordFailedLogin(rateLimitKey, LOGIN_WINDOW_MS);
          return null;
        }
        const consumed = await prisma.passwordlessCode.updateMany({
          where: { id: matched.id, usedAt: null },
          data: { usedAt: new Date() },
        });
        if (consumed.count !== 1) return null;
        await clearLoginRateLimit(rateLimitKey);
        return { id: user.id, email: user.email, role: user.role };
      },
    }),
    Credentials({
      id: "passkey-ticket",
      name: "Llave de acceso",
      credentials: { ticket: { label: "Comprobante", type: "text" } },
      authorize: async (credentials) => {
        const ticket = String(credentials.ticket || "");
        if (ticket.length < 32) return null;
        const tokenHash = createHash("sha256").update(ticket).digest("hex");
        const stored = await prisma.passwordlessTicket.findUnique({
          where: { tokenHash },
          include: { user: true },
        });
        if (!stored || stored.usedAt || stored.expiresAt <= new Date()) return null;
        const consumed = await prisma.passwordlessTicket.updateMany({
          where: { id: stored.id, usedAt: null, expiresAt: { gt: new Date() } },
          data: { usedAt: new Date() },
        });
        if (consumed.count !== 1) return null;
        const user = stored.user;
        if (!user || user.isBlocked) return null;
        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
