export const MOTIVATIONAL_QUOTES = [
  "Hoy es un buen día para dar el siguiente paso en tu carrera.",
  "Cada aplicación es una puerta que se abre. ¡Seguí adelante!",
  "El esfuerzo de hoy es la oportunidad de mañana.",
  "Costa Rica se mueve gracias a gente como vos. ¡Pura vida y a brechar!",
  "Un buen perfil abre puertas que ni imaginás.",
  "No dejés de intentarlo: el trabajo correcto está más cerca de lo que creés.",
  "Tu experiencia vale. Mostrala con orgullo.",
  "Las oportunidades llegan a quienes se preparan. Hoy es un buen día para prepararte.",
];

export function getDailyQuote(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
}
