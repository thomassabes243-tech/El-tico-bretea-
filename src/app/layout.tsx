import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import Script from "next/script";
import { Providers } from "@/components/Providers";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

// Client ID público de Google AdSense — no es un secreto, aparece igual en
// el código fuente de cualquier sitio con AdSense, por eso va directo acá
// en vez de en una variable de entorno.
const ADSENSE_CLIENT_ID = "ca-pub-6733879285050684";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Serif decorativa solo para el titular de la portada de inicio (Sección
// "Buscar trabajo sea una bendición, no una tragedia") -- el resto de la app
// sigue con Plus Jakarta Sans, esta es una excepción de marca puntual.
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "El Mexa Chamba — Aquí sí hay chamba",
  description:
    "El Mexa Chamba conecta a trabajadores mexicanos con empresas de forma directa y confiable: perfiles profesionales, currículums, vacantes y comunidades por gremio.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0a2647",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-MX"
      className={`${plusJakarta.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-sand-50 text-foreground">
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
