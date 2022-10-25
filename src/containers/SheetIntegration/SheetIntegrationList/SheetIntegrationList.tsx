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

import styles from './SheetIntegrationList.module.css';

const getName = (text: string) => <p className={styles.NameText}>{text}</p>;

const columnStyles = [styles.Name, styles.Actions];
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
      setNotification(`Sheet updated successfully`);
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
      label: t('Update sheet'),
      icon: <UpdatesheetIcon />,
      parameter: 'id',
      dialog: syncSheet,
    },
  ];
  const getColumns = ({ label }: any) => ({
    name: getName(label),
  });

  const columnNames = ['LABEL', 'ACTIONS'];
  const dialogMessage = t("You won't be able to use this sheet.");

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  return (
    <List
      title={t('Sheet integration')}
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
