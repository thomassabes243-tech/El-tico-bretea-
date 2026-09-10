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
        "rounded-[20px] border border-white/80 bg-white shadow-[0_10px_30px_rgba(10,38,71,0.08),0_2px_8px_rgba(10,38,71,0.04)]",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
