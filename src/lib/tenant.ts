// Esta base de datos es compartida hoy entre este producto (El Mexa
// Chamba / México) y otro producto distinto (El Tico Bretea / Costa Rica)
// -- ver el comentario sobre AppTenant en prisma/schema.prisma para el
// porqué. Cada rama de código corre siempre como UN solo tenant fijo, no
// hay selección en tiempo de ejecución: esta rama es México, así que
// CURRENT_APP es siempre "MX" acá. El equivalente en la otra rama sería
// "CR". No exportar esto como configurable por variable de entorno --
// mezclarlo por accidente anularía la protección que da.
export const CURRENT_APP = "MX" as const;
