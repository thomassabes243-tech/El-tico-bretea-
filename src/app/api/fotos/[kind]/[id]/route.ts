import { NextResponse } from "next/server";
import { readProfilePhoto } from "@/lib/storage";

// Sirve la foto de perfil (trabajador) o el logo (empresa) públicamente --
// es la misma foto que antes se mostraba pegando una URL externa, ahora
// alojada acá. Sin autenticación a propósito: se muestra en perfiles
// públicos, vacantes, etc. La URL incluye un query ?v= que cambia con cada
// subida nueva, así el caché del navegador nunca sirve una foto vieja.

export async function GET(
  request: Request,
  { params }: { params: Promise<{ kind: string; id: string }> }
) {
  const { kind, id } = await params;
  if (kind !== "trabajador" && kind !== "empresa") {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  try {
    const bytes = await readProfilePhoto(kind === "trabajador" ? "worker" : "company", id);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
}
