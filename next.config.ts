import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // sharp (procesa las fotos del chat/CV) trae binarios nativos: si el
  // bundler los empaqueta en vez de dejarlos como módulo externo, puede
  // fallar en el runtime serverless de Vercel de forma silenciosa. Next
  // ya trae sharp en su lista de exclusión por defecto en versiones
  // recientes, pero se declara acá también para no depender de eso.
  serverExternalPackages: ["sharp", "@aws-sdk/client-s3"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Herramientas de empaquetado como PWABuilder corren en el
        // navegador del usuario, en el dominio de PWABuilder, y necesitan
        // leer estos archivos de forma cross-origin para armar el paquete
        // de Android/Windows. Sin este header el navegador bloquea la
        // lectura con "Failed to fetch" aunque el archivo exista y
        // responda 200 -- es un bloqueo de CORS, no del servidor.
        source: "/(manifest.json|sw.js|icon.svg)",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ];
  },
};

export default nextConfig;
