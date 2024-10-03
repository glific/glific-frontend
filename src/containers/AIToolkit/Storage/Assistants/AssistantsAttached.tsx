import { useQuery } from '@apollo/client';
import Button from '@mui/material/Button';
import { CircularProgress } from '@mui/material';

import AddIcon from 'assets/images/AddGreenIcon.svg?react';
import { VECTOR_STORE_ASSISTANTS } from 'graphql/queries/Storage';

import styles from './AssistantsAttached.module.css';

interface AssistantProps {
  vectorStoreId: any;
}

export const AssistantsAttached = ({ vectorStoreId }: AssistantProps) => {
  const { data, loading } = useQuery(VECTOR_STORE_ASSISTANTS, {
    variables: {
      vectorStoreId: vectorStoreId,
    },
  });

  return (
    <div className={styles.Container}>
      <div className={styles.Header}>
        <h5>Used by</h5>

        <Button onClick={() => true} variant="outlined">
          <AddIcon />
          Add Assistant
        </Button>
      </div>
      <div className={styles.AssistantsList}>
        {loading ? (
          <CircularProgress />
        ) : (
          data?.vectorStore?.vectorStore?.assistants &&
          (data?.vectorStore?.vectorStore?.assistants.length === 0 ? (
            <div className={styles.EmptyText}>Not used by any resources.</div>
          ) : (
            data?.vectorStore?.vectorStore?.assistants?.map((assistant: any) => (
              <div className={styles.assistant} key={assistant?.id}>
                <div>
                  <span>{assistant.id}</span>
                </div>
              </div>
            ))
          ))
        )}
      </div>
    </div>
  );
};
