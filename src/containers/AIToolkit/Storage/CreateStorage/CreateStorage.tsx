import { useLazyQuery, useMutation } from '@apollo/client';
import { CircularProgress, InputAdornment, OutlinedInput } from '@mui/material';
import { useEffect, useState } from 'react';

import EditIcon from 'assets/images/icons/GreenEdit.svg?react';
import { UPDATE_VECTORE_STORE } from 'graphql/mutations/Storage';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { VECTOR_STORE } from 'graphql/queries/Storage';

import { AssistantsAttached } from '../Assistants/AssistantsAttached';
import { FilesAttached } from '../Files/Files';
import { StorageDetails } from '../StorageDetails/StorageDetails';

import styles from './CreateStorage.module.css';

interface CreateStorageProps {
  vectorStoreId: any;
}

export const CreateStorage = ({ vectorStoreId }: CreateStorageProps) => {
  const [vectorStore, setVectorStore] = useState(null);
  const [name, setName] = useState('');
  const [editName, setEditName] = useState(false);

  const [getVectorStore, { data, refetch, loading: vectorStoresLoading }] = useLazyQuery(
    VECTOR_STORE,
    {
      variables: {
        vectorStoreId: vectorStoreId,
      },
      onCompleted: ({ vectorStore }) => {
        setVectorStore(vectorStore?.vectorStore);
        setName(vectorStore?.vectorStore?.name);
      },
    }
  );

  const [updateVectorStore, { loading }] = useMutation(UPDATE_VECTORE_STORE);

  const handleUpdateName = (name: string) => {
    updateVectorStore({
      variables: {
        updateVectorStoreId: vectorStoreId,
        input: {
          name,
        },
      },
      onCompleted: () => {
        setEditName(false);
        refetch();
      },
    });
  };

  useEffect(() => {
    if (vectorStoreId) {
      getVectorStore();
    }
  }, [vectorStoreId]);

  if (vectorStoresLoading) return <Loading />;

  if (!vectorStoreId || !data) return <div>Please select a vector storage</div>;

  return (
    <div className={styles.Main}>
      <OutlinedInput
        name="name"
        fullWidth
        value={name}
        disabled={!editName || loading}
        endAdornment={
          <InputAdornment
            className={styles.EditIcon}
            position="end"
            onClick={() => setEditName(!editName)}
            data-testid="editIcon"
          >
            {loading ? <CircularProgress /> : <EditIcon />}
          </InputAdornment>
        }
        onChange={(e) => setName(e.target.value)}
        onBlur={(e) => {
          handleUpdateName(e.target.value);
        }}
      />
      <StorageDetails storage={vectorStore} />
      <FilesAttached vectorStoreId={vectorStoreId} />
      <AssistantsAttached vectorStoreId={vectorStoreId} />
    </div>
  );
};
