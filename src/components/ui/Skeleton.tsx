import { HTMLAttributes } from "react";
import clsx from "clsx";

// Bloque base de skeleton -- pulso sutil, respeta la identidad visual
// (mismo radio que las tarjetas) en vez de un spinner que bloquea la pantalla.
export function Skeleton({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("animate-pulse rounded-xl bg-navy-900/[0.06]", className)}
      {...rest}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-4 shadow-sm shadow-navy-900/[0.04]">
      <div className="flex items-start gap-3">
        <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
        <div className="flex-1 flex-col gap-2">
          <Skeleton className="h-3.5 w-3/4 rounded-full" />
          <Skeleton className="mt-2 h-3 w-1/2 rounded-full" />
          <div className="mt-3 flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CardSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
