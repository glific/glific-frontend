import { assistantsInfo } from 'common/HelpData';
import { Heading } from 'components/UI/Heading/Heading';
import styles from './Assistants.module.css';
import SearchBar from 'components/UI/SearchBar/SearchBar';
import { CreateAssistant } from '../CreateAssistant/CreateAssistant';
import { List } from '../../ListItems/List';
import { VECTOR_STORES } from 'graphql/queries/Storage';
import { useState } from 'react';

export const Assistants = () => {
  const [updateList, setUpdateList] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const assistants = [
    { title: 'Untitled assistant', id: 'asst_KsGPe1fAchlx6lAggIWfPEXN', inserted_at: '6:30 PM' },
    { title: 'Vyse module', id: 'asst_KsGPe1fAchlx6lAggIWfPEXN', inserted_at: '6:30 PM' },
    {
      title: 'Sova integration module',
      id: 'asst_KsGPe1fAchlx6lAggIWfPEXN',
      inserted_at: '6:30 PM',
    },
  ];

  return (
    <div className={styles.AssistantContainer}>
      <Heading
        formTitle="Assistants"
        helpData={assistantsInfo}
        headerHelp="Purpose-built AI that uses OpenAI's models and calls tools"
        button={{ show: true, label: 'Create Assistant', action: () => {} }}
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
          <List
            getItemsQuery={VECTOR_STORES}
            listItemName="assistants"
            refreshList={updateList}
            setCurrentId={setCurrentId}
          />
        </div>
        <div className={styles.RightContainer}>
          <CreateAssistant />
        </div>
      </div>
    </div>
  );
};

export default Assistants;
