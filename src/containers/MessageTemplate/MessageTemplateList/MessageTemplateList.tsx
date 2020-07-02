import React, { useState, useEffect } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { useApolloClient } from '@apollo/client';
import { setNotification } from '../../../common/notification';
import { IconButton, InputBase, Typography, Divider } from '@material-ui/core';
import { Button } from '../../../components/UI/Form/Button/Button';
import { Loading } from '../../../components/UI/Layout/Loading/Loading';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import SearchIcon from '@material-ui/icons/Search';
import { Pager } from '../../../components/UI/Pager/Pager';
import { GET_TEMPLATES_COUNT, FILTER_TEMPLATES } from '../../../graphql/queries/Template';
import { NOTIFICATION } from '../../../graphql/queries/Notification';
import { DELETE_TEMPLATE } from '../../../graphql/mutations/Template';
import { ToastMessage } from '../../../components/UI/ToastMessage/ToastMessage';
import { DialogBox } from '../../../components/UI/DialogBox/DialogBox';
import styles from './MessageTemplateList.module.css';
import { SearchBar } from '../../Chat/ChatConversations/SearchBar';

export interface TemplateListProps {}

interface TableVals {
  pageNum: number;
  pageRows: number;
  sortCol: string;
  sortDirection: 'asc' | 'desc';
}

export const MessageTemplateList: React.SFC<TemplateListProps> = (props) => {
  const client = useApolloClient();

  // DialogBox states
  const [deleteTemplateID, setDeleteTemplateID] = useState<number | null>(null);
  const [deleteTemplateName, setDeleteTemplateName] = useState<string>('');

  const [newTemplate, setNewTemplate] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // Table attributes
  const columnNames = ['Label', 'Body', 'Actions'];
  const [tableVals, setTableVals] = useState<TableVals>({
    pageNum: 0,
    pageRows: 10,
    sortCol: columnNames[0],
    sortDirection: 'asc',
  });

  const handleTableChange = (attribute: string, newVal: number | string) => {
    // To handle sorting by columns that are not Name (currently don't support this functionality)
    if (attribute === 'sortCol' && newVal !== 'Label') {
      return;
    }
    // Otherwise, set all values like normal
    setTableVals({
      ...tableVals,
      [attribute]: newVal,
    });
  };

  const filterPayload = () => {
    return {
      filter: {
        label: searchVal,
      },
      order: tableVals.sortDirection.toUpperCase(),
    };
  };

  // Get the total number of Templates here
  const { loading: l, error: e, data: countData, refetch: refetchCount } = useQuery(
    GET_TEMPLATES_COUNT,
    {
      variables: {
        filter: {
          label: '',
        },
      },
    }
  );

  useEffect(() => {
    refetch(filterPayload());
  }, [searchVal, tableVals]);

  // Make a new count request for a new count of the # of rows from this query in the back-end.
  useEffect(() => {
    refetchCount({
      filter: {
        label: searchVal,
      },
    });
  }, [searchVal]);

  // Get TEMPLATE data here
  const { loading, error, data, refetch } = useQuery(FILTER_TEMPLATES, {
    variables: filterPayload(),
  });

  const message = useQuery(NOTIFICATION);

  let deleteId: number = 0;

  const [deleteTemplate] = useMutation(DELETE_TEMPLATE, {
    update(cache) {
      const templates: any = cache.readQuery({
        query: FILTER_TEMPLATES,
        variables: filterPayload(),
      });
      const templatesCopy = JSON.parse(JSON.stringify(templates));
      templatesCopy.sessionTemplates = templates.sessionTemplates.filter(
        (val: any) => val.id !== deleteId
      );
      cache.writeQuery({
        query: FILTER_TEMPLATES,
        variables: filterPayload(),
        data: templatesCopy,
      });
    },
  });

  const showDialogHandler = (id: any, label: string) => {
    setDeleteTemplateName(label);
    setDeleteTemplateID(id);
  };
  const closeToastMessage = () => {
    setNotification(client, null);
  };

  const closeDialogBox = () => {
    setDeleteTemplateID(null);
  };

  const handleDeleteTemplate = () => {
    if (deleteTemplateID !== null) {
      deleteHandler(deleteTemplateID);
    }
    setDeleteTemplateID(null);
  };

  let toastMessage;
  if (message.data && message.data.message) {
    toastMessage = <ToastMessage message={message.data.message} handleClose={closeToastMessage} />;
  }

  let dialogBox;
  if (deleteTemplateID) {
    dialogBox = (
      <DialogBox
        title={`Delete speed send: ${deleteTemplateName}`}
        handleCancel={closeDialogBox}
        handleOk={handleDeleteTemplate}
      >
        Are you sure you want to delete the speed send?
      </DialogBox>
    );
  }

  if (newTemplate) {
    return <Redirect to="/speed-send/add" />;
  }

  if (loading || l) return <Loading />;
  if (error || e) {
    return <p>Error :(</p>;
  }

  const deleteHandler = (id: number) => {
    deleteId = id;
    deleteTemplate({ variables: { id } });
    setNotification(client, 'Speed send deleted successfully');
  };

  // Reformat all tags to be entered in table
  function getIcons(id: number | undefined, label: string) {
    if (id) {
      return (
        <>
          <Link to={'/speed-send/' + id + '/edit'}>
            <IconButton aria-label="Edit" color="default">
              <EditIcon />
            </IconButton>
          </Link>
          <IconButton
            aria-label="Delete"
            color="default"
            onClick={() => showDialogHandler(id!, label)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      );
    }
  }

  function formatTemplates(templates: Array<any>) {
    // Should be type template, but can't import template type into file
    return templates.map((t: any) => {
      return {
        label: t.label,
        description: t.body,
        operations: getIcons(t.id, t.label),
      };
    });
  }

  const resetTableVals = () => {
    setTableVals({
      pageNum: 0,
      pageRows: 10,
      sortCol: columnNames[0],
      sortDirection: 'asc',
    });
  };

  const handleSearch = (e: any) => {
    e.preventDefault();
    let searchVal = e.target.searchInput.value.trim();
    setSearchVal(searchVal);
    resetTableVals();
  };

  // Get template data and total number of templates.
  let templateList: any;
  if (data) {
    templateList = formatTemplates(data.sessionTemplates);
  }

  let templateCount: number = tableVals.pageRows;
  if (countData) {
    templateCount = countData.countSessionTemplates;
  }

  return (
    <>
      <div className={styles.Header}>
        <Typography variant="h5" className={styles.Title}>
          Speed sends
        </Typography>
        <div className={styles.Buttons}>
          <SearchBar
            handleSubmit={handleSearch}
            onReset={() => {
              setSearchVal('');
              resetTableVals();
            }}
            searchVal={searchVal}
          />
          <form onSubmit={handleSearch}>
            <div className={searchOpen ? styles.SearchBar : styles.HideSearchBar}>
              <InputBase
                defaultValue={searchVal}
                className={searchOpen ? styles.ShowSearch : styles.HideSearch}
                name="nameSearch"
              />
              {searchOpen ? (
                <div
                  className={styles.ResetSearch}
                  onClick={() => {
                    setSearchVal('');
                    resetTableVals();
                  }}
                >
                  <Divider orientation="vertical" />
                  <CloseIcon className={styles.CloseIcon}></CloseIcon>
                </div>
              ) : null}
            </div>
          </form>
          <div>
            {toastMessage}
            {dialogBox}
            <div className={styles.AddButton}>
              <Button color="primary" variant="contained" onClick={() => setNewTemplate(true)}>
                Add New
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Rendering list of templates */}
      {templateList ? (
        <Pager
          columnNames={columnNames}
          data={templateList}
          totalRows={templateCount}
          handleTableChange={handleTableChange}
          tableVals={tableVals}
        />
      ) : (
        <div>There are no templates.</div>
      )}
    </>
  );
};
