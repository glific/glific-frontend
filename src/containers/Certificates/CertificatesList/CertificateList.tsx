import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CertificateIcon from 'assets/images/Certificate.svg?react';
import { GET_SHEET_COUNT, GET_SHEETS } from 'graphql/queries/Sheet';
import { DELETE_SHEET, SYNC_SHEET } from 'graphql/mutations/Sheet';
import { List } from 'containers/List/List';

import styles from './CertificateList.module.css';
import { certificatesInfo } from 'common/HelpData';

const queries = {
  countQuery: GET_SHEET_COUNT,
  filterItemsQuery: GET_SHEETS,
  deleteItemQuery: DELETE_SHEET,
};

const getLabel = (label: string) => <p>{label}</p>;
const getDescription = (label?: string) => <p>Description of the Certificate</p>;

const columnStyles = [styles.Label, styles.Description, styles.Actions];
const certificateIcon = <CertificateIcon className={styles.DarkIcon} />;

export const SheetIntegrationList = () => {
  const { t } = useTranslation();

  const [warnings, setWarnings] = useState<any>({});
  const [showdialog, setShowDialog] = useState(false);

  let dialog;

  const getColumns: any = ({ label, description }: any) => ({
    label: getLabel(label),
    description: getDescription(description),
  });

  const columnNames = [{ name: 'label', label: t('Label') }, { label: t('Description') }, { label: t('Actions') }];

  const dialogMessage = "You won't be able to use this certificate.";

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  return (
    <>
      {dialog}
      <List
        helpData={certificatesInfo}
        title={t('Certificates')}
        listItem="sheets"
        listItemName="Sheet"
        pageLink="certificates"
        listIcon={certificateIcon}
        dialogMessage={dialogMessage}
        {...queries}
        {...columnAttributes}
        button={{ show: true, label: t('Create') }}
      />
    </>
  );
};

export default SheetIntegrationList;
