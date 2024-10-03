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
  const [assistantId, setAssistantId] = useState(null);

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
          <List
            getItemsQuery={VECTOR_STORES}
            listItemName="assistants"
            refreshList={updateList}
            setCurrentId={setAssistantId}
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
