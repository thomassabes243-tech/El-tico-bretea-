import { mkdir, readFile, unlink, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";

// Adaptador de almacenamiento de objetos para archivos efímeros del chat
// (Sección 8/21): nunca se guardan en la base de datos, solo la referencia
// (clave, tipo, tamaño, expiración). Este adaptador usa disco local; en
// producción se puede sustituir por S3/R2 implementando la misma interfaz
// sin tocar el resto de la app.

const UPLOADS_ROOT = path.join(process.cwd(), ".data", "chat-uploads");
const CHAT_FILE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 72;

async function ensureRoot() {
  await mkdir(UPLOADS_ROOT, { recursive: true });
}

function keyToPath(key: string) {
  // El key ya viene saneado (generado por nosotros), pero validamos igual
  // para no permitir traversal de directorios.
  if (key.includes("..") || key.includes("/") || key.includes("\\")) {
    throw new Error("Clave de almacenamiento inválida");
  }
  return path.join(UPLOADS_ROOT, key);
}

export async function saveChatImage(buffer: Buffer) {
  await ensureRoot();

  const compressed = await sharp(buffer)
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  const key = `${randomUUID()}.jpg`;
  const filePath = keyToPath(key);
  await writeFile(filePath, compressed.data);

  return {
    key,
    mimeType: "image/jpeg",
    sizeBytes: compressed.data.byteLength,
    width: compressed.info.width,
    height: compressed.info.height,
    expiresAt: new Date(Date.now() + CHAT_FILE_TTL_MS),
  };
}

export async function readChatImage(key: string) {
  const filePath = keyToPath(key);
  return readFile(filePath);
}

export async function deleteChatImage(key: string) {
  const filePath = keyToPath(key);
  try {
    await unlink(filePath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
}

export async function chatImageExistsOnDisk(key: string) {
  try {
    await stat(keyToPath(key));
    return true;
  } catch {
    return false;
  }
}

/**
 * Borra del disco y de la base de datos los archivos de chat vencidos.
 * Se llama de forma perezosa desde las rutas de chat, y también puede
 * ejecutarse como tarea programada (ver prisma/cleanup-expired-files.ts)
 * para un borrado puntual en producción.
 */
export async function cleanupExpiredChatFiles(): Promise<number> {
  const expired = await prisma.chatFile.findMany({
    where: { expiresAt: { lte: new Date() } },
    select: { id: true, storageKey: true },
  });

  if (expired.length === 0) return 0;

  await Promise.all(expired.map((f) => deleteChatImage(f.storageKey)));
  await prisma.chatFile.deleteMany({ where: { id: { in: expired.map((f) => f.id) } } });

  return expired.length;
}
