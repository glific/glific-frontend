import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as SheetIcon } from 'assets/images/icons/Sheets/Sheet.svg';
import { ReactComponent as UpdatesheetIcon } from 'assets/images/icons/Sheets/Updatesheet.svg';
import { ReactComponent as LinkIcon } from 'assets/images/icons/Sheets/Link.svg';
import { GET_SHEET_COUNT, GET_SHEETS } from 'graphql/queries/Sheet';
import { DELETE_SHEET, SYNC_SHEET } from 'graphql/mutations/Sheet';
import { setNotification } from 'common/notification';
import { useMutation } from '@apollo/client';
import { List } from 'containers/List/List';
import moment from 'moment';
import { DATE_TIME_FORMAT } from 'common/constants';

import styles from './SheetIntegrationList.module.css';

const getName = (text: string) => <p className={styles.NameText}>{text}</p>;
const getLastSyncedAt = (date: string, fallback: string = '') => (
  <div className={styles.LastSyncText}>
    {date ? moment(date).format(DATE_TIME_FORMAT) : fallback}
  </div>
);

const columnStyles = [styles.Name, styles.LastSyncText, styles.Actions];
const sheetIcon = <SheetIcon className={styles.DarkIcon} />;

const queries = {
  countQuery: GET_SHEET_COUNT,
  filterItemsQuery: GET_SHEETS,
  deleteItemQuery: DELETE_SHEET,
};

export const SheetIntegrationList = () => {
  const { t } = useTranslation();

  const [syncSheetMutation] = useMutation(SYNC_SHEET, {
    fetchPolicy: 'network-only',
    onCompleted: async () => {
      setNotification('Data is successfully fetched from the Google sheet.');
    },
  });

  const syncSheet = (id: any) => {
    syncSheetMutation({ variables: { id } });
  };

  const linkSheet = (_id: any, item: any) => {
    window.open(item.url);
  };

  const additionalAction = [
    {
      label: t('Link'),
      icon: <LinkIcon />,
      parameter: 'id',
      dialog: linkSheet,
    },
    {
      label: t('Sync'),
      icon: <UpdatesheetIcon />,
      parameter: 'id',
      dialog: syncSheet,
    },
  ];
  const getColumns = ({ label, lastSyncedAt }: any) => ({
    name: getName(label),
    date: getLastSyncedAt(lastSyncedAt),
  });

  const columnNames = ['LABEL', 'LAST SYNCED', 'ACTIONS'];
  const dialogMessage = t("You won't be able to use this sheet.");

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  return (
    <List
      title={t('Google sheets')}
      listItem="sheets"
      listItemName="Sheet"
      pageLink="Sheet-integration"
      listIcon={sheetIcon}
      dialogMessage={dialogMessage}
      {...queries}
      {...columnAttributes}
      additionalAction={additionalAction}
      button={{ show: true, label: t('+ Add Sheet') }}
    />
  );
};

export default SheetIntegrationList;
