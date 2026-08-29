"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, MapPin, Loader2, FileText, User } from "lucide-react";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldWrapper, TextInput, Textarea } from "@/components/forms/FormField";
import { ProfilePhotoUpload } from "@/components/forms/ProfilePhotoUpload";
import { compressImageFile } from "@/lib/image-compress-client";

type Photo = { id: string; url: string };

export function ServiceProfileForm({
  initialOffersServices,
  initialCategories,
  initialZoneLabel,
  initialDescription,
  initialYearsExperience,
  initialContactPhone,
  initialLogoUrl,
  hasLocation,
  initialPhotos,
  initialPortfolioDocName,
  companyId,
}: {
  initialOffersServices: boolean;
  initialCategories: string[];
  initialZoneLabel: string;
  initialDescription: string;
  initialYearsExperience: number | null;
  initialContactPhone: string;
  initialLogoUrl: string | null;
  hasLocation: boolean;
  initialPhotos: Photo[];
  initialPortfolioDocName: string | null;
  companyId: string;
}) {
  const router = useRouter();
  const [offersServices, setOffersServices] = useState(initialOffersServices);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [zoneLabel, setZoneLabel] = useState(initialZoneLabel);
  const [description, setDescription] = useState(initialDescription);
  const [contactPhone, setContactPhone] = useState(initialContactPhone);
  const [yearsExperience, setYearsExperience] = useState(
    initialYearsExperience != null ? String(initialYearsExperience) : ""
  );
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [locationSet, setLocationSet] = useState(hasLocation);
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [portfolioDocName, setPortfolioDocName] = useState(initialPortfolioDocName);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);

  const toggleCategory = (value: string) => {
    setCategories((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/perfil/empresa/servicios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offersServices,
          serviceCategories: categories,
          serviceZoneLabel: zoneLabel,
          serviceDescription: description,
          serviceYearsExperience: yearsExperience.trim() === "" ? null : Number(yearsExperience),
          contactPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setSaving(false);
    }
  };

  const shareLocation = async () => {
    if (!navigator.geolocation) {
      setError("Este navegador no soporta ubicación");
      return;
    }
    setGettingLocation(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch("/api/perfil/empresa/servicios", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }),
          });
          if (!res.ok) throw new Error("No se pudo guardar la ubicación");
          setLocationSet(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : "No se pudo guardar la ubicación");
        } finally {
          setGettingLocation(false);
        }
      },
      () => {
        setError("No se pudo obtener tu ubicación. Revisá los permisos del navegador.");
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const compressed = await compressImageFile(file);
      const formData = new FormData();
      formData.append("file", compressed);
      const res = await fetch("/api/perfil/empresa/portafolio", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo subir la foto");
      setPhotos((prev) => [...prev, data.photo]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la foto");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/perfil/empresa/portafolio/${id}`, { method: "DELETE" });
  };

  const uploadDoc = async (file: File) => {
    setUploadingDoc(true);
    setError(null);
    try {
      if (file.type !== "application/pdf") {
        throw new Error("Solo se permiten archivos PDF");
      }
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/perfil/empresa/portafolio-doc", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo subir el archivo");
      setPortfolioDocName(data.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el archivo");
    } finally {
      setUploadingDoc(false);
    }
  };

  const removeDoc = async () => {
    setPortfolioDocName(null);
    await fetch("/api/perfil/empresa/portafolio-doc", { method: "DELETE" });
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col items-center gap-3 p-4">
        <ProfilePhotoUpload
          kind="empresa"
          initialUrl={initialLogoUrl}
          alt="Foto de perfil"
          shape="circle"
          fallback={
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-mx-red-600/[0.09] text-mx-red-600">
              <User className="h-8 w-8" />
            </div>
          }
        />
        <p className="text-xs text-navy-800/50">
          Esta foto se muestra en tu perfil público de Cotizaciones.
        </p>
      </Card>

      <Card className="flex items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm font-bold text-navy-900">Ofrecer servicios (Cotizaciones)</p>
          <p className="text-xs text-navy-800/50">
            Aparecés para clientes que buscan un servicio puntual, además de tus vacantes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOffersServices((v) => !v)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
            offersServices ? "bg-mx-red-600" : "bg-sand-200"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
              offersServices ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </Card>

      {offersServices && (
        <>
          <Card className="p-4">
            <p className="text-sm font-bold text-navy-900">Servicios que ofrecés</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => toggleCategory(cat.value)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    categories.includes(cat.value)
                      ? "border-mx-red-600 bg-mx-red-600 text-white"
                      : "border-sand-200 text-navy-800/70"
                  }`}
                >
                  <span>{cat.emoji}</span> {cat.label}
                </button>
              ))}
            </div>
          </Card>

          <Card className="flex flex-col gap-3 p-4">
            <FieldWrapper label="Teléfono de contacto" htmlFor="contactPhone">
              <TextInput
                id="contactPhone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="55 1234 5678"
              />
            </FieldWrapper>
            <FieldWrapper label="Zona de cobertura" htmlFor="serviceZoneLabel">
              <TextInput
                id="serviceZoneLabel"
                value={zoneLabel}
                onChange={(e) => setZoneLabel(e.target.value)}
                placeholder="Ej. Guadalajara y zona metropolitana"
              />
            </FieldWrapper>
            <FieldWrapper label="Años de experiencia" htmlFor="serviceYearsExperience">
              <TextInput
                id="serviceYearsExperience"
                type="number"
                min={0}
                max={60}
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                placeholder="Ej. 5"
              />
            </FieldWrapper>
            <FieldWrapper label="Descripción de tus servicios" htmlFor="serviceDescription">
              <Textarea
                id="serviceDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contá tu experiencia, qué tipo de trabajos hacés, etc."
              />
            </FieldWrapper>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-sand-200 p-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-navy-900">
                  <MapPin className="h-3.5 w-3.5" /> Ubicación base
                </p>
                <p className="text-[11px] text-navy-800/50">
                  {locationSet
                    ? "Guardada — se usa para calcular distancia con los clientes."
                    : "Sin guardar todavía. Necesaria para mostrar distancia en las solicitudes."}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={shareLocation}
                disabled={gettingLocation}
              >
                {gettingLocation ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                {locationSet ? "Actualizar" : "Compartir"}
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-navy-900">Fotos de trabajos realizados</p>
              <span className="text-xs text-navy-800/40">{photos.length}/8</span>
            </div>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {photos.map((photo) => (
                <div key={photo.id} className="relative aspect-square overflow-hidden rounded-lg">
                  <Image src={photo.url} alt="" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-navy-950/70 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {photos.length < 8 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-sand-200 text-xs text-navy-800/40"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "+ Foto"}
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadPhoto(file);
                e.target.value = "";
              }}
            />
          </Card>

          <Card className="p-4">
            <p className="text-sm font-bold text-navy-900">Portafolio en PDF</p>
            <p className="mt-0.5 text-xs text-navy-800/50">
              Opcional -- si ya tenés un portafolio, certificado o currículum armado, subilo tal
              cual en vez de reescribir todo acá arriba.
            </p>
            {portfolioDocName ? (
              <div className="mt-2.5 flex items-center gap-2.5 rounded-xl border border-sand-200 p-3">
                <FileText className="h-4.5 w-4.5 shrink-0 text-navy-800/40" />
                <a
                  href={`/api/perfil/empresa/portafolio-doc/publico/${companyId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 flex-1 truncate text-xs font-semibold text-mx-red-600"
                >
                  {portfolioDocName}
                </a>
                <button
                  type="button"
                  onClick={removeDoc}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-navy-800/40 hover:text-mx-red-600"
                  aria-label="Quitar PDF"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                disabled={uploadingDoc}
                className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-sand-200 p-3 text-xs font-semibold text-navy-800/50"
              >
                {uploadingDoc ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {uploadingDoc ? "Subiendo..." : "Subir PDF"}
              </button>
            )}
            <input
              ref={docInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadDoc(file);
                e.target.value = "";
              }}
            />
          </Card>
        </>
      )}

      {error && <p className="text-xs font-medium text-mx-red-600">{error}</p>}
      {saved && <p className="text-xs font-medium text-success-600">Guardado.</p>}

      <Button onClick={save} disabled={saving} fullWidth>
        {saving ? "Guardando..." : "Guardar cambios"}
      </Button>
    </div>
  );
}
