import { List } from 'containers/List/List';
import { useTranslation } from 'react-i18next';
import CollectionIcon from 'assets/images/icons/Collection/Dark.svg?react';
import CopyIcon from 'assets/images/icons/Flow/Copy.svg?react';
import { GET_KNOWLEDGE_BASE } from 'graphql/queries/KnowledgeBase';
import styles from './Knowledgebase.module.css';
import { useState } from 'react';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { UploadFile } from 'components/UI/UploadFile/UploadFile';
import { copyToClipboard } from 'common/utils';
import { useMutation } from '@apollo/client';
import { DELETE_KNOWLEDGE_BASE, UPLOAD_KNOWLEDGE_BASE } from 'graphql/mutations/KnowledgeBase';
import { setNotification } from 'common/notification';

export const KnowledgeBase = () => {
  const queries = {
    filterItemsQuery: GET_KNOWLEDGE_BASE,
    deleteItemQuery: DELETE_KNOWLEDGE_BASE,
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [file, setFile] = useState<null | string>(null);
  const [category, setCategory] = useState<null | string>(null);
  const [uploading, setUploading] = useState(false);

  const { t } = useTranslation();

  const [uploadMedia] = useMutation(UPLOAD_KNOWLEDGE_BASE, {
    onCompleted: (data: any) => {
      setUploading(false);
      setNotification('Successfully uploaded the file!', 'success');
      setDialogOpen(false);
    },
    onError: () => {
      setFile(null);
      setUploading(false);
      setNotification(t('An error occured while uploading the file'), 'warning');
    },
  });

  const getLabel = (label: string) => <div className={styles.Label}>{label}</div>;
  const getId = (category: any) => (
    <div className={styles.ID}>
      <div className={styles.IdContainer}>
        <span>{category?.id}</span>
        <div onClick={() => copyToClipboard(category.id)}>
          <CopyIcon className={styles.CopyIcon} />
        </div>
      </div>
    </div>
  );
  const getCategory = (category: any) => <div className={styles.Category}>{category?.name}</div>;

  const getColumns = ({ name, category, id }: any) => {
    return {
      title: getLabel(name),
      category: getCategory(category),
      uuid: getId(category),
    };
  };

  const columnAttributes = {
    columns: getColumns,
    columnStyles: [styles.Label, styles.Category, styles.ID, styles.Actions],
  };
  const collectionIcon = <CollectionIcon />;

  const uploadFile = async () => {
    setUploading(true);
    await uploadMedia({
      variables: {
        categoryId: category,
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
        <UploadFile setCategory={setCategory} category={category} setFile={setFile} />
      </div>
    </DialogBox>
  );

  const getDeleteQueryVariables = (id: any) => ({
    uuid: id,
  });

  return (
    <>
      <List
        title={'Knowledge base'}
        listItem="knowledgeBases"
        columnNames={[
          { label: t('Title') },
          { label: t('Category') },
          { label: 'Category ID' },
          { label: t('Actions') },
        ]}
        listItemName="knowledgeBases"
        button={{ show: true, label: 'Upload', action: () => setDialogOpen(true) }}
        filters={{}}
        deleteModifier={{
          variables: getDeleteQueryVariables,
        }}
        pageLink={`knowledge-base`}
        listIcon={collectionIcon}
        editSupport={false}
        showSearch={false}
        {...queries}
        {...columnAttributes}
      />
      {dialogOpen && dialog}
    </>
  );
};

export default KnowledgeBase;
