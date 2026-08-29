import { Document, Page, View, Text, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { WorkerProfile, WorkerReference } from "@prisma/client";
import { LABOR_CATEGORIES, AVAILABILITY_OPTIONS, JOB_TYPES } from "@/lib/constants";

function labelFor(list: readonly { value: string; label: string }[], value: string) {
  return list.find((i) => i.value === value)?.label ?? value;
}

const NAVY = "#0a2647";
const RED = "#ce1126";
const GRAY = "#4b5563";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1f2937" },
  header: { borderBottom: `2 solid ${NAVY}`, paddingBottom: 12, marginBottom: 16 },
  name: { fontSize: 22, fontWeight: 700, color: NAVY },
  subtitle: { fontSize: 12, color: RED, marginTop: 2, fontWeight: 700 },
  meta: { fontSize: 9, color: GRAY, marginTop: 4 },
  section: { marginBottom: 12 },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: NAVY,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
    borderBottom: "1 solid #dde3ec",
    paddingBottom: 2,
  },
  text: { fontSize: 10, color: "#1f2937", lineHeight: 1.5 },
  referenceRow: { fontSize: 10, marginBottom: 2 },
  premiumBadge: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "#f1e8f9",
    color: "#4a2472",
    fontSize: 8,
    fontWeight: 700,
  },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, fontSize: 8, color: "#9ca3af", textAlign: "center" },
  attachmentTitle: { fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 10 },
  attachmentImage: { maxWidth: "100%", maxHeight: 700, objectFit: "contain" },
});

type WorkerWithReferences = WorkerProfile & { references: WorkerReference[] };

function CvDocument({
  worker,
  criminalRecordImage,
}: {
  worker: WorkerWithReferences;
  criminalRecordImage?: Buffer;
}) {
  const studies = [worker.education, worker.degrees, worker.courses, worker.certifications]
    .filter(Boolean)
    .join(" · ");

  return (
    <Document title={`CV - ${worker.fullName}`} author="El Mexa Chamba">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{worker.fullName}</Text>
          <Text style={styles.subtitle}>
            {worker.profession} · {labelFor(LABOR_CATEGORIES, worker.laborCategory)}
          </Text>
          <Text style={styles.meta}>
            {worker.residence} · {worker.yearsExperience} años de experiencia
          </Text>
          {worker.isPremium && <Text style={styles.premiumBadge}>✦ PERFIL PREMIUM</Text>}
        </View>

        {(worker.workExperience || worker.companiesWorkedAt || worker.previousPositions) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experiencia</Text>
            {worker.workExperience && <Text style={styles.text}>{worker.workExperience}</Text>}
            {worker.companiesWorkedAt && (
              <Text style={styles.text}>Empresas donde trabajó: {worker.companiesWorkedAt}</Text>
            )}
            {worker.previousPositions && (
              <Text style={styles.text}>Puestos anteriores: {worker.previousPositions}</Text>
            )}
          </View>
        )}

        {studies && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estudios</Text>
            <Text style={styles.text}>{studies}</Text>
          </View>
        )}

        {worker.skills && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habilidades</Text>
            <Text style={styles.text}>{worker.skills}</Text>
          </View>
        )}

        {worker.languages && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Idiomas</Text>
            <Text style={styles.text}>{worker.languages}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disponibilidad</Text>
          <Text style={styles.text}>
            {labelFor(AVAILABILITY_OPTIONS, worker.availability)} ·{" "}
            {labelFor(JOB_TYPES, worker.jobTypeSought)}
            {worker.willingToRelocate ? " · Disponible para trasladarse" : ""}
          </Text>
        </View>

        {worker.references.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Referencias laborales</Text>
            {worker.references.map((r) => (
              <Text key={r.id} style={styles.referenceRow}>
                {r.name} — {r.company}
                {r.phone ? ` · ${r.phone}` : ""}
              </Text>
            ))}
          </View>
        )}

        <Text style={styles.footer}>
          Generado por El Mexa Chamba · mexicosinhambre.com · Este documento refleja el perfil al
          momento de la descarga.
        </Text>
      </Page>

      {criminalRecordImage && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.attachmentTitle}>Carta de antecedentes penales</Text>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image (PDF renderer), not an HTML img; has no alt prop */}
          <Image
            style={styles.attachmentImage}
            src={{ data: criminalRecordImage, format: "jpg" }}
          />
        </Page>
      )}
    </Document>
  );
}

export async function generateCvPdfBuffer(
  worker: WorkerWithReferences,
  criminalRecordImage?: Buffer
): Promise<Buffer> {
  return renderToBuffer(<CvDocument worker={worker} criminalRecordImage={criminalRecordImage} />);
}
