import { Input } from 'components/UI/Form/Input/Input';
import { StorageDetails } from '../StorageDetails/StorageDetails';
import { FilesAttached } from '../Files/Files';
import { InputAdornment, OutlinedInput, TextField } from '@mui/material';
import { AssistantsAttached } from '../Assistants/AssistantsAttached';
import { useQuery } from '@apollo/client';
import { VECTOR_STORE } from 'graphql/queries/Storage';
import EditIcon from 'assets/images/icons/GreenEdit.svg?react';
import styles from './CreateStorage.module.css';
import { useState } from 'react';
interface CreateStorageProps {
  currentItem: any;
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

export const CreateStorage = ({ currentItem }: CreateStorageProps) => {
  const [vectorStore, setVectorStore] = useState(null);
  const [name, setName] = useState('');
  const [editName, setEditName] = useState(false);

  const { data } = useQuery(VECTOR_STORE, {
    variables: {
      vectorStoreId: currentItem,
      skip: !currentItem,
    },
    onCompleted: ({ vectorStore }) => {
      console.log(vectorStore?.vectorStore);

      setVectorStore(vectorStore?.vectorStore);
      setName(vectorStore?.vectorStore?.name);
    },
  });

  const fields = [
    {
      component: Input,
      name: 'name',
      label: 'Name',
      type: 'text',
    },
    {
      component: StorageDetails,
      storage: storageOb,
    },
    {
      component: FilesAttached,
      files: [],
    },
  ];

  if (!currentItem || data) return <div>Please select a vector storage</div>;

  return (
    <div>
      <OutlinedInput
        fullWidth
        value={name}
        disabled={!editName}
        endAdornment={
          <InputAdornment
            className={styles.EditIcon}
            position="end"
            onClick={() => setEditName(!editName)}
          >
            <EditIcon />
          </InputAdornment>
        }
        onChange={(e) => setName(e.target.value)}
        onBlur={(e) => {
          console.log(e.target.value);
        }}
      />
      <StorageDetails storage={vectorStore} />
      <FilesAttached files={files} />
      <AssistantsAttached assistants={assistants} />
    </div>
  );
};
