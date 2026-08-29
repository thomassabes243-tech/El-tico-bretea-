"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Loader2, Zap, ClipboardList } from "lucide-react";
import { SERVICE_CATEGORIES, PROJECT_MAX_QUOTES } from "@/lib/constants";
import { FieldWrapper, TextInput, Textarea, Select } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";

type Mode = "URGENTE" | "PROYECTO";

export function ServiceRequestForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("URGENTE");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [budgetLabel, setBudgetLabel] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareLocation = () => {
    if (!navigator.geolocation) {
      setError("Este navegador no soporta ubicación");
      return;
    }
    setGettingLocation(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setGettingLocation(false);
      },
      () => {
        setError("No se pudo obtener tu ubicación. Podés seguir sin compartirla.");
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const submit = async () => {
    if (submitting || !category || description.trim().length < 10 || !locationLabel.trim()) return;
    if (mode === "PROYECTO" && contactPhone.trim().length < 7) {
      setError("Ingresá un teléfono de contacto para proyectos");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/servicios/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          mode,
          description,
          locationLabel,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          budgetLabel: mode === "PROYECTO" ? budgetLabel : undefined,
          contactPhone: mode === "PROYECTO" ? contactPhone : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo enviar la solicitud");
      router.push(`/servicios/mis-solicitudes/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode("URGENTE")}
          className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-semibold ${
            mode === "URGENTE" ? "border-mx-red-600 bg-mx-red-100/50 text-mx-red-700" : "border-sand-200 text-navy-800/60"
          }`}
        >
          <Zap className="h-4 w-4" /> Urgente
        </button>
        <button
          type="button"
          onClick={() => setMode("PROYECTO")}
          className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-semibold ${
            mode === "PROYECTO" ? "border-mx-red-600 bg-mx-red-100/50 text-mx-red-700" : "border-sand-200 text-navy-800/60"
          }`}
        >
          <ClipboardList className="h-4 w-4" /> Proyecto grande
        </button>
      </div>
      <p className="-mt-2 text-xs text-navy-800/50">
        {mode === "URGENTE"
          ? "Para algo simple que necesitás resolver pronto."
          : `Para un proyecto con más detalle. Recibís hasta ${PROJECT_MAX_QUOTES} cotizaciones formales, y tu contacto solo se comparte con quien cotiza.`}
      </p>

      <FieldWrapper label="¿Qué tipo de servicio necesitás?" htmlFor="category">
        <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Seleccioná una categoría</option>
          {SERVICE_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.emoji} {cat.label}
            </option>
          ))}
        </Select>
      </FieldWrapper>

      <FieldWrapper label="Contanos qué necesitás" htmlFor="description">
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            mode === "URGENTE"
              ? 'Ej. "Se me dañó un enchufe y necesito que lo revisen mañana."'
              : 'Ej. "Necesito remodelar un baño completo, cambiar piso y plomería."'
          }
        />
      </FieldWrapper>

      <FieldWrapper label="Ubicación o zona" htmlFor="locationLabel">
        <TextInput
          id="locationLabel"
          value={locationLabel}
          onChange={(e) => setLocationLabel(e.target.value)}
          placeholder="Ej. Guadalajara, colonia Americana"
        />
      </FieldWrapper>

      {mode === "PROYECTO" && (
        <>
          <FieldWrapper label="Presupuesto estimado (opcional)" htmlFor="budgetLabel">
            <TextInput
              id="budgetLabel"
              value={budgetLabel}
              onChange={(e) => setBudgetLabel(e.target.value)}
              placeholder="Ej. $15,000 - $20,000 MXN"
            />
          </FieldWrapper>
          <FieldWrapper label="Tu teléfono de contacto" htmlFor="contactPhone">
            <TextInput
              id="contactPhone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="55 1234 5678"
            />
          </FieldWrapper>
          <p className="-mt-2 text-[11px] text-navy-800/45">
            Solo lo van a ver los profesionales que te manden una cotización, nunca aparece en el listado público.
          </p>
        </>
      )}

      <div className="flex items-center justify-between gap-3 rounded-xl border border-sand-200 p-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-navy-900">
            <MapPin className="h-3.5 w-3.5" /> Ubicación exacta (opcional)
          </p>
          <p className="text-[11px] text-navy-800/50">
            {coords ? "Compartida — se muestra la distancia a cada profesional." : "Si la compartís, los profesionales ven qué tan cerca están."}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={shareLocation} disabled={gettingLocation}>
          {gettingLocation ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {coords ? "Actualizar" : "Compartir"}
        </Button>
      </div>

      {error && <p className="text-xs font-medium text-mx-red-600">{error}</p>}

      <Button onClick={submit} disabled={submitting} fullWidth>
        {submitting ? "Enviando..." : "Enviar solicitud"}
      </Button>
    </div>
  );
}
