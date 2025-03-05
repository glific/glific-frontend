import { useTranslation } from 'react-i18next';

import CertificateIcon from 'assets/images/Certificate.svg?react';
import { List } from 'containers/List/List';

import styles from './CertificateList.module.css';
import { certificatesInfo } from 'common/HelpData';
import { COUNT_CERTIFICATES, LIST_CERTIFICATES } from 'graphql/queries/Certificate';
import { DELETE_CERTIFICATE } from 'graphql/mutations/Certificate';
import { copyToClipboardMethod } from 'common/utils';
import { setNotification } from 'common/notification';
import CopyAllOutlined from 'assets/images/icons/Flow/Copy.svg?react';

const queries = {
  countQuery: COUNT_CERTIFICATES,
  filterItemsQuery: LIST_CERTIFICATES,
  deleteItemQuery: DELETE_CERTIFICATE,
};

const getLabel = (label: string) => <p>{label}</p>;
const getDescription = (description: string) => (
  <p>{description.length < 100 ? description : `${description.slice(0, 100)}...`}</p>
);

const columnStyles = [styles.Label, styles.Description, styles.Actions];
const certificateIcon = <CertificateIcon className={styles.DarkIcon} />;

export const CertificateList = () => {
  const { t } = useTranslation();

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

  const copyUuid = (_id: string, item: any) => {
    if (item.id) {
      copyToClipboardMethod(item.id);
    } else {
      setNotification('Sorry! UUID not found', 'warning');
    }
  };

  const additionalAction = () => [
    {
      label: t('Copy UUID'),
      icon: <CopyAllOutlined data-testid="copy-icon" />,
      parameter: 'id',
      dialog: copyUuid,
    },
  ];

  return (
    <List
      helpData={certificatesInfo}
      title={t('Certificates')}
      listItem="certificateTemplates"
      listItemName="Certificate"
      pageLink="certificate"
      listIcon={certificateIcon}
      dialogMessage={dialogMessage}
      additionalAction={additionalAction}
      button={{ show: true, label: t('Create') }}
      {...queries}
      {...columnAttributes}
    />
  );
};

export default CertificateList;
