export const MOTIVATIONAL_QUOTES = [
  "Un perfil completo y honesto abre más puertas que uno exagerado.",
  "Buscar trabajo también es trabajo. Un paso a la vez, sin apurarse.",
  "Tu experiencia cuenta, aunque no tengas título. Mostrala con claridad.",
  "México se mueve gracias a gente como vos. ¡Échale ganas!",
  "Las empresas serias valoran la constancia. Seguí postulando.",
  "Nadie va a saber lo que sabés hacer si tu perfil no lo dice.",
  "Hoy podés postularte a una vacante más. Puede ser la que te cambie el mes.",
  "El trabajo correcto no siempre llega rápido, pero llega a quien insiste.",
];

export function getDailyQuote(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
}
