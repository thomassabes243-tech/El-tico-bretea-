// Tipo compartido del SDK de PayPal cargado por script tag (window.paypal).
// Un solo lugar para declararlo -- si cada componente lo declara por su
// cuenta con una forma distinta, TypeScript exige que todas coincidan
// exactamente porque `declare global` se fusiona entre archivos.
export {};

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: Record<string, string | number>;
        createOrder?: () => Promise<string>;
        createSubscription?: () => Promise<string>;
        onApprove: (data: { orderID?: string; subscriptionID?: string }) => Promise<void>;
        onError?: (err: unknown) => void;
      }) => { render: (selector: string) => void };
    };
  }
}
