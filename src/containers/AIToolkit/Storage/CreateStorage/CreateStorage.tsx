import { Input } from 'components/UI/Form/Input/Input';
import { StorageDetails } from '../StorageDetails/StorageDetails';
import { FilesAttached } from '../Files/Files';
import { CircularProgress, InputAdornment, OutlinedInput, TextField } from '@mui/material';
import { AssistantsAttached } from '../Assistants/AssistantsAttached';
import { useMutation, useQuery } from '@apollo/client';
import { VECTOR_STORE } from 'graphql/queries/Storage';
import EditIcon from 'assets/images/icons/GreenEdit.svg?react';
import styles from './CreateStorage.module.css';
import { useState } from 'react';
import { UPDATE_VECTORE_STORE } from 'graphql/mutations/Storage';
import { Loading } from 'components/UI/Layout/Loading/Loading';
interface CreateStorageProps {
  currentId: any;
}

const storageOb = {
  id: 'vs_KyUlkD25kP34DIANLwxYWQK0',
  size: 100,
  last_active: '2021-10-01',
  inserted_at: '2021-10-01',
};

const files = [{ id: '1', file_name: 'file1', inserted_at: '2021-10-01' }];

const assistants = [
  { id: 'asst_KyUlkD25kP34DIANLwxYWQK0', name: 'Vyse module', inserted_at: '2021-10-01' },
];

export const CreateStorage = ({ currentId }: CreateStorageProps) => {
  const [vectorStore, setVectorStore] = useState(null);
  const [name, setName] = useState('');
  const [editName, setEditName] = useState(false);

  const { data, refetch } = useQuery(VECTOR_STORE, {
    variables: {
      vectorStoreId: currentId,
      skip: !currentId,
    },
    onCompleted: ({ vectorStore }) => {
      setVectorStore(vectorStore?.vectorStore);
      setName(vectorStore?.vectorStore?.name);
    },
  });

  const [updateVectorStore, { loading }] = useMutation(UPDATE_VECTORE_STORE);

  const handleUpdateName = (name: string) => {
    updateVectorStore({
      variables: {
        updateVectorStoreId: currentId,
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

  if (!currentId || !data) return <div>Please select a vector storage</div>;

  return (
    <div className={styles.Main}>
      <OutlinedInput
        fullWidth
        value={name}
        disabled={!editName || loading}
        endAdornment={
          <InputAdornment
            className={styles.EditIcon}
            position="end"
            onClick={() => setEditName(!editName)}
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
      <FilesAttached currentId={currentId} />
      <AssistantsAttached currentId={currentId} />
    </div>
  );
};
