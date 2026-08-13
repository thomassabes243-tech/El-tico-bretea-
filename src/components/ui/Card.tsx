import { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

export function Card({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-sand-200 bg-white shadow-sm shadow-navy-900/[0.04]",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
