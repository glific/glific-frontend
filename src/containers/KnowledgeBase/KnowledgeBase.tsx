import { List } from 'containers/List/List';
import { useTranslation } from 'react-i18next';
import CollectionIcon from 'assets/images/icons/Collection/Dark.svg?react';
import DeleteIcon from 'assets/images/icons/Delete/Red.svg?react';
import CopyIcon from 'assets/images/icons/Flow/Copy.svg?react';
import { GET_KNOWLEDGE_BASE } from 'graphql/queries/KnowledgeBase';
import styles from './Knowledgebase.module.css';
import { useState } from 'react';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { UploadFile } from 'containers/KnowledgeBase/UploadFile/UploadFile';
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
  const [deleteItemId, setDeleteItemID] = useState<string | null>(null);
  const [file, setFile] = useState<null | string>(null);
  const [category, setCategory] = useState<null | string>(null);
  const [uploading, setUploading] = useState(false);

  const { t } = useTranslation();

  const [uploadMedia] = useMutation(UPLOAD_KNOWLEDGE_BASE, {
    onCompleted: (data: any) => {
      setNotification('Successfully uploaded the file!', 'success');
      handleClose();
    },
    onError: () => {
      setFile(null);
      setUploading(false);
      setNotification(t('An error occured while uploading the file'), 'warning');
    },
  });

  const [deleteKnowledgeBase, { loading: deleteLoading }] = useMutation(DELETE_KNOWLEDGE_BASE, {
    onCompleted: (data: any) => {
      setNotification('Successfully deleted the knowledge base!', 'success');
      setDeleteItemID(null);
    },
    onError: () => {
      setNotification('An error occured while deleteing the knowledge base.', 'warning');
      setDeleteItemID(null);
    },
  });

  const getLabel = (label: string) => <div className={styles.Label}>{label}</div>;
  const getId = (category: any) => (
    <div className={styles.ID}>
      <div className={styles.IdContainer}>
        <span>{category?.id}</span>
        <div onClick={() => copyToClipboard(category.id)}>
          <CopyIcon data-testid="copy-icon" className={styles.CopyIcon} />
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
    if (file && category) {
      setUploading(true);
      await uploadMedia({
        variables: {
          categoryId: category,
          media: file,
        },
      });
    }
  };

  const handleClose = () => {
    setFile(null);
    setCategory(null);
    setDialogOpen(false);
    setUploading(false);
  };

  const handleDelete = () => {
    deleteKnowledgeBase({
      variables: {
        uuid: deleteItemId,
      },
    });
  };

  const dialog = (
    <DialogBox
      title={'Upload Document'}
      handleCancel={handleClose}
      handleOk={uploadFile}
      buttonOk={t('Upload')}
      buttonOkLoading={uploading}
      alignButtons="center"
    >
      <div className={styles.DialogBox} data-testid="upload-dialog">
        <UploadFile file={file} setCategory={setCategory} category={category} setFile={setFile} />
      </div>
    </DialogBox>
  );

  const Deletedialog = (
    <DialogBox
      title={'Do you want to delete this knowledge base?'}
      handleOk={handleDelete}
      handleCancel={() => setDeleteItemID(null)}
      alignButtons="center"
      buttonOkLoading={deleteLoading}
    >
      <p data-testid="delete-dialog" className={styles.DialogText}>
        {'This knowledge base will be deleted permanently.'}
      </p>
    </DialogBox>
  );

  const additionalAction = () => [
    {
      label: t('Delete'),
      icon: <DeleteIcon data-testid="delete-icon" />,
      parameter: 'id',
      dialog: (id: any) => setDeleteItemID(id),
      insideMore: false,
    },
  ];

  const restrictedAction = () => ({ delete: false, edit: false });

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
        pageLink={`knowledge-base`}
        additionalAction={additionalAction}
        listIcon={collectionIcon}
        editSupport={false}
        showSearch={false}
        restrictedAction={restrictedAction}
        {...queries}
        {...columnAttributes}
      />
      {dialogOpen && dialog}
      {deleteItemId !== null && Deletedialog}
    </>
  );
};

export default KnowledgeBase;
