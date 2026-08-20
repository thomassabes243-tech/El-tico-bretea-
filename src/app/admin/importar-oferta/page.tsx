import { ImportarOfertaForm } from "@/components/admin/ImportarOfertaForm";

export default function ImportarOfertaPage() {
  return (
    <div>
      <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Importar oferta</h1>
      <p className="mt-1 text-sm text-navy-800/60">
        Importa una oferta desde Facebook o WhatsApp: pegá el texto de la publicación y/o subí
        una imagen, la IA completa los datos y los revisás antes de publicar. Queda en el mismo
        listado que las vacantes publicadas normalmente por una empresa.
      </p>

      <div className="mt-5">
        <ImportarOfertaForm />
      </div>
    </div>
  );
}
