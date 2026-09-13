export type TilopayTransaction = {
  id_tilopay?: number | string;
  orderNumber?: string;
  amount?: string;
  currency?: string;
  code?: string;
  response?: string;
  auth?: string;
  environment?: string;
};

export type ExpectedCvPayment = {
  orderNumber: string;
  amountColones: number;
  requireTestMode: boolean;
};

export type CvPaymentValidation =
  | { ok: true; transaction: TilopayTransaction }
  | { ok: false; reason: string };

export function validateCvPaymentTransaction(
  transaction: TilopayTransaction | undefined,
  expected: ExpectedCvPayment
): CvPaymentValidation {
  if (!transaction) return { ok: false, reason: "Tilopay no encontró la transacción" };
  if (transaction.orderNumber !== expected.orderNumber) {
    return { ok: false, reason: "La orden confirmada no coincide" };
  }
  if (transaction.code !== "1") {
    return { ok: false, reason: transaction.response || "El pago fue rechazado" };
  }
  if (transaction.currency !== "CRC") {
    return { ok: false, reason: "La moneda confirmada no coincide" };
  }
  if (Number(transaction.amount) !== expected.amountColones) {
    return { ok: false, reason: "El monto confirmado no coincide" };
  }
  if (
    expected.requireTestMode &&
    transaction.environment?.trim().toLowerCase() !== "test"
  ) {
    return { ok: false, reason: "Tilopay no confirmó el ambiente de pruebas" };
  }
  return { ok: true, transaction };
}
