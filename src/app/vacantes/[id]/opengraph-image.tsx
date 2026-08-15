import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { LABOR_CATEGORIES } from "@/lib/constants";

export const runtime = "nodejs";
export const alt = "Vacante en Méxicosinhambre";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function labelFor(list: readonly { value: string; label: string }[], value: string) {
  return list.find((i) => i.value === value)?.label ?? value;
}

export default async function OpengraphImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const jobPosting = await prisma.jobPosting.findUnique({
    where: { id },
    include: { company: { select: { commercialName: true } } },
  });

  const title = jobPosting?.title ?? "Vacante disponible";
  const company = jobPosting?.company.commercialName ?? "Méxicosinhambre";
  const meta = jobPosting
    ? `${labelFor(LABOR_CATEGORIES, jobPosting.laborCategory)} · ${jobPosting.location}`
    : "México";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "linear-gradient(135deg, #0a2647 0%, #061b33 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "#ce1126",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 800,
              color: "#ffffff",
            }}
          >
            M
          </div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 800, color: "#ffffff" }}>
            México<span style={{ color: "#ff6b6b", marginLeft: 8 }}>SinHambre</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              background: "rgba(255,255,255,0.12)",
              color: "#ffffff",
              fontSize: 22,
              fontWeight: 600,
              padding: "8px 20px",
              borderRadius: 999,
            }}
          >
            {meta}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.15,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 600, color: "#ff8a8a" }}>
            {company}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
