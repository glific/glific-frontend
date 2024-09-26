import { Input } from 'components/UI/Form/Input/Input';
import { StorageDetails } from '../StorageDetails/StorageDetails';
import { FilesAttached } from '../Files/Files';
import { OutlinedInput } from '@mui/material';
import { AssistantsAttached } from '../Assistants/AssistantsAttached';

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

export const CreateStorage = () => {
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
  return (
    <div>
      <OutlinedInput />
      <StorageDetails storage={storageOb} />
      <FilesAttached files={files} />
      <AssistantsAttached assistants={assistants} />
    </div>
  );
};
