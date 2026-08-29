import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { ensurePaypalPlansExist } from "@/lib/paypal-plans";

// Misma lógica que el botón de /admin/configuracion, expuesta también como
// endpoint plano -- para poder dispararla una sola vez sin depender de que
// alguien haga clic en el panel.
export async function POST() {
  await requireAdmin();

  try {
    const result = await ensurePaypalPlansExist();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo crear el plan en PayPal" },
      { status: 502 }
    );
  }
}
