// Rediseño visual (alcance acotado): DM Sans para toda la sección de
// Cotizaciones (headers + body) -- "contents" para no alterar el layout de
// flex/altura de cada página, solo aporta la fuente vía herencia de CSS.
export default function ServiciosLayout({ children }: { children: React.ReactNode }) {
  return <div className="contents font-dm-sans">{children}</div>;
}
