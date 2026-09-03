import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Merriweather, DM_Sans } from "next/font/google";
import Script from "next/script";
import { Providers } from "@/components/Providers";
import { getSiteUrl } from "@/lib/site";
import { ADSENSE_CLIENT_ID } from "@/lib/ads-client";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Serif solo para el titular del hero de inicio ("¡Aquí sí hay chamba!"),
// tal como pide la referencia de Stitch -- el resto de la app sigue con
// Plus Jakarta Sans.
const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Solo para la sección de Cotizaciones (rediseño visual, alcance acotado a
// esa sección -- no es el cambio de tipografía global de la Fase 5, que
// sigue pendiente y sin empezar).
const dmSans = DM_Sans({
  variable: "--font-dm-sans-loaded",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      className={`${plusJakarta.variable} ${merriweather.variable} ${dmSans.variable} h-full antialiased`}
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
