"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Loader2 } from "lucide-react";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { FieldWrapper, TextInput, Textarea, Select } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";

export function ServiceRequestForm() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
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
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/servicios/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          description,
          locationLabel,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
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
          placeholder='Ej. "Se me dañó un enchufe y necesito que lo revisen mañana."'
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
