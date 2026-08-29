// Comprime/redimensiona una imagen EN EL NAVEGADOR antes de subirla (Canvas
// nativo, sin librerías) -- menos tiempo de subida con datos móviles limitados,
// menos carga en el servidor y menos costo de almacenamiento en R2. El servidor
// igual vuelve a comprimir con sharp (ver src/lib/storage.ts) como defensa en
// profundidad, así que si esto falla en el navegador no rompe nada.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.8;

export async function compressImageFile(
  file: File,
  options: { maxDimension?: number; quality?: number } = {}
): Promise<File> {
  const { maxDimension = MAX_DIMENSION, quality = JPEG_QUALITY } = options;

  // Los GIF animados pierden la animación al pasar por canvas, y el resto de
  // tipos no-imagen no aplican -- se suben tal cual.
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    // Navegador sin soporte de canvas/createImageBitmap, o formato raro --
    // seguimos con el archivo original.
    return file;
  }
}
