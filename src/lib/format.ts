// Formatea montos en pesos con coma como separador de miles ($350,000).
export function formatPesos(amount: number): string {
  return amount.toLocaleString("en-US");
}
