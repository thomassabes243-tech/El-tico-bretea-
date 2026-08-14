// Sección 8: fotos en el chat. Antes había un límite diario de cantidad de
// fotos por cuenta; se quitó a pedido (los usuarios deben poder subir fotos
// sin restricción de cantidad). El único límite que queda es el tamaño por
// archivo, para no aceptar imágenes desmedidas antes de comprimirlas.
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB antes de comprimir
