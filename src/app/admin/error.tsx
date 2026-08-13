"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="text-sm font-semibold text-cr-red-600">{error.message || "Ocurrió un error"}</p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg border border-sand-200 px-4 py-2 text-sm font-semibold text-navy-800"
      >
        Volver a intentar
      </button>
    </div>
  );
}
