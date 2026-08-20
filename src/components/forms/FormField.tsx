import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import clsx from "clsx";

type FieldWrapperProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
};

export function FieldWrapper({ label, htmlFor, error, hint, required, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="flex items-baseline gap-1.5 text-sm font-semibold text-navy-900">
        {label}
        {required ? (
          <span className="text-mx-red-600">*</span>
        ) : (
          <span className="text-xs font-medium normal-case text-navy-800/40">(Opcional)</span>
        )}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-navy-800/50">{hint}</p>}
      {error && <p className="text-xs font-medium text-mx-red-600">{error}</p>}
    </div>
  );
}

const inputBase =
  "h-11 w-full rounded-xl border border-sand-200 bg-white px-3.5 text-sm text-navy-900 placeholder:text-navy-800/35 outline-none transition-colors focus:border-navy-700 focus:ring-2 focus:ring-navy-700/10";

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(inputBase, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(inputBase, "h-auto min-h-24 resize-y py-2.5", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={clsx(inputBase, "appearance-none bg-white", className)} {...props}>
      {children}
    </select>
  );
}
