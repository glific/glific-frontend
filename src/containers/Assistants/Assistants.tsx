import { useMutation } from '@apollo/client';
import { useEffect, useState } from 'react';

import { assistantsInfo } from 'common/HelpData';

import { Heading } from 'components/UI/Heading/Heading';

import { CREATE_ASSISTANT } from 'graphql/mutations/Assistant';
import { GET_ASSISTANTS } from 'graphql/queries/Assistant';

import { CreateAssistant } from './CreateAssistant/CreateAssistant';
import { List } from './ListItems/List';
import styles from './Assistants.module.css';
import { useParams } from 'react-router';
import { setNotification } from 'common/notification';

export const Assistants = () => {
  const params = useParams();
  const [updateList, setUpdateList] = useState(false);
  const [assistantId, setAssistantId] = useState<string | null>(null);

  const [createAssistant] = useMutation(CREATE_ASSISTANT);

  const handleCreateAssistant = () => {
    createAssistant({
      variables: {
        input: {
          name: null,
        },
      },
      onCompleted: ({ createAssistant }) => {
        setNotification('Assistant created successfully', 'success');
        setAssistantId(createAssistant.assistant.id);
        setUpdateList(!updateList);
      },
    });
  };

  useEffect(() => {
    if (params.assistantId) setAssistantId(params.assistantId);
  }, [params]);

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
