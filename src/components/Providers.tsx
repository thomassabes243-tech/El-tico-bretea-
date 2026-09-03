"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Registra el service worker mínimo para que Chrome/Android considere la
    // app instalable (criterio necesario para "Agregar a pantalla de
    // inicio" en modo standalone, y para empaquetarla como TWA en Play
    // Store) -- ver public/sw.js.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Sin service worker la app sigue funcionando normal como sitio
        // web; solo se pierde el modo instalable.
      });
    }
  }, []);

  return (
    <SessionProvider>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  );
}
