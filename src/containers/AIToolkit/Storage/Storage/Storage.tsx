import { storageInfo } from 'common/HelpData';
import styles from './Storage.module.css';
import { Heading } from 'components/UI/Heading/Heading';
import SearchBar from 'components/UI/SearchBar/SearchBar';
import { List } from '../../ListItems/List';
import { CreateStorage } from '../CreateStorage/CreateStorage';

export const VectorStorage = () => {
  const storage = [
    { title: 'Untitled store', id: 'vs_KyUlkD25kP34DIANLwxYWQK0', inserted_at: '6:30 PM' },
    {
      title: 'Smart store for vyse module',
      id: 'vs_KyUlkD25kP34DIANLwxYWQK0',
      inserted_at: '6:30 PM',
    },
    {
      title: 'Sova Integration module',
      id: 'vs_KyUlkD25kP34DIANLwxYWQK0',
      inserted_at: '6:30 PM',
    },
  ];
  const states = {};
  const formFields = [{}];
  const FormSchema = {};

  return (
    <div className={styles.StoragetContainer}>
      <Heading
        formTitle="Vector Storage"
        helpData={storageInfo}
        headerHelp="Purpose-built AI that uses OpenAI's models and calls tools"
        button={{ show: true, label: 'Create Storage', action: () => {} }}
      />
      <div className={styles.MainContainer}>
        <div className={styles.LeftContainer}>
          <div className={styles.Search}>
            <SearchBar
              className={styles.ChatSearchBar}
              handleChange={() => {}}
              onReset={() => ''}
              searchMode
              iconFront
            />
          </div>
          <List listItems={[...storage, ...storage, ...storage]} />
        </div>
        <div className={styles.RightContainer}>
          <CreateStorage />
        </div>
      </div>
    </div>
  );
};

export default VectorStorage;
