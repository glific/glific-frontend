import { useMutation, useQuery } from '@apollo/client';
import Button from '@mui/material/Button';
import { CircularProgress } from '@mui/material';

import AddIcon from 'assets/images/AddGreenIcon.svg?react';
import CopyIcon from 'assets/images/icons/Settings/Copy.svg?react';
import { VECTOR_STORE_ASSISTANTS } from 'graphql/queries/Storage';

import styles from './AssistantsAttached.module.css';
import { CREATE_ASSISTANT } from 'graphql/mutations/Assistants';
import { copyToClipboard } from 'common/utils';
import { setNotification } from 'common/notification';

interface AssistantProps {
  vectorStoreId: any;
}

export const AssistantsAttached = ({ vectorStoreId }: AssistantProps) => {
  const { data, loading, refetch } = useQuery(VECTOR_STORE_ASSISTANTS, {
    variables: {
      vectorStoreId: vectorStoreId,
    },
  });

  const [createAssistant, { loading: creatingAssistant }] = useMutation(CREATE_ASSISTANT);

  const handleCreateAssistant = () => {
    createAssistant({
      variables: {
        input: {
          vectorStoreId,
        },
      },
      onCompleted: () => {
        setNotification('Assistant created successfully!');
        refetch();
      },
    });
  };

  return (
    <div className={styles.Container}>
      <div className={styles.Header}>
        <h5>Used by</h5>
        {creatingAssistant ? (
          <CircularProgress size={24} />
        ) : (
          <Button data-testid="addAssistant" onClick={handleCreateAssistant} variant="outlined">
            <AddIcon />
            Add Assistant
          </Button>
        )}
      </div>
      <div className={styles.AssistantsList}>
        <div className={styles.AssistantHeading}>
          <span>Resource</span>
          <span>Assistant ID</span>
        </div>
        {loading ? (
          <CircularProgress />
        ) : (
          data?.vectorStore?.vectorStore?.assistants &&
          (data?.vectorStore?.vectorStore?.assistants.length === 0 ? (
            <div className={styles.EmptyText}>Not used by any resources.</div>
          ) : (
            data?.vectorStore?.vectorStore?.assistants?.map((assistant: any) => (
              <div className={styles.Assistant} key={assistant.id}>
                <span>{assistant.name}</span>
                <span>
                  <CopyIcon onClick={() => copyToClipboard(assistant.assistantId)} />
                  <span>{assistant.assistantId}</span>
                </span>
              </div>
            ))
          ))
        )}
      </div>
    </div>
  );
};
