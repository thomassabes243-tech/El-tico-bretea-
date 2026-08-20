import type { Metadata, Viewport } from "next";
import { Montserrat, Inter } from "next/font/google";
import Script from "next/script";
import { Providers } from "@/components/Providers";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

// Client ID público de Google AdSense — no es un secreto, aparece igual en
// el código fuente de cualquier sitio con AdSense, por eso va directo acá
// en vez de en una variable de entorno.
const ADSENSE_CLIENT_ID = "ca-pub-6733879285050684";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "El Tico Bretea — Conseguí trabajo en Costa Rica",
  description:
    "El Tico Bretea conecta a trabajadores ticos con empresas de forma directa y confiable: perfiles profesionales, currículums, vacantes y comunidades por gremio.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#1a2b48",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-CR"
      className={`${montserrat.variable} ${inter.variable} h-full antialiased`}
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
