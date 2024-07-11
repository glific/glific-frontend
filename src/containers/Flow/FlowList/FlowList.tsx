import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';

import { FormControl, MenuItem, Select } from '@mui/material';

import FlowIcon from 'assets/images/icons/Flow/Dark.svg?react';
import DuplicateIcon from 'assets/images/icons/Duplicate.svg?react';
import ExportIcon from 'assets/images/icons/Flow/Export.svg?react';
import ConfigureIcon from 'assets/images/icons/Configure/UnselectedDark.svg?react';
import PinIcon from 'assets/images/icons/Pin/Active.svg?react';
import ViewIcon from 'assets/images/icons/ViewLight.svg?react';
import { FILTER_FLOW, GET_FLOW_COUNT, EXPORT_FLOW, RELEASE_FLOW } from 'graphql/queries/Flow';
import { DELETE_FLOW, IMPORT_FLOW } from 'graphql/mutations/Flow';
import { List } from 'containers/List/List';
import { ImportButton } from 'components/UI/ImportButton/ImportButton';
import { STANDARD_DATE_TIME_FORMAT } from 'common/constants';
import { exportFlowMethod, organizationHasDynamicRole } from 'common/utils';
import styles from './FlowList.module.css';
import { GET_TAGS } from 'graphql/queries/Tags';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { flowInfo } from 'common/HelpData';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { setErrorMessage, setNotification } from 'common/notification';

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
    {date ? dayjs(date).format(STANDARD_DATE_TIME_FORMAT) : fallback}
  </div>
);

const getLastPublished = (date: string, fallback: string = '') =>
  date ? (
    <div className={styles.LastPublished}>{dayjs(date).format(STANDARD_DATE_TIME_FORMAT)}</div>
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
const viewIcon = <ViewIcon />;

export const FlowList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<any>(true);
  const [selectedtag, setSelectedTag] = useState<any>(null);
  const [flowName, setFlowName] = useState('');
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState([]);
  const [showDialog, setShowDialog] = useState(false);

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
    onError: (error: any) => {
      setNotification('An error occured while importing the flow', 'warning');
      setImporting(false);
    },
  });

  const [exportFlowMutation] = useLazyQuery(EXPORT_FLOW, {
    fetchPolicy: 'network-only',
    onCompleted: async ({ exportFlow }) => {
      const { exportData } = exportFlow;
      await exportFlowMethod(exportData, flowName);
      setNotification('Flow exported successfully');
    },
    onError: (error: any) => {
      setErrorMessage(error);
    },
  });

  const handleCopy = (id: any) => {
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

  const templateFlowActions = [
    {
      label: 'View it',
      icon: viewIcon,
      parameter: 'id',
      insideMore: false,
      dialog: (id: any) => {
        navigate(`/flow/${id}/edit`, { state: 'template' });
      },
    },
    {
      label: 'Use it',
      icon: configureIcon,
      parameter: 'id',
      insideMore: false,
      dialog: handleCopy,
    },
  ];

  const actions = [
    {
      label: t('Configure'),
      icon: configureIcon,
      parameter: 'uuid',
      link: '/flow/configure',
    },
    {
      label: t('Copy'),
      icon: <DuplicateIcon />,
      parameter: 'id',
      insideMore: true,
      dialog: handleCopy,
    },
    {
      label: t('Export'),
      icon: <ExportIcon data-testid="export-icon" className={styles.IconSize} />,
      parameter: 'id',
      dialog: exportFlow,
      insideMore: true,
    },
  ];

  const additionalAction = () => (filter === 'isTemplate' ? templateFlowActions : actions);

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
    { label: 'Template Flows', value: 'isTemplate' },
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
            setFilter(value);
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

  const filters = useMemo(() => {
    let filters = {
      ...(selectedtag?.id && { tagIds: [parseInt(selectedtag?.id)] }),
    };
    if (filter === 'isTemplate') {
      filters = { ...filters, isTemplate: true };
    } else {
      filters = { ...filters, isActive: filter };
    }
    return filters;
  }, [filter, selectedtag, importing]);

  const restrictedAction = () =>
    filter === 'isTemplate' ? { delete: false, edit: false } : { edit: true, delete: true };

  let dialogBox: any;
  if (showDialog) {
    dialogBox = (
      <DialogBox
        title="Create flow"
        alignButtons="center"
        buttonOk="Create from Scratch"
        buttonMiddle="Create from Template"
        skipCancel
        handleOk={() => {
          navigate('/flow/add');
        }}
        handleMiddle={() => {
          setFilter('isTemplate');
          setShowDialog(false);
        }}
        handleCancel={() => {
          setShowDialog(false);
        }}
      >
        <div className={styles.DialogContent}>
          Do you want to create a flow from scratch or use a template flow?
        </div>
      </DialogBox>
    );
  }

  return (
    <>
      {dialog}
      {dialogBox}
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
        button={{ show: true, label: t('Create'), action: () => setShowDialog(true) }}
        secondaryButton={importButton}
        filters={filters}
        filterList={activeFilter}
        loadingList={importing}
        restrictedAction={restrictedAction}
      />
    </>
  );
};

export default FlowList;
