import { useState, useEffect } from 'react';
import { Container, FormControl, IconButton, MenuItem, Select } from '@mui/material';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import { useApolloClient, useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import SearchBar from 'components/UI/SearchBar/SearchBar';
import SavedSearchToolbar from 'containers/SavedSearch/SavedSearchToolbar/SavedSearchToolbar';
import { Button } from 'components/UI/Form/Button/Button';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Search } from 'containers/Search/Search';
import { Tooltip } from 'components/UI/Tooltip/Tooltip';
import { getUserRolePermissions } from 'context/role';
import { SEARCH_OFFSET } from 'graphql/queries/Search';
import ConversationList from './ConversationList/ConversationList';
import styles from './ChatConversations.module.css';
import Track from 'services/TrackService';

export interface ChatConversationsProps {
  contactId?: number | string;
  groups?: boolean;
  setPhonenumber?: any;
  phonenumber?: string;
}

export const ChatConversations = ({
  contactId,
  groups = false,
  phonenumber,
  setPhonenumber,
}: ChatConversationsProps) => {
  // get the conversations stored from the cache
  const [searchVal, setSearchVal] = useState<any>();
  const [searchParam, setSearchParam] = useState<any>({});
  const [selectedContactId, setSelectedContactId] = useState<any>(contactId);
  const [savedSearchCriteria, setSavedSearchCriteria] = useState<string>('');
  const [savedSearchCriteriaId, setSavedSearchCriteriaId] = useState(null);
  const [savedSearches, setSavedSearches] = useState(null);
  const [dialog, setDialogbox] = useState(false);
  const [dialogType, setDialogboxType] = useState('');
  const [enableSearchMode, setEnableSearchMode] = useState(false);
  const offset = useQuery(SEARCH_OFFSET);
  const client = useApolloClient();
  const { t } = useTranslation();

  const MOCK_PHONENUMBERS = [
    { label: '918657048983', value: '918657048983' },
    { label: '918439201748', value: '918439201748' },
    { label: '918781934028', value: '918781934028' },
  ];

  // restore multi-search after conversation click
  useEffect(() => {
    if (offset.data && offset.data.search) {
      setSearchVal(offset.data.search);
      setEnableSearchMode(true);
    }
  }, [offset.data]);

  useEffect(() => {
    setSelectedContactId(contactId?.toString());
  }, [contactId]);

  let timer: any = null;

  const handleChange = (event: any) => {
    if (event.target.param) {
      setSearchParam(event.target.param);
    }

    // wait for a second to avoid API call on each keyup event
    clearTimeout(timer);
    timer = setTimeout(() => setSearchVal(event.target.value), 1000);

    if (Object.keys(searchParam).length === 0) {
      setEnableSearchMode(true);
    } else {
      setEnableSearchMode(false);
    }
  };

  const handleSubmit = (event: any) => {
    Track('Chat search');
    event.preventDefault();
    const searchValInput = event.target.querySelector('input').value.trim();
    setSearchVal(searchValInput);
  };

  const resetSearch = () => {
    setSearchVal(undefined);
  };

  useEffect(() => {
    // reset search if empty searchVal
    if (!searchVal) {
      client.writeQuery({
        query: SEARCH_OFFSET,
        data: { offset: 0, search: null },
      });
    }
  }, [searchVal]);

  const handlerSavedSearchCriteria = (criteria: string, id: any) => {
    // Reset(empty) advance search if searches changed
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
    handleChange({ target });

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
    setDialogbox((dialog) => !dialog);
  };

  const saveHandler = (data: any) => {
    setSavedSearches(data.savedSearch);
    handlerSavedSearchCriteria(data.savedSearch.args, data.savedSearch.id);
  };

  // create searches
  let dialogBox;
  if (dialog) {
    const isearchType = dialogType === 'search';
    dialogBox = (
      <DialogBox
        titleAlign="left"
        title={isearchType ? t('Search conversations') : t('Save Search')}
        handleCancel={closeDialogBox}
        handleOk={handleSubmit}
        buttonOk={t('Search')}
        skipOk
        skipCancel
      >
        <Search
          type={isearchType ? 'search' : 'saveSearch'}
          search={search}
          searchParam={searchParam}
          handleCancel={closeDialogBox}
          handleSave={isearchType ? undefined : saveHandler}
          searchId={isearchType ? undefined : savedSearchCriteriaId}
        />
      </DialogBox>
    );
  }

  const toolTip = t('The search will be updated as per new filters');

  const buildButton = (toolTipTitle: string, label: string) => (
    <Tooltip title={toolTipTitle} placement="top">
      <Button
        color="primary"
        variant="outlined"
        className={styles.BackgroundWhite}
        onClick={(e: any) => {
          handleClick(e, 'saveSearch');
        }}
      >
        {label}
      </Button>
    </Tooltip>
  );

  const btnUpdate = savedSearchCriteriaId ? buildButton(toolTip, 'Update') : null;

  const btnCreate = buildButton(t('Create a new search'), t('Create new'));

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

  let saveSearchButton;

  // check if the user has access to manage collections
  const userRolePermissions = getUserRolePermissions();

  if (Object.keys(searchParam).length !== 0)
    saveSearchButton = userRolePermissions.manageSavedSearches ? (
      <div className={styles.SaveSearch}>
        <div className={styles.Container}>
          {btnUpdate}
          {btnCreate}
          {btnCancel}
        </div>
      </div>
    ) : null;

  return (
    <Container className={styles.ChatConversations} disableGutters>
      <div className={styles.SearchBar}>
        <SearchBar
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          onReset={() => resetSearch()}
          searchVal={searchVal}
          handleClick={handleClick}
          endAdornment
          searchMode={enableSearchMode}
          iconFront
        />
      </div>
      <SavedSearchToolbar
        savedSearchCriteriaCallback={handlerSavedSearchCriteria}
        refetchData={{ savedSearches }}
        onSelect={() => {
          // on select searches remove search value & disable search mode
          setSearchVal(undefined);
          if (enableSearchMode) setEnableSearchMode(false);
        }}
        searchMode={enableSearchMode}
      />
      {groups && (
        <div className={styles.DropDownContainer}>
          <FormControl>
            <Select
              aria-label="maytapi-phonenumber"
              name="maytapi-phonenumber"
              value={phonenumber}
              onChange={(event) => {
                const { value } = event.target;
                setPhonenumber(JSON.parse(value));
              }}
              className={styles.DropDown}
            >
              {MOCK_PHONENUMBERS.map((phonenumber: any) => (
                <MenuItem key={phonenumber.label} value={phonenumber.value}>
                  {phonenumber.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      )}
      <ConversationList
        groups={groups}
        searchVal={searchVal}
        searchMode={enableSearchMode}
        searchParam={searchParam}
        selectedContactId={selectedContactId}
        setSelectedContactId={(i: number) => {
          setSelectedContactId(i);
        }}
        savedSearchCriteria={savedSearchCriteria}
        savedSearchCriteriaId={savedSearchCriteriaId}
        entityType="contact"
      />
      {saveSearchButton}
      {dialogBox}
    </Container>
  );
};

export default ChatConversations;
