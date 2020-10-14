import React, { useState, useEffect } from 'react';
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
import { Tooltip } from '../../../components/UI/Tooltip/Tooltip';
import { advanceSearch } from '../../../context/role';

export interface ChatConversationsProps {
  contactId: number;
  simulator: any;
}

export const ChatConversations: React.SFC<ChatConversationsProps> = (props) => {
  // get the conversations stored from the cache
  const [searchVal, setSearchVal] = useState('');
  const [searchParam, setSearchParam] = useState<any>({});
  const [selectedContactId, setSelectedContactId] = useState<any>(props.contactId);
  const [savedSearchCriteria, setSavedSearchCriteria] = useState<string>('');
  const [savedSearchCriteriaId, setSavedSearchCriteriaId] = useState(null);
  const [savedSearchCollection, setSavedSearchCollection] = useState(null);
  const [collectionMethod, setCollectionMethod] = useState('');
  const [dialog, setDialogbox] = useState(false);
  const [dialogType, setDialogboxType] = useState('');

  useEffect(() => {
    setSelectedContactId(props.contactId.toString());
  }, [props.contactId]);

  useEffect(() => {
    if (selectedContactId === props.simulator.simulatorId) {
      props.simulator.setShowSimulator(true);
    }
  }, [selectedContactId]);

  const handleChange = (event: any) => {
    if (event.target.param) {
      setSearchParam(event.target.param);
    }
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
    // Reset(empty) advance search if collection changed
    setSearchParam({});
    resetSearch();

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

  const handleClick = (event: any, data: any, type: string) => {
    event.preventDefault();
    if (type) setCollectionMethod(type);
    if (data) setDialogboxType(data);
    setDialogbox(!dialog);
  };

  const closeDialogBox = () => {
    setDialogbox(false);
  };

  const saveHandler = (data: any) => {
    setSavedSearchCollection(data.savedSearch);
    handlerSavedSearchCriteria(data.savedSearch.args, data.savedSearch.id);
  };

  // create collection
  let dialogBox;
  if (dialog) {
    let match = { params: collectionMethod === 'update' ? { id: savedSearchCriteriaId } : {} };
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
          searchParam={searchParam}
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

  const toolTip = 'The collection will be updated as per new filters';

  const btnUpdate = savedSearchCriteriaId ? (
    <Tooltip title={toolTip} placement="top">
      <Button
        color="primary"
        variant="outlined"
        onClick={(e: any) => {
          handleClick(e, 'saveSearch', 'update');
        }}
      >
        Update
      </Button>
    </Tooltip>
  ) : null;

  const btnCreate = (
    <Tooltip title="Create a new collection" placement="top">
      <Button
        color="primary"
        variant="outlined"
        onClick={(e: any) => {
          handleClick(e, 'saveSearch', 'new');
        }}
      >
        Create new
      </Button>
    </Tooltip>
  );

  const btnCancel = (
    <IconButton
      className={styles.CancelButton}
      aria-label="cancel"
      onClick={(e: any) => {
        setSearchParam({});
        resetSearch();
      }}
    >
      <CancelOutlined />
    </IconButton>
  );

  let saveCollectionButton;

  if (Object.keys(searchParam).length !== 0)
    saveCollectionButton = advanceSearch ? (
      <div className={styles.SaveCollection}>
        <div className={styles.Container}>
          {btnUpdate}
          {btnCreate}
          {btnCancel}
        </div>
      </div>
    ) : null;

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
