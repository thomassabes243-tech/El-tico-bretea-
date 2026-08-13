"use client";

import { useState } from "react";
import type { ReactNode } from "react";

export function AvatarImage({
  src,
  alt,
  fallback,
  className,
}: {
  src?: string | null;
  alt: string;
  fallback: ReactNode;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) return <>{fallback}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- foto/logo con URL arbitraria provista por el usuario, sin dominio fijo para next/image
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
    />
  );
}
