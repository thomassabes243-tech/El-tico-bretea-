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
        "rounded-2xl border border-sand-200 bg-white shadow-ambient",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
