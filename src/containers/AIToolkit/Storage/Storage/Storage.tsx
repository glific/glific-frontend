import { storageInfo } from 'common/HelpData';
import styles from './Storage.module.css';
import { Heading } from 'components/UI/Heading/Heading';
import { List } from '../../ListItems/List';
import { CreateStorage } from '../CreateStorage/CreateStorage';
import { VECTOR_STORES } from 'graphql/queries/Storage';
import { useMutation } from '@apollo/client';
import { CREATE_STORAGE } from 'graphql/mutations/Storage';
import { useState } from 'react';

export const VectorStorage = () => {
  const [updateList, setUpdateList] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const states = {};
  const formFields = [{}];
  const FormSchema = {};

  const [createStorage] = useMutation(CREATE_STORAGE, {
    variables: {
      input: {
        name: null,
      },
    },
    onCompleted: () => {
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
            setCurrentItem={setCurrentItem}
          />
        </div>
        <div className={styles.RightContainer}>
          <CreateStorage currentItem={currentItem} />
        </div>
      </div>
    </div>
  );
};

export default VectorStorage;
