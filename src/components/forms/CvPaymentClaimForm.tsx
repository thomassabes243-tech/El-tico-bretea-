"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitCvPaymentClaim, type CvPaymentClaimState } from "@/app/cv/actions";
import { Button } from "@/components/ui/Button";

const initialState: CvPaymentClaimState = { error: null };

export function CvPaymentClaimForm() {
  // Al enviar, submitCvPaymentClaim revalida /cv -- el Server Component
  // padre pasa directo a mostrar la tarjeta "en revisión" (hasPendingClaim),
  // así que este formulario se desmonta antes de necesitar un estado de
  // éxito propio. Solo importa mostrar el error si algo sale mal.
  const [state, formAction, isPending] = useActionState(submitCvPaymentClaim, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2.5">
      <input
        name="referenceCode"
        type="text"
        required
        placeholder="Código de comprobante del SINPE"
        className="h-10 w-full rounded-lg border border-sand-200 px-3 text-sm"
      />
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Enviando..." : "Ya pagué, enviar comprobante"} <CheckCircle2 className="h-3.5 w-3.5" />
      </Button>
      {state.error && <p className="text-xs font-medium text-cr-red-600">{state.error}</p>}
    </form>
  );
}
