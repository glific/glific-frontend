import { useMutation, useQuery } from '@apollo/client';
import { FormControl, MenuItem, Select } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import AppsIcon from '@mui/icons-material/Apps';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { t } from 'i18next';

import { BULK_APPLY_SAMPLE_LINK } from 'config';
import { setNotification } from 'common/notification';
import { exportCsvFile, getFileExtension } from 'common/utils';
import { templateInfo } from 'common/HelpData';

import { Button } from 'components/UI/Form/Button/Button';
import HelpIcon from 'components/UI/HelpIcon/HelpIcon';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { SearchBar } from 'components/UI/SearchBar/SearchBar';
import HSMExpandableTable from 'components/UI/HSMExpandableTable/HSMExpandableTable';

import { GET_TAGS } from 'graphql/queries/Tags';
import { FILTER_TEMPLATES, GET_HSM_CATEGORIES } from 'graphql/queries/Template';
import { BULK_APPLY_TEMPLATES, SYNC_HSM_TEMPLATES } from 'graphql/mutations/Template';

import type { GroupedTemplate, LanguageVariant } from './HSMList.types';
import styles from './HSMListV2.module.css';

const groupTemplates = (flatList: any[]): GroupedTemplate[] => {
  const map = new Map<string, GroupedTemplate>();
  for (const item of flatList) {
    if (!map.has(item.shortcode)) {
      map.set(item.shortcode, {
        shortcode: item.shortcode,
        label: item.label,
        category: item.category,
        tag: item.tag ?? null,
        languageVariants: [],
      });
    }
    const variant: LanguageVariant = {
      id: item.id,
      bspId: item.bspId ?? null,
      body: item.body,
      category: item.category,
      language: item.language,
      status: item.status,
      quality: item.quality ?? null,
      reason: item.reason ?? null,
      updatedAt: item.updatedAt,
      isActive: item.isActive,
    };
    map.get(item.shortcode)!.languageVariants.push(variant);
  }
  return Array.from(map.values());
};

const HSMListV2 = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTagId, setSelectedTagId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: tagsData } = useQuery(GET_TAGS, { fetchPolicy: 'network-only' });
  const { data: categoriesData } = useQuery(GET_HSM_CATEGORIES);

  const { data, loading } = useQuery(FILTER_TEMPLATES, {
    variables: {
      filter: { isHsm: true },
      opts: { limit: 500, offset: 0, orderWith: 'label', order: 'ASC' },
    },
    fetchPolicy: 'cache-and-network',
  });

  const [syncHsmTemplates] = useMutation(SYNC_HSM_TEMPLATES, { fetchPolicy: 'network-only' });
  const [bulkApplyTemplates] = useMutation(BULK_APPLY_TEMPLATES);

  useEffect(() => {
    const tagId = searchParams.get('tag');
    setSelectedTagId(tagId ?? '');
  }, [searchParams]);

  const templates = useMemo(() => {
    const flat: any[] = data?.sessionTemplates ?? [];
    const grouped = groupTemplates(flat);

    return grouped.filter((g) => {
      if (selectedCategory && !g.languageVariants.some((v) => v.category === selectedCategory)) return false;
      if (selectedTagId && g.tag?.id !== selectedTagId) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        if (!g.label.toLowerCase().includes(q) && !g.shortcode.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [data, selectedCategory, selectedTagId, searchTerm]);

  const handleSync = async () => {
    setSyncLoading(true);
    try {
      const { data: syncData } = await syncHsmTemplates();
      const errors = syncData?.syncHsmTemplate?.errors;
      if (!syncData?.syncHsmTemplate || errors?.length) {
        setNotification(t('Sorry, failed to sync HSM updates. Please try again.'), 'warning');
      } else {
        setNotification(t('HSM queued for sync. Check notifications for updates.'), 'success');
      }
    } catch {
      setNotification(t('Sorry, failed to sync HSM updates. Please try again.'), 'warning');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const media = event.target.files?.[0];
    if (!media) return;
    const extension = getFileExtension(media.name);
    if (extension !== 'csv') {
      setNotification(t('Please upload a valid CSV file'), 'warning');
      return;
    }
    setImporting(true);
    const fileReader = new FileReader();
    fileReader.onload = () => handleBulkApply(fileReader.result as string);
    fileReader.readAsText(media);
    event.target.value = '';
  };

  const handleBulkApply = async (result: string) => {
    try {
      const { data: bulkData } = await bulkApplyTemplates({ variables: { data: result } });
      const response = bulkData?.bulkApplyTemplates;
      if (response?.csv_rows) exportCsvFile(response.csv_rows, 'result');
      if (response?.errors?.length) {
        setNotification(t('Templates were processed with errors. Please check the csv file for details.'), 'warning');
      } else if (response) {
        setNotification(t('Templates applied successfully. Please check the csv file for the results'));
      }
    } catch {
      setNotification(t('An error occured! Please check the format of the file'), 'warning');
    } finally {
      setImporting(false);
    }
  };

  if (importing) {
    return <Loading message={t('Please wait while we process all the templates')} />;
  }

  const categories: string[] = categoriesData?.whatsappHsmCategories ?? [];

  return (
    <div className={styles.Container}>
      <div className={styles.Header}>
        <div className={styles.TitleSection}>
          <div className={styles.TitleRow}>
            <h1 className={styles.Title}>{t('Templates')}</h1>
            <HelpIcon helpData={templateInfo} />
          </div>
          <p className={styles.Subtitle}>{t('Please go through all the templates below')}</p>
        </div>

        <div className={styles.HeaderActions}>
          <input ref={fileInputRef} type="file" accept=".csv" hidden onChange={handleFileChange} data-testid="import" />
          <Button
            variant="outlined"
            className={styles.OutlinedButton}
            startIcon={<SyncIcon fontSize="small" />}
            onClick={() => fileInputRef.current?.click()}
            data-testid="bulkApply"
          >
            {t('Bulk apply')}
          </Button>

          <div className={styles.SyncWrapper}>
            <Button
              variant="outlined"
              className={styles.OutlinedButton}
              startIcon={<SyncIcon fontSize="small" />}
              loading={syncLoading}
              onClick={handleSync}
              data-testid="syncHsm"
            >
              {t('Sync HSM')}
            </Button>
            <a href={BULK_APPLY_SAMPLE_LINK} target="_blank" rel="noreferrer" className={styles.ViewSample}>
              {t('View sample')}
            </a>
          </div>

          <Button
            variant="outlined"
            className={styles.OutlinedButton}
            startIcon={<AppsIcon fontSize="small" />}
            onClick={() => {}}
            data-testid="templateLibrary"
          >
            {t('Template library')}
          </Button>

          <Button
            variant="contained"
            className={styles.CreateButton}
            onClick={() => navigate('/template/add')}
            data-testid="createTemplate"
          >
            + {t('Create')}
          </Button>
        </div>
      </div>

      <div className={styles.FilterBar}>
        <div className={styles.FilterLeft}>
          <FormControl>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.DropDown}
              displayEmpty
              data-testid="categoryFilter"
            >
              <MenuItem value="">{t('All Categories')}</MenuItem>
              {categories.map((cat: string) => (
                <MenuItem key={cat} value={cat}>
                  {cat.charAt(0) + cat.slice(1).toLowerCase().replace(/_/g, ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <Select
              value={selectedTagId}
              onChange={(e) => setSearchParams({ tag: e.target.value })}
              className={styles.DropDown}
              displayEmpty
              data-testid="tagFilter"
            >
              <MenuItem value="">{t('All Tags')}</MenuItem>
              {(tagsData?.tags ?? []).map((tag: any) => (
                <MenuItem key={tag.id} value={tag.id}>
                  {tag.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className={styles.FilterRight}>
          <SearchBar
            searchMode={searchMode}
            searchVal={searchTerm}
            iconFront
            onReset={() => {
              setSearchTerm('');
              setSearchMode(false);
            }}
            handleChange={(e: any) => {
              setSearchTerm(e.target.value);
              setSearchMode(true);
            }}
            className={styles.SearchBar}
          />
          <button className={styles.FilterIconButton} type="button" aria-label={t('Filter')}>
            &#9776;
          </button>
        </div>
      </div>

      <div className={styles.TableWrapper}>
        {loading && !data ? <Loading /> : <HSMExpandableTable templates={templates} />}
      </div>
    </div>
  );
};

export default HSMListV2;
