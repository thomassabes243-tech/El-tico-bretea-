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
// configuradas STORAGE_S3_*; si no, cae a disco local. El disco local NO
// sirve en Vercel u otros entornos serverless (el filesystem es efímero y
// no se comparte entre invocaciones), así que en producción hace falta
// configurar las variables de entorno — ver README.

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
  return readFile(keyToLocalPath(key));
}

async function deleteObject(key: string) {
  if (useS3) {
    await getS3Client().send(
      new DeleteObjectCommand({ Bucket: s3Config.bucket, Key: key })
    );
    return;
  }
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
