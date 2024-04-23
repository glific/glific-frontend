import { List } from 'containers/List/List';
import { useTranslation } from 'react-i18next';
import CollectionIcon from 'assets/images/icons/Collection/Dark.svg?react';
import { GET_COLLECTIONS_COUNT, FILTER_COLLECTIONS } from 'graphql/queries/Collection';
import styles from './Knowledgebase.module.css';
import { DELETE_COLLECTION } from 'graphql/mutations/Collection';
import { useState } from 'react';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { UploadFile } from 'components/UI/UploadFile/UploadFile';

export const KnowledgeBase = () => {
  const queries = {
    countQuery: GET_COLLECTIONS_COUNT,
    filterItemsQuery: FILTER_COLLECTIONS,
    deleteItemQuery: DELETE_COLLECTION,
  };

  const [dialogOpen, setDialogOpen] = useState(false);

  const { t } = useTranslation();
  const getLabel = (label: string) => <div>{label}</div>;
  const getId = (id: string) => <div>{id}</div>;

  const getColumns = ({ label, contactsCount, description, waGroupsCount, id }: any) => {
    return {
      label: getLabel(label),
      description: getId(id),
    };
  };

  const columnAttributes = {
    columns: getColumns,
    columnStyles: [],
  };
  const collectionIcon = <CollectionIcon />;

  const dialog = (
    <DialogBox
      title={'Upload Document'}
      handleCancel={() => setDialogOpen(false)}
      buttonOk={t('Upload')}
      alignButtons="center"
    >
      <div className={styles.DialogBox} data-testid="description">
        <UploadFile />
      </div>
    </DialogBox>
  );

  return (
    <>
      <List
        title={'Knowledge Base'}
        listItem="document"
        columnNames={[
          { name: 'label', label: t('Title') },
          { label: 'Id' },
          { label: t('Actions') },
        ]}
        listItemName="document"
        button={{ show: true, label: 'Upload', action: () => setDialogOpen(true) }}
        filters={{}}
        pageLink={`knowledge-base`}
        listIcon={collectionIcon}
        {...queries}
        {...columnAttributes}
      />
      {dialogOpen && dialog}
    </>
  );
};

export default KnowledgeBase;
