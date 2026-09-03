// Constantes de AdSense seguras para importar desde un componente cliente
// ("use client"). Separadas de src/lib/ads.ts a propósito: ese archivo
// también tiene funciones que usan Prisma (getActiveAds, getAdEligibility)
// -- importar CUALQUIER cosa de un archivo, aunque sea solo una constante,
// hace que el bundler de Next incluya el archivo completo (incluido su
// `import { prisma } from "@/lib/prisma"`) en el bundle del navegador.
// Eso rompía TODA página que renderizara AdSenseSlot (ej. /buscar/[categoria]
// con más de 4 vacantes) con "PrismaClient is unable to run in this browser
// environment" -- un crash real, reproducido con Playwright, que no
// aparecía en los logs de Vercel porque es un error 100% del lado del
// navegador, nunca llega al servidor.
export const ADSENSE_CLIENT_ID = "ca-pub-6733879285050684";

// ID del bloque de anuncio (ad unit) de AdSense a mostrar entre resultados
// (ver AdSenseSlot) -- a diferencia del client ID, este si depende de la
// cuenta y hay que crearlo en el panel de AdSense (Anuncios → Por unidad de
// anuncio → Anuncio de display). Mientras no esté configurado, AdSenseSlot
// no renderiza nada, en vez de un espacio de anuncio roto.
export const ADSENSE_SLOT_ID = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID || null;
