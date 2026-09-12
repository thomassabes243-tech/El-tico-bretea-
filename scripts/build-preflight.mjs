// Los proyectos de México y Costa Rica están conectados al mismo repositorio.
// Este guard impide que el código de Mexa Chamba produzca un preview ejecutable
// dentro del proyecto de El Tico Bretea. No consulta ni modifica ninguna base.
const MEXA_CHAMBA_PROJECT_ID = "prj_bj8CEpgSaX8oaoCIeYNLlVCZaXr7";

if (process.env.VERCEL && process.env.VERCEL_PROJECT_ID !== MEXA_CHAMBA_PROJECT_ID) {
  throw new Error(
    "MX: despliegue bloqueado porque esta rama pertenece a Mexa Chamba y el proyecto de Vercel no coincide."
  );
}

console.log("[build-preflight] Proyecto Mexa Chamba confirmado; build de solo lectura.");

