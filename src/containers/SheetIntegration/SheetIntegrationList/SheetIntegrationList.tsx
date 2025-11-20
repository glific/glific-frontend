import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client';
import dayjs from 'dayjs';

import SheetIcon from 'assets/images/icons/Sheets/Sheet.svg?react';
import UpdatesheetIcon from 'assets/images/icons/Sheets/Updatesheet.svg?react';
import LinkIcon from 'assets/images/icons/Sheets/Link.svg?react';
import { GET_SHEET_COUNT, GET_SHEETS } from 'graphql/queries/Sheet';
import { DELETE_SHEET, SYNC_SHEET } from 'graphql/mutations/Sheet';
import { setNotification } from 'common/notification';
import { List } from 'containers/List/List';
import { STANDARD_DATE_TIME_FORMAT } from 'common/constants';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import styles from './SheetIntegrationList.module.css';
import { googleSheetsInfo } from 'common/HelpData';

export enum SheetTypes {
  Read = 'READ',
  Write = 'WRITE',
  All = 'ALL',
}

const textForSheetType = {
  READ: 'Read',
  WRITE: 'Write',
  ALL: 'Read & Write',
};

const getName = (text: string, sheetDataCount: string, type: SheetTypes) => (
  <p className={styles.NameText}>
    {text}
    <br />
    {type !== SheetTypes.Write && <span className={styles.SheetCount}>{sheetDataCount} rows synced</span>}
  </p>
);
const getLastSyncedAt = (date: string, fallback: string = '') => (
  <div className={styles.LastSyncText}>{date ? dayjs(date).format(STANDARD_DATE_TIME_FORMAT) : fallback}</div>
);

const getType = (type: SheetTypes) => <div className={styles.LastSyncText}>{textForSheetType[type]}</div>;

const getSyncStatus = (status: string) => {
  if (!status) {
    return <div className={styles.LastSyncText}>N/A</div>;
  }

  let badgeClass = styles.LastSyncText;

  if (status === 'SUCCESS') {
    badgeClass = styles.SuccessBadge;
  } else if (status === 'FAILED') {
    badgeClass = styles.ErrorBadge;
  }

  return <div className={badgeClass}>{status}</div>;
};

const getFailureReason = (error: string) => (
  <div className={styles.LastSyncText} title={error || ''}>
    {error || 'N/A'}
  </div>
);

const columnStyles = [
  styles.Name,
  styles.LastSync,
  styles.Type,
  styles.SyncStatus,
  styles.FailureReason,
  styles.Actions,
];
const sheetIcon = <SheetIcon className={styles.DarkIcon} />;

const queries = {
  countQuery: GET_SHEET_COUNT,
  filterItemsQuery: GET_SHEETS,
  deleteItemQuery: DELETE_SHEET,
};

export const SheetIntegrationList = () => {
  const { t } = useTranslation();

  const [failureReason, setFailureReason] = useState<string>('');
  const [showdialog, setShowDialog] = useState(false);

  let dialog;

  if (showdialog) {
    dialog = (
      <DialogBox
        open
        title="Sync Failed"
        skipCancel
        alignButtons="center"
        buttonOk="Close"
        colorOk="secondary"
        handleOk={() => setShowDialog(false)}
        handleCancel={() => setShowDialog(false)}
      >
        <div className={styles.DialogContent}>{failureReason}</div>
      </DialogBox>
    );
  }

  const [syncSheetMutation, { loading }] = useMutation(SYNC_SHEET, {
    fetchPolicy: 'network-only',
    onCompleted: async ({ syncSheet }) => {
      const notificationMessage = 'Data is successfully fetched from the Google sheet.';
      if (syncSheet.sheet && syncSheet.sheet.failureReason) {
        setShowDialog(true);
        setFailureReason(syncSheet.sheet.failureReason);
      } else {
        setNotification(notificationMessage);
      }
    },
    onError: () => {
      setNotification('Sorry! An error occurred while fetching data from the Google sheet.', 'warning');
    },
  });

  if (loading) {
    return <Loading message="Sync in progress" />;
  }

  const syncSheet = (id: any) => {
    syncSheetMutation({ variables: { id } });
  };

  const linkSheet = (_id: any, item: any) => {
    window.open(item.url);
  };

  const additionalAction = (listValue: any) => {
    let actions = [
      {
        label: t('Link'),
        icon: <LinkIcon />,
        parameter: 'id',
        dialog: linkSheet,
      },
    ];
    if (listValue.type !== 'WRITE') {
      actions = [
        {
          label: t('Sync'),
          icon: <UpdatesheetIcon />,
          parameter: 'id',
          dialog: syncSheet,
        },
        ...actions,
      ];
    }
    return actions;
  };

  const getColumns = ({ label, sheetDataCount, lastSyncedAt, type, syncStatus, failureReason }: any) => ({
    name: getName(label, sheetDataCount, type),
    date: getLastSyncedAt(lastSyncedAt),
    type: getType(type),
    syncStatus: getSyncStatus(syncStatus),
    failureReason: getFailureReason(failureReason),
  });

  const columnNames = [
    { name: 'label', label: t('Name') },
    { label: t('Last synced') },
    { label: t('Type') },
    { label: t('Sync Status') },
    { label: t('Failure Reason') },
    { label: t('Actions') },
  ];

  const dialogMessage = t("You won't be able to use this sheet.");

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  return (
    <>
      {dialog}
      <List
        helpData={googleSheetsInfo}
        title={t('Google sheets')}
        listItem="sheets"
        listItemName="Sheet"
        pageLink="sheet-integration"
        listIcon={sheetIcon}
        dialogMessage={dialogMessage}
        {...queries}
        {...columnAttributes}
        additionalAction={additionalAction}
        button={{ show: true, label: t('Create') }}
      />
    </>
  );
};

export default SheetIntegrationList;
