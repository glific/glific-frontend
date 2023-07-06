import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';

import { ReactComponent as FlowIcon } from 'assets/images/icons/Flow/Dark.svg';
import { ReactComponent as DuplicateIcon } from 'assets/images/icons/Flow/Duplicate.svg';
import { ReactComponent as ExportIcon } from 'assets/images/icons/Flow/Export.svg';
import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Radio,
  RadioGroup,
  Select,
} from '@mui/material';
import { ReactComponent as ConfigureIcon } from 'assets/images/icons/Configure/UnselectedDark.svg';
import { ReactComponent as PinIcon } from 'assets/images/icons/Pin/Active.svg';
import { FILTER_FLOW, GET_FLOW_COUNT, EXPORT_FLOW, RELEASE_FLOW } from 'graphql/queries/Flow';
import { DELETE_FLOW, IMPORT_FLOW } from 'graphql/mutations/Flow';
import { List } from 'containers/List/List';
import { ImportButton } from 'components/UI/ImportButton/ImportButton';
import Loading from 'components/UI/Layout/Loading/Loading';
import { DATE_TIME_FORMAT } from 'common/constants';
import { exportFlowMethod, organizationHasDynamicRole } from 'common/utils';
import { setNotification } from 'common/notification';
import styles from './FlowList.module.css';
import { GET_TAGS } from 'graphql/queries/Tags';

const getName = (text: string, keywordsList: any, roles: any) => {
  const keywords = keywordsList.map((keyword: any) => keyword);
  const accessRoles = roles && roles.map((role: any) => role.label);
  const hasDynamicRole = organizationHasDynamicRole();
  return (
    <p className={styles.NameText}>
      {text}
      <br />
      <span className={styles.Keyword}>{keywords.join(', ')}</span>
      {hasDynamicRole && (
        <span className={styles.Roles}>{accessRoles && accessRoles.join(', ')} </span>
      )}
    </p>
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
      icon: <ExportIcon data-testid="export-icon" />,
      parameter: 'id',
      dialog: exportFlow,
    },
  ];

  const getColumns = ({
    name,
    keywords,
    lastChangedAt,
    lastPublishedAt,
    isPinned,
    roles,
  }: any) => ({
    pin: displayPinned(isPinned),
    name: getName(name, keywords, roles),
    lastPublishedAt: getLastPublished(lastPublishedAt, t('Not published yet')),
    lastChangedAt: getDate(lastChangedAt, t('Nothing in draft')),
  });

  const columnNames = [
    { name: 'is_pinned', label: '', sort: true, order: 'desc' },
    { name: 'name', label: t('Title') },
    { label: t('Last published') },
    { label: t('Last saved in Draft') },
    { label: t('Actions') },
  ];

  const dialogMessage = t("You won't be able to use this flow.");

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  if (importing) {
    return <Loading message="Uploading" />;
  }

  const filterList = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];
  const { data: tag } = useQuery(GET_TAGS, {
    variables: {},
    fetchPolicy: 'network-only',
  });

  const activeFilter = (
    <div className={styles.Filters}>
      <RadioGroup
        aria-label="template-type"
        name="template-type"
        row
        value={filter}
        onChange={(event) => {
          const { value } = event.target;
          setFilter(JSON.parse(value));
        }}
      >
        {filterList.map((filter) => (
          <div className={styles.RadioLabelWrapper} key={filter.label}>
            <FormControlLabel
              value={filter.value}
              control={<Radio color="primary" />}
              classes={{ root: styles.RadioLabel }}
              label={filter.label}
              data-testid="radio"
            />
          </div>
        ))}
      </RadioGroup>
    </div>
  );
  const [selectedtag, setSelectedTag] = useState<any>('None');

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
  const tagFilter = (
    <div className={styles.Filters}>
      <FormControl sx={{ width: 100, borderRadius: 2, borderColor: 'none' }}>
        <InputLabel id="tag-dropdown-for-filter">Tag</InputLabel>
        <Select
          labelId="tag-dropdown-for-filter"
          id="tag-dropdown-id"
          value={selectedtag}
          onChange={(event) => setSelectedTag(event.target.value)}
          input={<OutlinedInput label="Tag" />}
          MenuProps={MenuProps}
          style={{ height: '45px' }}
        >
          <MenuItem value={'None'}>None</MenuItem>
          {tag &&
            tag.tags.map((data: any) => (
              <MenuItem key={data.id} value={data.id}>
                {data?.label}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </div>
  );

  return (
    <List
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
      button={{ show: true, label: t('Create Flow'), symbol: '+' }}
      secondaryButton={importButton}
      filters={{ isActive: filter }}
      filterList={activeFilter}
      filtersTag={selectedtag}
      filterDropdowm={tagFilter}
    />
  );
};

export default FlowList;
