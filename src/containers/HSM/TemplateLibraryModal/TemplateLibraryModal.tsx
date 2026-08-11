import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router';
import { t } from 'i18next';

import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { SearchBar } from 'components/UI/SearchBar/SearchBar';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { Dropdown } from 'components/UI/Form/Dropdown/Dropdown';
import { setErrorMessage } from 'common/notification';
import { TEMPLATE_LIBRARY } from 'graphql/queries/Template';
import { USER_LANGUAGES } from 'graphql/queries/Organization';
import { messagePreview } from '../HSMListV2/HSMListV2.helper';

import {
  IndexedLibraryEntry,
  TemplateLibraryEntry,
  buildLibraryGroups,
  buildPreviewVariant,
  countVisibleEntries,
  getLanguageOptions,
  indexLibraryEntries,
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedEntry, setSelectedEntry] = useState<IndexedLibraryEntry | null>(null);
  const [defaultLanguageApplied, setDefaultLanguageApplied] = useState(false);

  const { data, loading, error } = useQuery(TEMPLATE_LIBRARY, { skip: !open, fetchPolicy: 'cache-and-network' });
  const { data: orgLanguagesData } = useQuery(USER_LANGUAGES, { skip: !open });
  const showLoading = loading && !data;

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
    }
  }, [error]);

  const entries: TemplateLibraryEntry[] = data?.templateLibrary || [];
  const indexedEntries = indexLibraryEntries(entries);
  const languageOptions = getLanguageOptions(indexedEntries);

  const organization = orgLanguagesData?.currentUser?.user?.organization;
  const orgDefaultLanguageCode = organization?.activeLanguages?.find(
    (activeLanguage: any) => activeLanguage.id === organization?.defaultLanguage?.id
  )?.locale;

  useEffect(() => {
    if (!defaultLanguageApplied && orgDefaultLanguageCode && languageOptions.includes(orgDefaultLanguageCode)) {
      setLanguage(orgDefaultLanguageCode);
      setDefaultLanguageApplied(true);
    }
  }, [defaultLanguageApplied, orgDefaultLanguageCode, languageOptions]);
  const groups = buildLibraryGroups(indexedEntries, language, search);
  const shownCount = countVisibleEntries(groups);
  const languageDropdownOptions = [
    { id: '', label: t('All languages') },
    ...languageOptions.map((code) => ({ id: code, label: languageDisplayName(code) })),
  ];
  const isSearching = Boolean(search.trim());
  const visibleGroups = isSearching ? groups.filter((group) => group.entries.length > 0) : groups;

  const toggleGroup = (usecase: string) => {
    setExpandedGroups((prev) => {
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
    setLanguage('');
    setExpandedGroups(new Set());
    setDefaultLanguageApplied(false);
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
      customStyles={{ content: styles.ModalContent, paper: styles.WidePaper, root: styles.AboveSimulator }}
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
            <div className={styles.LanguageFormControl}>
              <Dropdown
                placeholder=""
                options={languageDropdownOptions}
                field={{
                  name: 'language',
                  value: language,
                  onChange: (event: any) => setLanguage(event.target.value),
                  'aria-label': t('Filter by language'),
                  'data-testid': 'library-language-filter',
                  className: styles.LanguageDropDown,
                  displayEmpty: true,
                }}
                menuProps={{ className: styles.LanguageMenu }}
              />
            </div>
          </div>

          {showLoading ? (
            <Loading />
          ) : (
            <div className={styles.GroupList} data-testid="library-group-list">
              {visibleGroups.length === 0 && <p className={styles.EmptyText}>{t('No templates found.')}</p>}
              {visibleGroups.map((group) => {
                const isOpen = isSearching || expandedGroups.has(group.usecase);
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
              total: String(indexedEntries.length),
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
