"use client";

import { useState } from "react";
import clsx from "clsx";

/**
 * Fondo fotográfico del hero de Inicio. Si el archivo no carga por algún
 * motivo, cae a un fondo sólido en vez de mostrar el ícono de imagen rota
 * del navegador -- el degradado y el texto de arriba siguen viéndose bien.
 */
export function HeroImage({
  src,
  alt,
  className,
  fallbackClassName = "bg-navy-900",
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div className={clsx(fallbackClassName, className)} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- fondo decorativo con onError de fallback; no necesita optimización de next/image.
    <img src={src} alt={alt} onError={() => setFailed(true)} className={clsx("object-cover", className)} />
  );
}
