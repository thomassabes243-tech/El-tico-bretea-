"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldWrapper, TextInput } from "@/components/forms/FormField";

type Contact = { id: string; name: string; phone: string };

export function TrustedContactsManager({ initialContacts }: { initialContacts: Contact[] }) {
  const router = useRouter();
  const [contacts, setContacts] = useState(initialContacts);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addContact = async () => {
    if (submitting || name.trim().length < 2 || phone.trim().length < 7) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contactos-confianza", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo agregar el contacto");
      }
      const { contact } = await res.json();
      setContacts((prev) => [contact, ...prev]);
      setName("");
      setPhone("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  const removeContact = async (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/contactos-confianza/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <Card className="flex flex-col gap-3 p-4">
      <h2 className="flex items-center gap-2 text-sm font-bold text-navy-900">
        <UserPlus className="h-4 w-4" /> Contactos de confianza
      </h2>
      <p className="text-xs text-navy-800/50">
        Máximo 5. Se usan para compartir tu ubicación y avisar en caso de pánico — nunca se
        comparten con las empresas.
      </p>

      {contacts.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-sand-200 px-3 py-2 text-sm"
            >
              <span className="min-w-0 flex-1 truncate">
                <span className="font-semibold text-navy-900">{c.name}</span>{" "}
                <span className="text-navy-800/50">{c.phone}</span>
              </span>
              <button onClick={() => removeContact(c.id)} className="shrink-0 text-navy-800/40 hover:text-mx-red-600">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {contacts.length < 5 && (
        <div className="flex flex-col gap-2 border-t border-sand-200 pt-3">
          <div className="grid grid-cols-2 gap-2">
            <FieldWrapper label="Nombre" htmlFor="contact-name">
              <TextInput id="contact-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Mamá" />
            </FieldWrapper>
            <FieldWrapper label="Teléfono" htmlFor="contact-phone">
              <TextInput id="contact-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="55 1234 5678" />
            </FieldWrapper>
          </div>
          {error && <p className="text-xs font-medium text-mx-red-600">{error}</p>}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addContact}
            disabled={submitting || name.trim().length < 2 || phone.trim().length < 7}
          >
            {submitting ? "Agregando..." : "Agregar contacto"}
          </Button>
        </div>
      )}
    </Card>
  );
}
