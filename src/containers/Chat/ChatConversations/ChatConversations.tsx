import React, { useState, useEffect } from 'react';
import { Typography, Toolbar, Container, IconButton } from '@material-ui/core';
import CancelOutlined from '@material-ui/icons/CancelOutlined';
import { useApolloClient, useQuery } from '@apollo/client/react';

import styles from './ChatConversations.module.css';
import SearchBar from '../../../components/UI/SearchBar/SearchBar';
import selectedChatIcon from '../../../assets/images/icons/Chat/Selected.svg';
import ConversationList from './ConversationList/ConversationList';
import SavedSearchToolbar from '../../SavedSearch/SavedSearchToolbar/SavedSearchToolbar';
import { Button } from '../../../components/UI/Form/Button/Button';
import { DialogBox } from '../../../components/UI/DialogBox/DialogBox';
import { Collection } from '../../Search/Collection';
import { Tooltip } from '../../../components/UI/Tooltip/Tooltip';
import { advanceSearch } from '../../../context/role';
import { SEARCH_OFFSET } from '../../../graphql/queries/Search';

export interface ChatConversationsProps {
  contactId: number;
  simulator: any;
}

export const ChatConversations: React.SFC<ChatConversationsProps> = (props) => {
  const { contactId, simulator } = props;
  // get the conversations stored from the cache
  const [searchVal, setSearchVal] = useState('');
  const [searchParam, setSearchParam] = useState<any>({});
  const [selectedContactId, setSelectedContactId] = useState<any>(contactId);
  const [savedSearchCriteria, setSavedSearchCriteria] = useState<string>('');
  const [savedSearchCriteriaId, setSavedSearchCriteriaId] = useState(null);
  const [savedSearchCollection, setSavedSearchCollection] = useState(null);
  const [collectionMethod, setCollectionMethod] = useState('');
  const [dialog, setDialogbox] = useState(false);
  const [dialogType, setDialogboxType] = useState('');
  const [enableSearchMode, setEnableSearchMode] = useState(false);
  const offset = useQuery(SEARCH_OFFSET);
  const client = useApolloClient();

  // restore multi-search after conversation click
  useEffect(() => {
    if (offset.data && offset.data.search) {
      setSearchVal(offset.data.search);
      setEnableSearchMode(true);
    }
  }, [offset.data]);

  useEffect(() => {
    setSelectedContactId(contactId.toString());
  }, [contactId]);

  useEffect(() => {
    if (selectedContactId === simulator.simulatorId) {
      simulator.setShowSimulator(true);
    }
  }, [selectedContactId]);

  const handleChange = (event: any) => {
    if (event.target.param) {
      setSearchParam(event.target.param);
    }
    setSearchVal(event.target.value);

    if (Object.keys(searchParam).length === 0) {
      setEnableSearchMode(true);
    } else {
      setEnableSearchMode(false);
    }
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const searchValInput = event.target.querySelector('input').value.trim();
    setSearchVal(searchValInput);
  };

  const resetSearch = () => {
    setSearchVal('');
  };

  useEffect(() => {
    // reset search if empty searchVal
    if (!searchVal || searchVal === '') {
      client.writeQuery({
        query: SEARCH_OFFSET,
        data: { offset: 0, search: null },
      });
    }
  }, [searchVal]);

  const handlerSavedSearchCriteria = (criteria: string, id: any) => {
    // Reset(empty) advance search if collection changed
    setSearchParam({});
    resetSearch();

    setSavedSearchCriteria(criteria);
    setSavedSearchCriteriaId(id);
  };

  const closeDialogBox = () => {
    setDialogbox(false);
  };

  const search = (data: any) => {
    const target = { value: data.term, param: data };
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

  const saveHandler = (data: any) => {
    setSavedSearchCollection(data.savedSearch);
    handlerSavedSearchCriteria(data.savedSearch.args, data.savedSearch.id);
  };

  // create collection
  let dialogBox;
  if (dialog) {
    const match = { params: collectionMethod === 'update' ? { id: savedSearchCriteriaId } : {} };
    let collection = (
      <Collection
        match={match}
        type="saveSearch"
        search={search}
        searchParam={searchParam}
        handleCancel={closeDialogBox}
        handleSave={saveHandler}
      />
    );

    if (dialogType === 'search')
      collection = (
        <Collection
          match={match}
          type="search"
          search={search}
          searchParam={searchParam}
          handleCancel={closeDialogBox}
        />
      );

    dialogBox = (
      <DialogBox
        title=""
        handleCancel={closeDialogBox}
        handleOk={handleSubmit}
        buttonOk="Search"
        skipOk
        skipCancel
      >
        {collection}
      </DialogBox>
    );
  }

  const toolTip = 'The collection will be updated as per new filters';

  const buildButton = (toolTipTitle: string, type: string, label: string) => {
    return (
      <Tooltip title={toolTipTitle} placement="top">
        <Button
          color="primary"
          variant="outlined"
          className={styles.BackgroundWhite}
          onClick={(e: any) => {
            handleClick(e, 'saveSearch', type);
          }}
        >
          {label}
        </Button>
      </Tooltip>
    );
  };

  const btnUpdate = savedSearchCriteriaId ? buildButton(toolTip, 'update', 'Update') : null;

  const btnCreate = buildButton('Create a new collection', 'new', 'Create new');

  const btnCancel = (
    <IconButton
      className={styles.CancelButton}
      aria-label="cancel"
      onClick={() => {
        setSearchParam({});
        resetSearch();
      }}
    >
      <CancelOutlined className={styles.CancelOutlined} />
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
        onSelect={() => {
          // on select collection remove search value & disable search mode
          setSearchVal('');
          if (enableSearchMode) setEnableSearchMode(false);
        }}
        searchMode={enableSearchMode}
      />
      <SearchBar
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        onReset={() => resetSearch()}
        searchVal={searchVal}
        handleClick={handleClick}
        endAdornment
        searchMode={enableSearchMode}
      />
      <ConversationList
        searchVal={searchVal}
        searchMode={enableSearchMode}
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
