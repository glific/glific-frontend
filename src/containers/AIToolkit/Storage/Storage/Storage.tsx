import { useMutation } from '@apollo/client';
import { useState } from 'react';

import { storageInfo } from 'common/HelpData';
import { setNotification } from 'common/notification';
import { Heading } from 'components/UI/Heading/Heading';
import { VECTOR_STORES } from 'graphql/queries/Storage';
import { CREATE_STORAGE } from 'graphql/mutations/Storage';

import { List } from '../../ListItems/List';
import { CreateStorage } from '../CreateStorage/CreateStorage';

import styles from './Storage.module.css';

export const VectorStorage = () => {
  const [updateList, setUpdateList] = useState(false);
  const [vectorStoreId, setVectorStoreId] = useState(null);

  const [createStorage] = useMutation(CREATE_STORAGE, {
    variables: {
      input: {
        name: null,
      },
    },
    onCompleted: () => {
      setNotification('Vector store created successfully!');
      setUpdateList(!updateList);
    },
  });

  const handleCreateStorage = () => {
    createStorage();
  };

  return (
    <div className={styles.StoragetContainer}>
      <Heading
        formTitle="Vector Storage"
        helpData={storageInfo}
        headerHelp="Purpose-built AI that uses OpenAI's models and calls tools"
        button={{ show: true, label: 'Create Storage', action: handleCreateStorage }}
      />
      <div className={styles.MainContainer}>
        <div className={styles.LeftContainer}>
          <List
            getItemsQuery={VECTOR_STORES}
            listItemName="vectorStores"
            refreshList={updateList}
            setCurrentId={setVectorStoreId}
            currentId={vectorStoreId}
          />
        </div>
        <div className={styles.RightContainer}>
          <CreateStorage vectorStoreId={vectorStoreId} />
        </div>
      </div>
    </div>
  );
};

export default VectorStorage;
