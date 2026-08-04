import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { FormControl, MenuItem, Select } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router';
import { t } from 'i18next';

import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { SearchBar } from 'components/UI/SearchBar/SearchBar';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { TEMPLATE_LIBRARY } from 'graphql/queries/Template';
import { messagePreview } from '../HSMListV2.helper';

import {
  IndexedLibraryEntry,
  TemplateLibraryEntry,
  buildLibraryGroups,
  buildPreviewVariant,
  countVisibleEntries,
  filterUtilityEntries,
  getLanguageOptions,
  languageDisplayName,
  usecaseLabel,
} from './TemplateLibraryModal.helper';
import styles from './TemplateLibraryModal.module.css';

export interface TemplateLibraryModalProps {
  open: boolean;
  onClose: () => void;
}

export const TemplateLibraryModal = ({ open, onClose }: TemplateLibraryModalProps) => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('');
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [selectedEntry, setSelectedEntry] = useState<IndexedLibraryEntry | null>(null);

  // cache-and-network: org active-language/category filtering happens server-side and
  // can change between opens (e.g. an admin adding a language), so a stale Apollo cache
  // entry must not be served as the final answer — but we still paint instantly from
  // cache first and let the network response refresh it, since the catalog is large.
  const { data, loading } = useQuery(TEMPLATE_LIBRARY, { skip: !open, fetchPolicy: 'cache-and-network' });
  const entries: TemplateLibraryEntry[] = data?.templateLibrary || [];
  const utilityEntries = filterUtilityEntries(entries);
  const languageOptions = getLanguageOptions(utilityEntries);
  const groups = buildLibraryGroups(utilityEntries, language, search);
  const shownCount = countVisibleEntries(groups);
  // When a search term is active, only surface groups that actually contain a
  // match — hide the "No … match" placeholder groups entirely. The dimmed
  // empty-group hint is intentionally kept for the language filter (no search),
  // so narrowing by language doesn't make the catalog look broken.
  const visibleGroups = search.trim() ? groups.filter((group) => group.entries.length > 0) : groups;

  const toggleGroup = (usecase: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(usecase)) {
        next.delete(usecase);
      } else {
        next.add(usecase);
      }
      return next;
    });
  };

  const handleClose = () => {
    setSearch('');
    setSelectedEntry(null);
    onClose();
  };

  const handleCreateFromTemplate = () => {
    if (!selectedEntry) return;
    const libraryTemplate = selectedEntry;
    handleClose();
    navigate('/template/add', { state: { libraryTemplate } });
  };

  return (
    <DialogBox
      title={t('Template Library')}
      open={open}
      handleCancel={handleClose}
      handleOk={handleCreateFromTemplate}
      disableOk={!selectedEntry}
      buttonCancel={t('Close')}
      buttonOk={t('Create from template')}
      fullWidth
      customStyles={{ content: styles.ModalContent, paper: styles.WidePaper }}
    >
      <p className={styles.Subtitle}>{t('Browse all pre-approved WhatsApp message templates')}</p>
      <div className={styles.Layout}>
        <div className={styles.LeftPanel}>
          <p className={styles.SectionLabel}>{t('Select a Template')}</p>
          <div className={styles.FiltersRow}>
            <SearchBar
              searchMode
              searchVal={search}
              handleChange={(event: any) => setSearch(event.target.value)}
              handleSubmit={(event) => event.preventDefault()}
              onReset={() => setSearch('')}
              className={styles.SearchBarField}
            />
            <FormControl className={styles.LanguageFormControl}>
              <Select
                aria-label={t('Filter by language')}
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className={styles.LanguageDropDown}
                displayEmpty
                data-testid="library-language-filter"
              >
                <MenuItem value="">{t('All languages')}</MenuItem>
                {languageOptions.map((code) => (
                  <MenuItem key={code} value={code}>
                    {languageDisplayName(code)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {loading ? (
            <Loading />
          ) : (
            <div className={styles.GroupList} data-testid="library-group-list">
              {visibleGroups.length === 0 && <p className={styles.EmptyText}>{t('No templates found.')}</p>}
              {visibleGroups.map((group) => {
                const isOpen = !collapsed.has(group.usecase);
                return (
                  <div
                    key={group.usecase}
                    className={`${styles.Group} ${group.isEmpty ? styles.GroupEmpty : ''}`}
                    data-testid="library-group"
                  >
                    <button
                      type="button"
                      className={styles.GroupHeader}
                      onClick={() => toggleGroup(group.usecase)}
                      data-testid={`library-group-header-${group.usecase}`}
                    >
                      <span className={styles.GroupTitle}>{usecaseLabel(group.usecase)}</span>
                      <span className={styles.GroupCount}>({group.entries.length})</span>
                      <ExpandMoreIcon className={isOpen ? styles.ChevronOpen : ''} />
                    </button>
                    {isOpen && group.isEmpty && (
                      <p className={styles.GroupEmptyHint}>
                        {t('No {{group}} templates in {{language}}', {
                          group: usecaseLabel(group.usecase),
                          language: languageDisplayName(language),
                        })}
                      </p>
                    )}
                    {isOpen &&
                      group.entries.map((entry) => {
                        const isSelected = selectedEntry?.libraryIndex === entry.libraryIndex;
                        return (
                          <button
                            key={entry.libraryIndex}
                            type="button"
                            className={`${styles.EntryRow} ${isSelected ? styles.EntryRowSelected : ''}`}
                            onClick={() => setSelectedEntry(entry)}
                            data-testid={`library-entry-${entry.elementName}`}
                          >
                            <span className={styles.EntryName}>{entry.elementName}</span>
                            <span className={`${styles.Radio} ${isSelected ? styles.RadioSelected : ''}`} />
                          </button>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          )}
          <p className={styles.FooterCount}>
            {t('Showing {{shown}} of {{total}} templates', {
              shown: String(shownCount),
              total: String(utilityEntries.length),
            })}
          </p>
        </div>

        <div className={styles.RightPanel}>
          <div className={styles.PreviewBox}>
            {selectedEntry ? (
              messagePreview(buildPreviewVariant(selectedEntry), selectedEntry.elementName || '')
            ) : (
              <p className={styles.PreviewPlaceholder}>{t('Select a template to preview it here.')}</p>
            )}
          </div>
          {selectedEntry && (
            <p className={styles.PreviewHelperText}>
              {t(
                'Using this template pre-fills the message body, footer, and button fields. All fields stay fully editable.'
              )}
            </p>
          )}
        </div>
      </div>
    </DialogBox>
  );
};

export default TemplateLibraryModal;
