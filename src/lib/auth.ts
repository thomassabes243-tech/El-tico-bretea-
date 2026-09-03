import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";

const LOGIN_MAX_ATTEMPTS = 8;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/iniciar-sesion",
  },
  providers: [
    Credentials({
      // Sin contraseña, a pedido explícito del usuario: se entra solo con
      // el correo. El rate limit por correo sigue activo para no dejar
      // hacer login-enumeration/spam sin freno.
      credentials: {
        email: { label: "Correo", type: "email" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const { allowed } = await checkRateLimit(`login:${email}`, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS);
        if (!allowed) return null;

        const user = await prisma.user.findUnique({ where: { email } });
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
