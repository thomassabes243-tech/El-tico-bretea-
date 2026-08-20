"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallbackHref);
      }}
      aria-label="Volver"
      className="flex h-10 w-10 items-center justify-center rounded-full text-navy-900 transition-colors hover:bg-sand-100 active:scale-95"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}
