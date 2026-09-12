# Aislamiento de El Mexa Chamba (MX)

Esta rama es `claude/app-second-version-h8ujrh`. No mezclar sus commits con la rama de Costa Rica.

## Cambios

- `npm run build` compila sin migrar ni sembrar. `npm run db:migrate` es una operación de mantenimiento explícita con validación previa. El seed queda separado y exige contraseñas explícitas fuera de desarrollo/test.
- Antes de cualquier consulta Prisma (incluidas consultas SQL directas), se valida el endpoint fijo de esta app. `DATABASE_URL` y `DIRECT_URL`, si existe, deben coincidir en host normalizado, puerto, base y schema. Se aceptan conexiones pooled/direct del mismo endpoint. Se elimina `ALLOW_ANY_DB`.
- La huella MX `0d7247d71ad0` viene de la protección ya existente. La huella CR `df457a9a2652` procede del endpoint histórico documentado en CLAUDE.md. No se verificaron los endpoints actuales en Vercel/Neon durante esta corrección.
- Un endpoint desconocido se bloquea: nunca actualizar la huella solo para hacer pasar el build. Confirmar primero propiedad y separación en Neon. Esto no sustituye permisos independientes por base ni garantiza separación si se aprueba incorrectamente la configuración.
- El sitemap consulta vacantes al recibir una petición, no durante la construcción.
- Se rechazan cambios explícitos de `appId` a otro país, también en payloads anidados. El filtro Prisma sigue siendo defensa adicional: no constituye aislamiento completo de relaciones anidadas ni sustituye bases separadas.
- Se retira el workflow y script antiguos que aplicaban el schema mexicano y copiaban datos a Costa Rica. No se ejecutó ninguna migración.

## Condiciones antes de integrar y desplegar

Vercel no permitió acceder a los proyectos durante esta sesión. Esta propuesta NO certifica el estado de producción.

Confirmar en cada proyecto la rama de producción, endpoint de base y esquema correspondiente. Restringir previews/ramas para evitar construir el producto contrario. Conservar secretos de autenticación y credenciales de base independientes.

Usar un bucket distinto por app y credenciales S3/R2 limitadas exclusivamente a ese bucket. No se cambiaron claves de archivos: los archivos existentes se conservan en sus rutas actuales.

Tras verificar que endpoint y bucket pertenecen exclusivamente a MX, configurar `MX_STORAGE_IDENTITY_SHA256` con el resultado de `storageIdentityHash(endpoint, bucket)` de `src/lib/resource-isolation.mjs`. Para CR la variable es `CR_STORAGE_IDENTITY_SHA256`. El hash es SHA-256 de endpoint HTTPS normalizado (sin barra final) + salto de línea + bucket. Nunca incluir credenciales. Si el bucket no fue aprobado o cambia, se bloquean build y lecturas/escrituras/borrados de objetos. No apuntar ambos proyectos al mismo bucket para pasar la validación.

Comprobar el deploy de prueba con inicio de sesión, vacantes, subida/lectura/borrado de archivos sintéticos, y un intento de configuración cruzada que debe fallar antes de conectarse. No probar mezclando datos reales.

## Verificación local

`npm test`, `npm run lint`, `npm run typecheck`, `npm run build`.

Las pruebas usan configuraciones sintéticas, no conectan con producción y comprueban rechazo de bases cruzadas, URLs inválidas, schemas distintos, bucket ajeno, consultas Prisma/SQL y cambios explícitos de país.
