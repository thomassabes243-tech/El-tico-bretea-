import Link from "next/link";
import { ReactNode } from "react";
import { LogoMark } from "@/components/brand/Logo";

export function AuthShell({
  title,
  subtitle,
  children,
  wide,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-sand-50">
      <div className="border-b border-sand-200 bg-white px-4 py-4">
        <div className={`mx-auto flex items-center gap-2 ${wide ? "max-w-xl" : "max-w-md"}`}>
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={28} />
            <span className="font-extrabold tracking-tight text-navy-900">
              México <span className="text-mx-red-600">SinHambre</span>
            </span>
          </Link>
        </div>
      </div>
      <main className={`mx-auto w-full flex-1 px-4 py-8 ${wide ? "max-w-xl" : "max-w-md"}`}>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-navy-800/60">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
