import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Corta camino para visitas SIN sesión a rutas que de todos modos van a
// redirigir a /iniciar-sesion. Hoy ese chequeo vive al principio de cada
// página (auth() + redirect), lo que igual arranca toda la función de esa
// página -- Prisma, callbacks de NextAuth, etc. -- antes de descartar la
// visita. Acá el chequeo es liviano (solo verifica el JWT de la cookie, sin
// Prisma ni bcrypt) y corre antes de que Next siquiera invoque esa función.
// Importa "next-auth/jwt" directo (no "@/lib/auth") a propósito: ese otro
// archivo trae bcrypt y Prisma, peso que no hace falta acá.
//
// Nota (Next.js 16, ver AGENTS.md): esto se llamaba "Middleware" y corría en
// el Edge Runtime; en esta versión se renombró a "Proxy" y el Edge Runtime
// quedó deprecado -- Proxy corre siempre en el runtime de Node.js. El ahorro
// real sigue siendo válido (nunca se inicializa la página protegida para
// una visita sin sesión), solo que ya no es "en el borde" en sentido
// geográfico como en versiones anteriores de Next.js.
//
// Solo cubre el caso "no hay sesión en absoluto". La lógica de rol
// específica de cada página (ej. "si no sos COMPANY, redirigí a /perfil")
// sigue intacta adentro de cada página, sin tocar.
export const config = {
  matcher: [
    "/admin/:path*",
    "/empresa/:path*",
    "/perfil/:path*",
    "/servicios/:path*",
    "/cv",
    "/premium",
    "/seguridad",
    "/comunidad/moderacion",
    "/alertas-estafa/nueva",
    "/vacantes/:id/aplicantes",
  ],
};

export async function proxy(request: NextRequest) {
  // getToken() NO detecta solo si hace falta el nombre de cookie con
  // prefijo __Secure- (lo usa Auth.js en HTTPS) -- sin decirle
  // secureCookie explícitamente, asume que no y busca el nombre de
  // desarrollo, que en producción no existe. Sin esto, cada visita ya
  // logueada se trataba como sin sesión y se mandaba a /iniciar-sesion en
  // TODAS las rutas de este matcher -- un bug real que ya llegó a
  // producción, no solo un caso hipotético.
  const secureCookie = request.nextUrl.protocol === "https:";
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET, secureCookie });
  if (token) return NextResponse.next();
  return NextResponse.redirect(new URL("/iniciar-sesion", request.url));
}
