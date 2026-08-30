// Íconos propios para las dos acciones centrales del Home (Cotizaciones):
// "Pedir un servicio" (una mano/llamado pidiendo ayuda + chispa de urgencia)
// y "Ofrecer mis servicios" (una persona + insignia de perfil profesional).
// Evitan a propósito la llave inglesa / maletín genéricos que pide no usar
// el rediseño.

export function ServiceRequestIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="16" fill="currentColor" fillOpacity="0.12" />
      <path
        d="M13 24.5v-3.2c0-1 .8-1.8 1.8-1.8h1.9M13 24.5h14M13 24.5c0 1.7 1.4 3 3 3h8c1.7 0 3-1.3 3-3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.7 19.5V15c0-1.1.9-2 2-2h2.6c1.1 0 2 .9 2 2v4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M27.5 13.8 26.2 16l2.5.4-.4 2.6 1.9-1.8-1.3-1.5 1.3-1Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ServiceOfferIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="16" fill="currentColor" fillOpacity="0.12" />
      <circle cx="19.3" cy="15.5" r="3.6" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12.5 27.5c0-3.9 3-7 6.8-7s6.8 3.1 6.8 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M27.5 13.2l1 2.1 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3z"
        fill="currentColor"
      />
    </svg>
  );
}
