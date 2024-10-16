import { assistantsInfo } from 'common/HelpData';
import { Heading } from 'components/UI/Heading/Heading';
import styles from './Assistants.module.css';
import { useState } from 'react';
import { List } from './ListItems/List';
import { CreateAssistant } from './CreateAssistant/CreateAssistant';
import { GET_ASSISTANTS } from 'graphql/queries/Assistant';
import { useMutation } from '@apollo/client';
import { CREATE_ASSISTANT } from 'graphql/mutations/Assistant';

export const Assistants = () => {
  const [updateList, setUpdateList] = useState(false);
  const [assistantId, setAssistantId] = useState(null);

  const [createAssistant] = useMutation(CREATE_ASSISTANT);

  const handleCreateAssistant = () => {
    createAssistant({
      variables: {
        input: {
          name: null,
        },
      },
      onCompleted: ({ createAssistant }) => {
        setAssistantId(createAssistant.assistant.id);
        setUpdateList(!updateList);
      },
    });
  };

  return (
    <div className={styles.AssistantContainer}>
      <Heading
        formTitle="Assistants"
        helpData={assistantsInfo}
        headerHelp="Purpose-built AI that uses OpenAI's models and calls tools"
        button={{ show: true, label: 'Create Assistant', action: handleCreateAssistant }}
      />
      <div className={styles.MainContainer}>
        <div className={styles.LeftContainer}>
          <List
            getItemsQuery={GET_ASSISTANTS}
            listItemName="assistants"
            refreshList={updateList}
            setCurrentId={setAssistantId}
            currentId={assistantId}
          />
        </div>
        <div className={styles.RightContainer}>
          {assistantId ? (
            <CreateAssistant
              setUpdateList={setUpdateList}
              setCurrentId={setAssistantId}
              currentId={assistantId}
              updateList={updateList}
            />
          ) : (
            <p className={styles.EmptyText}>Select/Create an assistant</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assistants;
