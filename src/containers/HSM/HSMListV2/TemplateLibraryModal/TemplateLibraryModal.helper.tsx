import { TemplateLibraryEntry, parseContainerMeta } from '../../HSMV2/HSMV2.helper';

export type { TemplateLibraryEntry };

// The library API returns no unique id per entry, and real catalogs contain
// entries that share the same elementName (same name offered per language,
// or plain duplicates from the BSP) — `libraryIndex` (position in the
// Utility-filtered list) is what selection/keys are tracked by instead, since
// elementName alone can't tell two such rows apart.
export interface IndexedLibraryEntry extends TemplateLibraryEntry {
  libraryIndex: number;
}

// Meta's library is Utility-only for now — there's no Authentication tab to
// switch to, so entries outside it are simply never shown.
const UTILITY_CATEGORY = 'UTILITY';

export const filterUtilityEntries = (entries: TemplateLibraryEntry[] = []): IndexedLibraryEntry[] =>
  entries
    .filter((entry) => entry.category === UTILITY_CATEGORY)
    .map((entry, index) => ({ ...entry, libraryIndex: index }));

export const usecaseLabel = (usecase: string) => {
  const label = usecase.split('_').join(' ').toLowerCase();
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const languageDisplayName = (code?: string | null): string => {
  if (!code) return '';
  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });
    return displayNames.of(code) || code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
};

// unique language codes present across the (already Utility-only) catalog,
// used to populate the language filter dropdown.
export const getLanguageOptions = (entries: IndexedLibraryEntry[] = []): string[] => {
  const codes = new Set<string>();
  entries.forEach((entry) => {
    if (entry.languageCode) codes.add(entry.languageCode);
  });
  return Array.from(codes).sort();
};

export const groupByUsecase = (entries: IndexedLibraryEntry[] = []): Record<string, IndexedLibraryEntry[]> => {
  const groups: Record<string, IndexedLibraryEntry[]> = {};
  entries.forEach((entry) => {
    const key = entry.usecase || 'OTHER';
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  });
  return groups;
};

export interface LibraryGroup {
  usecase: string;
  entries: IndexedLibraryEntry[];
  // true when the language filter leaves nothing in this use case — the group
  // still renders (dimmed, with a hint) instead of disappearing, so the
  // catalog doesn't look broken/incomplete as the user narrows by language.
  // (Search-empty groups are dropped by the caller, not flagged here.)
  isEmpty: boolean;
}

export const buildLibraryGroups = (
  utilityEntries: IndexedLibraryEntry[],
  language: string,
  search: string
): LibraryGroup[] => {
  const grouped = groupByUsecase(utilityEntries);
  const searchTerm = search.trim().toLowerCase();

  return Object.keys(grouped)
    .sort()
    .map((usecase) => {
      const usecaseEntries = grouped[usecase];
      const languageFiltered = language
        ? usecaseEntries.filter((entry) => entry.languageCode === language)
        : usecaseEntries;
      const visible = searchTerm
        ? languageFiltered.filter((entry) => (entry.elementName || '').toLowerCase().includes(searchTerm))
        : languageFiltered;

      return {
        usecase,
        entries: visible,
        isEmpty: languageFiltered.length === 0,
      };
    });
};

export const countVisibleEntries = (groups: LibraryGroup[]) =>
  groups.reduce((sum, group) => sum + group.entries.length, 0);

// Adapts a library entry into the same "variant" shape HSMListV2's row hover
// preview already renders via `messagePreview` — reusing that component
// instead of building a second preview renderer.
export const buildPreviewVariant = (entry: TemplateLibraryEntry) => {
  const containerMeta = parseContainerMeta(entry.containerMeta);
  const containerButtons = Array.isArray(containerMeta.buttons) ? containerMeta.buttons : [];

  return {
    body: entry.body || '',
    footer: containerMeta.footer || '',
    language: { locale: entry.languageCode },
    buttons: containerButtons.length ? JSON.stringify(containerButtons) : null,
    MessageMedia: null,
    type: 'TEXT',
  };
};
