import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
  children?: ReactNode;
};

// Estado vacío consistente para toda la app: ícono + título + explicación
// cercana + acción opcional, en vez de dejar una tarjeta o pantalla en blanco.
export function EmptyState({ icon: Icon, title, description, action, className, children }: EmptyStateProps) {
  return (
    <Card className={`flex flex-col items-center gap-2.5 p-8 text-center ${className ?? ""}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900/[0.06]">
        <Icon className="h-6 w-6 text-navy-800/40" strokeWidth={2} />
      </div>
      <p className="text-sm font-bold text-navy-900">{title}</p>
      {description && <p className="max-w-xs text-xs leading-relaxed text-navy-800/55">{description}</p>}
      {children}
      {action && (
        <Button href={action.href} size="sm" className="mt-1.5">
          {action.label}
        </Button>
      )}
    </Card>
  );
}
