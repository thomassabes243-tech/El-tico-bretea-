import assert from "node:assert/strict";
import test from "node:test";
import { validateCvPaymentTransaction } from "./tilopay-validation";

const expected = {
  orderNumber: "ETB-CV-TEST",
  amountColones: 1000,
  requireTestMode: true,
};

test("acepta únicamente una transacción aprobada que coincide y está en pruebas", () => {
  const result = validateCvPaymentTransaction(
    {
      id_tilopay: 123,
      orderNumber: "ETB-CV-TEST",
      amount: "1000.00",
      currency: "CRC",
      code: "1",
      response: "Transacción aprobada",
      environment: "Test",
    },
    expected
  );
  assert.equal(result.ok, true);
});

test("rechaza monto, moneda, orden, estado o ambiente incorrectos", () => {
  const base = {
    orderNumber: "ETB-CV-TEST",
    amount: "1000.00",
    currency: "CRC",
    code: "1",
    environment: "Test",
  };

  for (const transaction of [
    { ...base, orderNumber: "OTRA" },
    { ...base, amount: "999.00" },
    { ...base, currency: "USD" },
    { ...base, code: "0" },
    { ...base, environment: "Production" },
  ]) {
    assert.equal(validateCvPaymentTransaction(transaction, expected).ok, false);
  }
});
