import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";

// Adaptador de almacenamiento de objetos para archivos efímeros del chat
// (Sección 8/21): nunca se guardan en la base de datos, solo la referencia
// (clave, tipo, tamaño, expiración).
//
// Usa almacenamiento S3-compatible (Cloudflare R2, S3, etc.) cuando están
// configuradas STORAGE_S3_*; si no, cae a disco local (solo para
// desarrollo). En Vercel u otros entornos serverless sin STORAGE_S3_*
// configuradas, en vez de intentar el disco local (que ahí falla o se
// pierde entre invocaciones) se lanza StorageNotConfiguredError de una vez
// — ver README para configurar Cloudflare R2.

const CHAT_FILE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 72;

const s3Config = {
  endpoint: process.env.STORAGE_S3_ENDPOINT,
  bucket: process.env.STORAGE_S3_BUCKET,
  accessKeyId: process.env.STORAGE_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.STORAGE_S3_SECRET_ACCESS_KEY,
  region: process.env.STORAGE_S3_REGION || "auto",
};

const useS3 = Boolean(
  s3Config.endpoint && s3Config.bucket && s3Config.accessKeyId && s3Config.secretAccessKey
);

/** Para mostrar el estado real en /admin/almacenamiento. */
export function isCloudStorageConfigured() {
  return useS3;
}

/**
 * En Vercel (y cualquier entorno serverless) el filesystem de la función es
 * de solo lectura salvo /tmp, y /tmp no se comparte entre invocaciones ni
 * sobrevive un cold start -- así que sin STORAGE_S3_* configuradas, subir o
 * leer un archivo ahí falla o se pierde. En vez de dejar que eso reviente
 * como un error de filesystem críptico, lo detectamos antes y lanzamos un
 * error identificable para poder darle al usuario un mensaje claro (ver las
 * rutas de subida) en lugar de un genérico "no se pudo procesar la imagen".
 */
export class StorageNotConfiguredError extends Error {
  constructor() {
    super("El almacenamiento de archivos (STORAGE_S3_*) no está configurado en este servidor.");
    this.name = "StorageNotConfiguredError";
  }
}

function assertLocalDiskUsable() {
  if (process.env.VERCEL) {
    throw new StorageNotConfiguredError();
  }
}

let s3Client: S3Client | null = null;
function getS3Client() {
  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: s3Config.endpoint,
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKeyId!,
        secretAccessKey: s3Config.secretAccessKey!,
      },
    });
  }
  return s3Client;
}

const UPLOADS_ROOT = path.join(process.cwd(), ".data", "chat-uploads");

function keyToLocalPath(key: string) {
  // El key ya viene saneado (generado por nosotros), pero validamos igual
  // para no permitir traversal de directorios.
  if (key.includes("..") || key.includes("/") || key.includes("\\")) {
    throw new Error("Clave de almacenamiento inválida");
  }
  return path.join(UPLOADS_ROOT, key);
}

async function writeObject(key: string, data: Buffer, mimeType: string) {
  if (useS3) {
    await getS3Client().send(
      new PutObjectCommand({
        Bucket: s3Config.bucket,
        Key: key,
        Body: data,
        ContentType: mimeType,
      })
    );
    return;
  }
  assertLocalDiskUsable();
  await mkdir(UPLOADS_ROOT, { recursive: true });
  await writeFile(keyToLocalPath(key), data);
}

async function readObject(key: string): Promise<Buffer> {
  if (useS3) {
    const res = await getS3Client().send(
      new GetObjectCommand({ Bucket: s3Config.bucket, Key: key })
    );
    const bytes = await res.Body?.transformToByteArray();
    if (!bytes) throw new Error("Archivo vacío");
    return Buffer.from(bytes);
  }
  assertLocalDiskUsable();
  return readFile(keyToLocalPath(key));
}

async function deleteObject(key: string) {
  if (useS3) {
    await getS3Client().send(
      new DeleteObjectCommand({ Bucket: s3Config.bucket, Key: key })
    );
    return;
  }
  assertLocalDiskUsable();
  try {
    await unlink(keyToLocalPath(key));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
}

export async function saveChatImage(buffer: Buffer) {
  const compressed = await sharp(buffer)
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  const key = `${randomUUID()}.jpg`;
  await writeObject(key, compressed.data, "image/jpeg");

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
  return readObject(key);
}

// Hoja de delincuencia: documento privado y de largo plazo (no tiene TTL de
// 24h como las fotos del chat). Clave estable por trabajador — volver a
// subir reemplaza el archivo anterior en la misma clave.
const CRIMINAL_RECORD_QUALITY = 85;

export async function saveCriminalRecordImage(workerId: string, buffer: Buffer) {
  const compressed = await sharp(buffer)
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: CRIMINAL_RECORD_QUALITY, mozjpeg: true })
    .toBuffer();

  const key = `criminal-record-${workerId}.jpg`;
  await writeObject(key, compressed, "image/jpeg");
  return key;
}

export async function readCriminalRecordImage(key: string) {
  return readObject(key);
}

export async function deleteCriminalRecordImage(key: string) {
  await deleteObject(key);
}

export async function deleteChatImage(key: string) {
  await deleteObject(key);
}

/**
 * Borra del almacenamiento y de la base de datos los archivos de chat
 * vencidos. Se llama de forma perezosa desde las rutas de chat, y también
 * puede ejecutarse como tarea programada (ver prisma/cleanup-expired-files.ts)
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
