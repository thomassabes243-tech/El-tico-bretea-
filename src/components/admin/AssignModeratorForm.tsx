"use client";

import { useActionState, useState, useTransition } from "react";
import { Search, UserPlus, X, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  assignModerator,
  assignExistingUserAsModerator,
  searchAssignableUsers,
  type AssignModeratorState,
  type ModeratorSearchResult,
} from "@/app/admin/moderadores/actions";

const initialState: AssignModeratorState = { error: null };

const ROLE_LABEL: Record<ModeratorSearchResult["role"], string> = {
  WORKER: "Trabajador",
  COMPANY: "Empresa",
  MODERATOR: "Ya es moderador",
};

export function AssignModeratorForm({ rooms }: { rooms: { id: string; name: string }[] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ModeratorSearchResult[]>([]);
  const [selected, setSelected] = useState<ModeratorSearchResult | null>(null);
  const [chatRoomId, setChatRoomId] = useState(rooms[0]?.id ?? "");
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignOk, setAssignOk] = useState(false);
  const [isSearching, startSearch] = useTransition();
  const [isAssigning, startAssign] = useTransition();
  const [showNewAccount, setShowNewAccount] = useState(false);

  const [newAccountState, newAccountAction, isCreating] = useActionState(assignModerator, initialState);

  function handleQueryChange(value: string) {
    setQuery(value);
    setSelected(null);
    setAssignOk(false);
    setAssignError(null);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    startSearch(async () => {
      const found = await searchAssignableUsers(value);
      setResults(found);
    });
  }

  function handleAssign() {
    if (!selected || !chatRoomId) return;
    setAssignError(null);
    setAssignOk(false);
    startAssign(async () => {
      const result = await assignExistingUserAsModerator(selected.id, chatRoomId);
      if (result.error) {
        setAssignError(result.error);
      } else {
        setAssignOk(true);
        setSelected(null);
        setQuery("");
        setResults([]);
      }
    });
  }

  return (
    <Card className="mt-5 p-4">
      <h2 className="flex items-center gap-2 text-sm font-bold text-navy-900">
        <UserPlus className="h-4 w-4" /> Asignar moderador a una sala
      </h2>
      <p className="mt-1 text-xs text-navy-800/50">
        Buscá a la persona por nombre o correo -- puede ser un trabajador o empresa que ya
        tiene cuenta en la app. Sigue siendo trabajador/empresa como siempre, solo que además
        va a poder moderar la sala que le asignes.
      </p>

      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-800/35" />
        <input
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Nombre o correo de la persona..."
          className="h-10 w-full rounded-lg border border-sand-200 pl-9 pr-3 text-sm"
        />
      </div>

      {isSearching && <p className="mt-2 text-xs text-navy-800/50">Buscando...</p>}

      {!selected && results.length > 0 && (
        <div className="mt-2 flex flex-col gap-1.5">
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setSelected(r);
                setResults([]);
              }}
              className="flex items-center justify-between gap-2 rounded-lg border border-sand-200 px-3 py-2 text-left text-sm hover:border-navy-700/40 hover:bg-sand-100"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-navy-900">
                  {r.displayName ?? r.email}
                </span>
                {r.displayName && <span className="block truncate text-xs text-navy-800/50">{r.email}</span>}
              </span>
              <Badge tone={r.role === "MODERATOR" ? "neutral" : "navy"}>{ROLE_LABEL[r.role]}</Badge>
            </button>
          ))}
        </div>
      )}

      {!isSearching && query.trim().length >= 2 && results.length === 0 && !selected && (
        <p className="mt-2 text-xs text-navy-800/50">No encontramos ninguna cuenta con ese nombre o correo.</p>
      )}

      {selected && (
        <div className="mt-3 flex flex-col gap-3 rounded-xl border border-navy-700/20 bg-navy-900/[0.03] p-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-navy-900">{selected.displayName ?? selected.email}</p>
              <Badge tone="navy">{ROLE_LABEL[selected.role]}</Badge>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="ml-auto text-navy-800/40 hover:text-mx-red-600"
                title="Quitar selección"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            {selected.displayName && <p className="text-xs text-navy-800/50">{selected.email}</p>}
          </div>
          <div>
            <label className="text-xs font-semibold text-navy-800/60">Sala</label>
            <select
              value={chatRoomId}
              onChange={(e) => setChatRoomId(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-sand-200 px-3 text-sm"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <Button type="button" size="sm" onClick={handleAssign} disabled={isAssigning}>
            {isAssigning ? "Asignando..." : "Asignar"}
          </Button>
        </div>
      )}

      {assignError && (
        <p className="mt-2.5 rounded-lg bg-mx-red-100 px-3 py-2 text-xs font-medium text-mx-red-700">
          {assignError}
        </p>
      )}
      {assignOk && (
        <p className="mt-2.5 rounded-lg bg-success-600/10 px-3 py-2 text-xs font-medium text-success-600">
          Listo, ya puede moderar esa sala.
        </p>
      )}

      <button
        type="button"
        onClick={() => setShowNewAccount((v) => !v)}
        className="mt-4 flex items-center gap-1 text-xs font-semibold text-navy-800/60 hover:text-navy-900"
      >
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showNewAccount ? "rotate-180" : ""}`} />
        ¿La persona no tiene cuenta todavía? Creale una cuenta nueva de moderador
      </button>

      {showNewAccount && (
        <form action={newAccountAction} className="mt-3 flex flex-col gap-3 border-t border-sand-200 pt-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-xs font-semibold text-navy-800/60">Correo (nuevo, sin cuenta previa)</label>
            <input
              name="email"
              type="email"
              required
              placeholder="moderador@correo.com"
              className="mt-1 h-10 w-full rounded-lg border border-sand-200 px-3 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-navy-800/60">Contraseña</label>
            <input
              name="password"
              type="text"
              placeholder="mínimo 8 caracteres"
              className="mt-1 h-10 w-full rounded-lg border border-sand-200 px-3 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-navy-800/60">Sala</label>
            <select name="chatRoomId" required defaultValue={rooms[0]?.id} className="mt-1 h-10 w-full rounded-lg border border-sand-200 px-3 text-sm">
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <Button type="submit" size="sm" variant="outline" disabled={isCreating}>
            {isCreating ? "Creando..." : "Crear y asignar"}
          </Button>
        </form>
      )}
      {showNewAccount && newAccountState.error && (
        <p className="mt-2.5 rounded-lg bg-mx-red-100 px-3 py-2 text-xs font-medium text-mx-red-700">
          {newAccountState.error}
        </p>
      )}
    </Card>
  );
}
