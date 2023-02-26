import { useState } from 'react';
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
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import styles from './SheetIntegrationList.module.css';

const getName = (text: string, sheetDataCount: string) => (
  <p className={styles.NameText}>
    {text}
    <br />
    <span className={styles.SheetCount}>{sheetDataCount} rows synced</span>
  </p>
);
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

  const [warnings, setWarnings] = useState<any>({});
  const [showdialog, setShowDialog] = useState(false);

  let dialog;

  if (showdialog) {
    const warningKeys = Object.keys(warnings);
    dialog = (
      <DialogBox
        open
        title="Please check the warnings"
        skipCancel
        alignButtons="center"
        buttonOk="Close"
        colorOk="secondary"
        handleOk={() => setShowDialog(false)}
      >
        {warningKeys.map((key, index) => (
          <div key={key} className={styles.DialogContent}>
            <strong>
              {index + 1}. {key}:
            </strong>{' '}
            {warnings[key]}
          </div>
        ))}
      </DialogBox>
    );
  }

  const [syncSheetMutation] = useMutation(SYNC_SHEET, {
    fetchPolicy: 'network-only',
    onCompleted: async ({ syncSheet }) => {
      const notificationMessage = 'Data is successfully fetched from the Google sheet.';
      if (syncSheet.sheet && syncSheet.sheet.warnings) {
        const sheetWarnings = JSON.parse(syncSheet.sheet.warnings);

        if (Object.keys(sheetWarnings).length) {
          setShowDialog(true);
          setWarnings(sheetWarnings);
        } else {
          setNotification(notificationMessage);
        }
      } else {
        setNotification(notificationMessage);
      }
    },
    onError: () => {
      setNotification(
        'Sorry! An error occurred while fetching data from the Google sheet.',
        'warning'
      );
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
  const getColumns = ({ label, sheetDataCount, lastSyncedAt }: any) => ({
    name: getName(label, sheetDataCount),
    date: getLastSyncedAt(lastSyncedAt),
  });

  const columnNames = [
    { name: 'label', label: t('Label') },
    { label: t('Last synced') },
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
        title={t('Google sheets')}
        listItem="sheets"
        listItemName="Sheet"
        pageLink="Sheet-integration"
        listIcon={sheetIcon}
        dialogMessage={dialogMessage}
        {...queries}
        {...columnAttributes}
        additionalAction={additionalAction}
        button={{ show: true, label: t('Add Sheet'), symbol: '+' }}
      />
    </>
  );
};

export default SheetIntegrationList;
