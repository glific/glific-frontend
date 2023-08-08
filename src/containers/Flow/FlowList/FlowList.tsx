import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';

import { ReactComponent as AddIcon } from 'assets/images/add.svg';
import { ReactComponent as FlowIcon } from 'assets/images/icons/Flow/Dark.svg';
import { ReactComponent as DuplicateIcon } from 'assets/images/icons/Flow/Copy.svg';
import { ReactComponent as ExportIcon } from 'assets/images/icons/Flow/Export.svg';
import { FormControl, MenuItem, Select } from '@mui/material';
import { ReactComponent as ConfigureIcon } from 'assets/images/icons/Configure/Setting.svg';
import { ReactComponent as PinIcon } from 'assets/images/icons/Pin/Pin.svg';
import { FILTER_FLOW, GET_FLOW_COUNT, EXPORT_FLOW, RELEASE_FLOW } from 'graphql/queries/Flow';
import { DELETE_FLOW, IMPORT_FLOW } from 'graphql/mutations/Flow';
import { List } from 'containers/List/List';
import { ImportButton } from 'components/UI/ImportButton/ImportButton';
import { DATE_TIME_FORMAT } from 'common/constants';
import { exportFlowMethod, organizationHasDynamicRole } from 'common/utils';
import { setNotification } from 'common/notification';
import styles from './FlowList.module.css';
import { GET_TAGS } from 'graphql/queries/Tags';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';

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

  const [releaseFlow] = useLazyQuery(RELEASE_FLOW);

  useEffect(() => {
    releaseFlow();
  }, []);

  const [importFlow] = useMutation(IMPORT_FLOW, {
    onCompleted: (result: any) => {
      const { success } = result.importFlow;
      if (!success) {
        setNotification(
          t(
            'Sorry! An error occurred! This could happen if the flow is already present or error in the import file.'
          ),
          'error'
        );
      } else {
        setNotification(t('The flow has been imported successfully.'));
      }
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
      label: t('Export flow'),
      icon: <ExportIcon data-testid="export-icon" className={styles.IconSize} />,
      parameter: 'id',
      dialog: exportFlow,
      hasMore: true,
      name: 'Export',
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
    { label: t('Label') },
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

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  const activeFilter = (
    <FormControl className={styles.ActiveFilter}>
      <Select
        aria-label="template-type"
        name="template-type"
        value={filter}
        onChange={(event) => {
          const { value } = event.target;
          setFilter(JSON.parse(value));
        }}
        MenuProps={MenuProps}
        className={styles.SearchBar}
        sx={{ '& > fieldset': { border: 'none' } }}
      >
        {filterList.map((filter: any) => (
          <MenuItem key={filter.label} value={filter.value}>
            {filter.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const tagFilter = (
    <AutoComplete
      isFilterType
      placeholder="Select tag"
      options={tag ? tag.tags : []}
      optionLabel="label"
      disabled={false}
      hasCreateOption={false}
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
  );

  var filters = { isActive: filter };

  filters = {
    ...filters,
    ...(selectedtag?.id && { tagIds: [parseInt(selectedtag?.id)] }),
  };

  const addIcon = <AddIcon className={styles.AddIcon} />;

  const helpData = {
    heading: 'You can configure the flow by clicking on the configure button and are as follows:',
    body: (
      <ul>
        <li>Save as Draft</li>
        <li>Publish Preview</li>
        <li>Revision history</li>
        <li>Reset flow counts</li>
      </ul>
    ),
    link: 'https://glific.org/',
  };

  return (
    <List
      helpData={helpData}
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
      button={{ show: true, label: t('Create Flow'), symbol: addIcon }}
      secondaryButton={importButton}
      filters={filters}
      filterList={activeFilter}
      filterDropdowm={tagFilter}
      loadingList={importing}
    />
  );
};

export default FlowList;
