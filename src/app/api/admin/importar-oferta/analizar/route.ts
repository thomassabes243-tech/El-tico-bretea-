import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { extractJobFromText, AiNotConfiguredError } from "@/lib/ai-import";
import { MAX_UPLOAD_BYTES } from "@/lib/chat-limits";

export async function POST(request: Request) {
  await requireAdmin();

  const formData = await request.formData().catch(() => null);
  const text = String(formData?.get("text") || "");
  const image = formData?.get("image");

  if (!text.trim() && !(image instanceof File)) {
    return NextResponse.json({ error: "Pegá texto o subí una imagen" }, { status: 400 });
  }

  let imageBase64: string | undefined;
  let imageMediaType: string | undefined;
  if (image instanceof File) {
    if (!image.type.startsWith("image/")) {
      return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 });
    }
    if (image.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "La imagen es muy grande (máx. 8MB)" }, { status: 400 });
    }
    const buffer = Buffer.from(await image.arrayBuffer());
    imageBase64 = buffer.toString("base64");
    imageMediaType = image.type;
  }

  try {
    const extracted = await extractJobFromText({ text, imageBase64, imageMediaType });
    return NextResponse.json(extracted);
  } catch (err) {
    console.error("[importar-oferta/analizar]", err);
    if (err instanceof AiNotConfiguredError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    return NextResponse.json(
      { error: "No se pudo analizar la publicación. Probá de nuevo o completá el formulario a mano." },
      { status: 502 }
    );
  }
}
