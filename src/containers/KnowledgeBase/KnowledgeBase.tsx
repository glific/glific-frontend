import { List } from 'containers/List/List';
import { useTranslation } from 'react-i18next';
import CollectionIcon from 'assets/images/icons/Collection/Dark.svg?react';
import CopyIcon from 'assets/images/icons/Flow/Copy.svg?react';
import { GET_KNOWLEDGE_BASE } from 'graphql/queries/KnowledgeBase';
import styles from './Knowledgebase.module.css';
import { DELETE_COLLECTION } from 'graphql/mutations/Collection';
import { useState } from 'react';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { UploadFile } from 'components/UI/UploadFile/UploadFile';
import { copyToClipboard } from 'common/utils';
import { useMutation } from '@apollo/client';
import { UPLOAD_KNOWLEDGE_BASE } from 'graphql/mutations/KnowledgeBase';
import { setNotification } from 'common/notification';

export const KnowledgeBase = () => {
  const queries = {
    filterItemsQuery: GET_KNOWLEDGE_BASE,
    deleteItemQuery: DELETE_COLLECTION,
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [file, setFile] = useState<null | string>(null);
  const [uploading, setUploading] = useState(false);

  const { t } = useTranslation();

  const [uploadMedia] = useMutation(UPLOAD_KNOWLEDGE_BASE, {
    onCompleted: (data: any) => {
      setUploading(false);
    },
    onError: () => {
      setFile(null);
      setUploading(false);
      setNotification(t('An error occured while uploading the file'), 'warning');
    },
  });

  const getLabel = (label: string) => <div className={styles.Label}>{label}</div>;
  const getUuid = (id: string) => (
    <div className={styles.UUID}>
      <div onClick={() => copyToClipboard(id)}>
        <CopyIcon className={styles.CopyIcon} />
      </div>
      <span>{id}</span>
    </div>
  );
  const getCategory = (category: any) => <div className={styles.Category}>{category?.name}</div>;

  const getColumns = ({ name, category, uuid }: any) => {
    return {
      uuid: getUuid(uuid),
      title: getLabel(name),
      category: getCategory(category),
    };
  };

  const columnAttributes = {
    columns: getColumns,
    columnStyles: [],
  };
  const collectionIcon = <CollectionIcon />;

  const uploadFile = async () => {
    setUploading(true);
    await uploadMedia({
      variables: {
        categoryId: '2',
        media: file,
      },
    });
  };

  const dialog = (
    <DialogBox
      title={'Upload Document'}
      handleCancel={() => setDialogOpen(false)}
      handleOk={uploadFile}
      buttonOk={t('Upload')}
      buttonOkLoading={uploading}
      alignButtons="center"
    >
      <div className={styles.DialogBox} data-testid="description">
        <UploadFile setFile={setFile} />
      </div>
    </DialogBox>
  );

  return (
    <>
      <List
        title={'Knowledge Base'}
        listItem="knowledgeBases"
        columnNames={[
          { label: 'Identifier' },
          { label: t('Title') },
          { label: t('Category') },
          { label: '' },
        ]}
        listItemName="knowledgeBases"
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
