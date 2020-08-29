import React, { useState } from 'react';
import { Typography, Toolbar, Container, IconButton } from '@material-ui/core';
import styles from './ChatConversations.module.css';
import SearchBar from '../../../components/UI/SearchBar/SearchBar';
import selectedChatIcon from '../../../assets/images/icons/Chat/Selected.svg';
import ConversationList from './ConversationList/ConversationList';
import SavedSearchToolbar from '../../SavedSearch/SavedSearchToolbar/SavedSearchToolbar';
import { Button } from '../../../components/UI/Form/Button/Button';
import { DialogBox } from '../../../components/UI/DialogBox/DialogBox';
import { Collection } from '../../Collection/Collection';
import CancelOutlined from '@material-ui/icons/CancelOutlined';

export interface ChatConversationsProps {
  contactId: number;
}

export const ChatConversations: React.SFC<ChatConversationsProps> = (props) => {
  // get the conversations stored from the cache
  const [searchVal, setSearchVal] = useState('');
  const [searchParam, setSearchParam] = useState({});
  const [selectedContactId, setSelectedContactId] = useState(props.contactId);
  const [savedSearchCriteria, setSavedSearchCriteria] = useState<string>('');
  const [savedSearchCriteriaId, setSavedSearchCriteriaId] = useState(null);
  const [savedSearchCollection, setSavedSearchCollection] = useState(null);
  const [dialog, setDialogbox] = useState(false);
  const [dialogType, setDialogboxType] = useState('');

  const handleChange = (event: any) => {
    if (event.target.param) setSearchParam(event.target.param);
    setSearchVal(event.target.value);
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    let searchVal = event.target.querySelector('input').value.trim();
    setSearchVal(searchVal);
  };

  const resetSearch = () => {
    setSearchVal('');
  };

  const handlerSavedSearchCriteria = (criteria: string, id: any) => {
    setSavedSearchCriteria(criteria);
    setSavedSearchCriteriaId(id);
  };

  const search = (data: any) => {
    let target = { value: data.term, param: data };
    if (handleChange) {
      handleChange({ target });
    }
    // After search close dialogbox
    closeDialogBox();
    if (dialogType === 'saveSearch') {
      setSearchParam({});
      resetSearch();
    }
  };

  const handleClick = (event: any, data: any) => {
    event.preventDefault();
    if (data) setDialogboxType(data);
    setDialogbox(!dialog);
  };

  const closeDialogBox = () => {
    setDialogbox(false);
  };

  const saveHandler = (data: any) => {
    setSavedSearchCollection(data.createSavedSearch.savedSearch);
    handlerSavedSearchCriteria(
      data.createSavedSearch.savedSearch.args,
      data.createSavedSearch.savedSearch.id
    );
  };

  // create collection
  let dialogBox;
  if (dialog) {
    let match = { params: { id: savedSearchCriteriaId } };
    let collection = (
      <Collection
        match={match}
        type="saveSearch"
        search={search}
        searchParam={searchParam}
        handleCancel={closeDialogBox}
        handleSave={saveHandler}
      ></Collection>
    );

    if (dialogType === 'search')
      collection = (
        <Collection
          match={match}
          type="search"
          search={search}
          handleCancel={closeDialogBox}
        ></Collection>
      );

    dialogBox = (
      <DialogBox
        title=""
        handleCancel={closeDialogBox}
        handleOk={handleSubmit}
        buttonOk="Search"
        skipOk={true}
        skipCancel={true}
      >
        {collection}
      </DialogBox>
    );
  }

  let saveCollectionButton;

  if (Object.keys(searchParam).length !== 0)
    saveCollectionButton = (
      <div className={styles.SaveCollection}>
        <div className={styles.container}>
          <Button
            className={styles.button}
            color="primary"
            variant="outlined"
            onClick={(e: any) => {
              handleClick(e, 'saveSearch');
            }}
          >
            Save search to collections
          </Button>
          <IconButton
            className={styles.cancelButton}
            aria-label="cancel"
            onClick={(e: any) => {
              setSearchParam({});
              resetSearch();
            }}
          >
            <CancelOutlined />
          </IconButton>
        </div>
      </div>
    );

  return (
    <Container className={styles.ChatConversations} disableGutters>
      <Toolbar className={styles.ToolBar}>
        <div className={styles.IconBackground}>
          <img src={selectedChatIcon} height="24" className={styles.Icon} alt="Conversation" />
        </div>
        <div className={styles.Title}>
          <Typography className={styles.TitleText} variant="h6">
            Chats
          </Typography>
        </div>
      </Toolbar>
      <SavedSearchToolbar
        savedSearchCriteriaCallback={handlerSavedSearchCriteria}
        refetchData={{ savedSearchCollection }}
      />
      <SearchBar
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        onReset={() => resetSearch()}
        searchVal={searchVal}
        handleClick={handleClick}
        endAdornment={true}
      />
      <ConversationList
        searchVal={searchVal}
        searchParam={searchParam}
        selectedContactId={selectedContactId}
        setSelectedContactId={(i: number) => {
          setSelectedContactId(i);
        }}
        savedSearchCriteria={savedSearchCriteria}
      />
      {saveCollectionButton}
      {dialogBox}
    </Container>
  );
};

export default ChatConversations;
