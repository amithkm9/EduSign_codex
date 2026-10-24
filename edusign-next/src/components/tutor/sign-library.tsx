"use client";
import { useMemo, useState } from "react";
import { Hand, Search } from "lucide-react";
import { useLocale } from "@/components/i18n/locale-provider";
import project from "@/lib/data/project-sign-videos.json";
import lsf from "@/lib/data/sign-videos.json";
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function SignLibrary({
  collection,
  disabled,
  onSelect,
}: {
  collection: "project" | "lsf";
  disabled: boolean;
  onSelect(word: string): void;
}) {
  const { t, locale } = useLocale();
  const [search, setSearch] = useState("");
  const catalog = collection === "project" ? project : lsf;
  const results = useMemo(
    () =>
      catalog.filter((item) =>
        item.aliases.some((alias) =>
          normalize(alias).includes(normalize(search)),
        ),
      ),
    [catalog, search],
  );
  return (
    <details className="group">
      <summary className="cursor-pointer py-2 text-xs font-medium text-muted-foreground">
        {t("Parcourir les vidéos")}{" "}
        <span className="text-muted-foreground">({catalog.length})</span>
      </summary>
      <div className="pb-2 pt-4">
        <label className="flex items-center gap-2 rounded-xl border px-3 py-2">
          <Search size={16} />
          <span className="sr-only">
            {t("Rechercher dans la bibliothèque")}
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Rechercher un mot en français ou en anglais…")}
            className="min-w-0 flex-1 bg-transparent text-xs outline-none"
          />
        </label>
        <p className="mt-2 text-[11px] text-muted-foreground" role="status">
          {results.length} {t("vidéo(s) trouvée(s)")}
        </p>
        <div className="mt-2 grid max-h-60 grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6 overflow-y-auto">
          {results.slice(0, 60).map((item) => (
            <button
              key={item.id}
              disabled={disabled}
              onClick={() => onSelect(item.label[locale])}
              className="flex min-h-10 items-center gap-2 rounded-lg bg-muted/40 px-2 py-2 text-left text-xs hover:bg-primary/10 disabled:opacity-50"
            >
              <Hand size={13} className="shrink-0 text-primary" />
              {item.label[locale]}
            </button>
          ))}
        </div>
        {results.length > 60 && (
          <p className="mt-2 text-xs text-muted-foreground">
            {t("Précisez votre recherche pour voir les autres vidéos.")}
          </p>
        )}
      </div>
    </details>
  );
}
