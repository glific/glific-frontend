import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';

import AddIcon from 'assets/images/add.svg?react';
import { FormControl, MenuItem, Select } from '@mui/material';

import FlowIcon from 'assets/images/icons/Flow/Dark.svg?react';
import DuplicateIcon from 'assets/images/icons/Duplicate.svg?react';
import ExportIcon from 'assets/images/icons/Flow/Export.svg?react';
import ConfigureIcon from 'assets/images/icons/Configure/UnselectedDark.svg?react';
import PinIcon from 'assets/images/icons/Pin/Active.svg?react';
import { FILTER_FLOW, GET_FLOW_COUNT, EXPORT_FLOW, RELEASE_FLOW } from 'graphql/queries/Flow';
import { DELETE_FLOW, IMPORT_FLOW } from 'graphql/mutations/Flow';
import { List } from 'containers/List/List';
import { ImportButton } from 'components/UI/ImportButton/ImportButton';
import { DATE_TIME_FORMAT } from 'common/constants';
import { exportFlowMethod, organizationHasDynamicRole } from 'common/utils';
import styles from './FlowList.module.css';
import { GET_TAGS } from 'graphql/queries/Tags';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { flowInfo } from 'common/HelpData';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';

const getName = (text: string, keywordsList: any, roles: any) => {
  const keywords = keywordsList.map((keyword: any) => keyword);
  const accessRoles = roles && roles.map((role: any) => role.label);
  const hasDynamicRole = organizationHasDynamicRole();
  return (
    <div className={styles.NameText}>
      {text}
      <br />
      <span className={styles.Keyword}>{keywords.join(', ')}</span>
      {hasDynamicRole && (
        <span className={styles.Roles}>{accessRoles && accessRoles.join(', ')} </span>
      )}
    </div>
  );
};

const getDate = (date: string, fallback: string = '') => (
  <div className={styles.LastPublished}>
    {date ? moment(date).format(DATE_TIME_FORMAT) : fallback}
  </div>
);

const getLastPublished = (date: string, fallback: string = '') =>
  date ? (
    <div className={styles.LastPublished}>{moment(date).format(DATE_TIME_FORMAT)}</div>
  ) : (
    <div className={styles.LastPublishedFallback}>{fallback}</div>
  );
const getLabel = (tag: any) => <div className={styles.LabelButton}>{tag.label}</div>;

const displayPinned = (isPinned: boolean) => {
  if (isPinned) {
    return <PinIcon />;
  }
  return '';
};

const columnStyles = [
  styles.Pinned,
  styles.Name,
  styles.DateColumn,
  styles.Label,
  styles.DateColumn,
  styles.Actions,
];
const flowIcon = <FlowIcon className={styles.FlowIcon} />;

const queries = {
  countQuery: GET_FLOW_COUNT,
  filterItemsQuery: FILTER_FLOW,
  deleteItemQuery: DELETE_FLOW,
};

const configureIcon = <ConfigureIcon />;

export const FlowList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<any>(true);
  const [selectedtag, setSelectedTag] = useState<any>(null);
  const [flowName, setFlowName] = useState('');
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState([]);

  const [releaseFlow] = useLazyQuery(RELEASE_FLOW);

  useEffect(() => {
    releaseFlow();
  }, []);

  const [importFlow] = useMutation(IMPORT_FLOW, {
    onCompleted: (result: any) => {
      const { status } = result.importFlow;
      setImportStatus(status);
      setImporting(false);
    },
  });

  const [exportFlowMutation] = useLazyQuery(EXPORT_FLOW, {
    fetchPolicy: 'network-only',
    onCompleted: async ({ exportFlow }) => {
      const { exportData } = exportFlow;
      await exportFlowMethod(exportData, flowName);
    },
  });

  const setDialog = (id: any) => {
    navigate(`/flow/${id}/edit`, { state: 'copy' });
  };

  const exportFlow = (id: any, item: any) => {
    setFlowName(item.name);
    exportFlowMutation({ variables: { id } });
  };
  let dialog;

  if (importStatus.length > 0) {
    dialog = (
      <DialogBox
        title="Import flow Status"
        buttonOk="Okay"
        alignButtons="center"
        handleOk={() => setImportStatus([])}
        skipCancel
      >
        <div className={styles.ImportDialog}>
          {importStatus.map((status: any) => (
            <div key={status.flowName}>
              <strong>{status.flowName}:</strong> {status.status}
            </div>
          ))}
        </div>
      </DialogBox>
    );
  }

  const importButton = (
    <ImportButton
      title={t('Import flow')}
      onImport={() => setImporting(true)}
      afterImport={(result: string) => importFlow({ variables: { flow: result } })}
    />
  );

  const additionalAction = () => [
    {
      label: t('Configure'),
      icon: configureIcon,
      parameter: 'uuid',

      link: '/flow/configure',
    },
    {
      label: t('Make a copy'),
      icon: <DuplicateIcon />,
      parameter: 'id',

      dialog: setDialog,
    },
    {
      label: t('Export'),
      icon: <ExportIcon data-testid="export-icon" className={styles.IconSize} />,
      parameter: 'id',
      dialog: exportFlow,
      insideMore: true,
    },
  ];

  const getColumns = ({
    name,
    keywords,
    lastChangedAt,
    lastPublishedAt,
    tag,
    roles,
    isPinned,
  }: any) => ({
    pin: displayPinned(isPinned),
    name: getName(name, keywords, roles),
    lastPublishedAt: getLastPublished(lastPublishedAt, t('Not published yet')),
    label: tag ? getLabel(tag) : '',
    lastChangedAt: getDate(lastChangedAt, t('Nothing in draft')),
  });

  const columnNames = [
    { name: 'is_pinned', label: '', sort: true, order: 'desc' },
    { name: 'name', label: t('Title') },
    { label: t('Last published') },
    { label: t('Tag') },
    { label: t('Last saved in Draft') },
    { label: t('Actions') },
  ];

  const dialogMessage = t("You won't be able to use this flow.");

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  const filterList = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];
  const { data: tag } = useQuery(GET_TAGS, {
    variables: {},
    fetchPolicy: 'network-only',
  });

  const activeFilter = (
    <>
      <FormControl>
        <Select
          aria-label="template-type"
          name="template-type"
          value={filter}
          onChange={(event) => {
            const { value } = event.target;
            setFilter(JSON.parse(value));
          }}
          className={styles.SearchBar}
        >
          {filterList.map((filter: any) => (
            <MenuItem key={filter.label} value={filter.value}>
              {filter.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <AutoComplete
        isFilterType
        placeholder="Select tag"
        options={tag ? tag.tags : []}
        optionLabel="label"
        multiple={false}
        onChange={(value: any) => {
          setSelectedTag(value);
        }}
        form={{ setFieldValue: () => {} }}
        field={{
          name: 'selectedtag',
          value: selectedtag,
        }}
      />
    </>
  );

  var filters = { isActive: filter };

  filters = {
    ...filters,
    ...(selectedtag?.id && { tagIds: [parseInt(selectedtag?.id)] }),
  };

  const addIcon = <AddIcon className={styles.AddIcon} />;

  return (
    <>
      {dialog}
      <List
        helpData={flowInfo}
        title={t('Flows')}
        listItem="flows"
        listItemName="flow"
        pageLink="flow"
        listIcon={flowIcon}
        dialogMessage={dialogMessage}
        {...queries}
        {...columnAttributes}
        searchParameter={['name_or_keyword_or_tags']}
        additionalAction={additionalAction}
        button={{ show: true, label: t('Create'), symbol: addIcon }}
        secondaryButton={importButton}
        filters={filters}
        filterList={activeFilter}
        loadingList={importing}
      />
    </>
  );
};

export default FlowList;
