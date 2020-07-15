import React, { useState, useEffect, useCallback } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { useApolloClient } from '@apollo/client';
import { setNotification, setErrorMessage } from '../../../common/notification';
import { IconButton, Typography } from '@material-ui/core';
import { Button } from '../../../components/UI/Form/Button/Button';
import { Loading } from '../../../components/UI/Layout/Loading/Loading';
import { Pager } from '../../../components/UI/Pager/Pager';
import { GET_TAGS_COUNT, FILTER_TAGS } from '../../../graphql/queries/Tag';
import { NOTIFICATION } from '../../../graphql/queries/Notification';
import { DELETE_TAG } from '../../../graphql/mutations/Tag';
import { ToastMessage } from '../../../components/UI/ToastMessage/ToastMessage';
import { DialogBox } from '../../../components/UI/DialogBox/DialogBox';
import styles from './TagList.module.css';
import { SearchBar } from '../../Chat/ChatConversations/SearchBar';
import { ReactComponent as TagIcon } from '../../../assets/images/icons/Tags/Selected.svg';
import { ReactComponent as FilledTagIcon } from '../../../assets/images/icons/Tags/Filled.svg';
import { ReactComponent as DeleteIcon } from '../../../assets/images/icons/Delete/Red.svg';
import { ReactComponent as EditIcon } from '../../../assets/images/icons/Edit.svg';
import { ErrorHandler } from '../../ErrorHandler/ErrorHandler';

export interface TagListProps {}

interface TableVals {
  pageNum: number;
  pageRows: number;
  sortCol: string;
  sortDirection: 'asc' | 'desc';
}

export const TagList: React.SFC<TagListProps> = (props) => {
  const client = useApolloClient();

  // DialogBox states
  const [deleteTagID, setDeleteTagID] = useState<number | null>(null);
  const [deleteTagName, setDeleteTagName] = useState<string>('');

  const [newTag, setNewTag] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  // Table attributes
  const columnNames = ['TITLE', 'DESCRIPTION', 'KEYWORDS', 'ACTIONS'];

  const [tableVals, setTableVals] = useState<TableVals>({
    pageNum: 0,
    pageRows: 10,
    sortCol: columnNames[0],
    sortDirection: 'asc',
  });

  const handleTableChange = (attribute: string, newVal: number | string) => {
    // To handle sorting by columns that are not Name (currently don't support this functionality)
    if (attribute === 'sortCol' && newVal !== 'Name') {
      return;
    }
    // Otherwise, set all values like normal
    setTableVals({
      ...tableVals,
      [attribute]: newVal,
    });
  };

  const filterPayload = useCallback(() => {
    return {
      filter: {
        label: searchVal,
      },
      opts: {
        limit: tableVals.pageRows,
        offset: tableVals.pageNum * tableVals.pageRows,
        order: tableVals.sortDirection.toUpperCase(),
      },
    };
  }, [searchVal, tableVals]);

  // Get the total number of tags here
  const { loading: l, error: e, data: countData, refetch: refetchCount } = useQuery(
    GET_TAGS_COUNT,
    {
      variables: {
        filter: {
          label: '',
        },
      },
    }
  );

  // Get tag data here
  const { loading, error, data, refetch } = useQuery(FILTER_TAGS, {
    variables: filterPayload(),
  });

  const message = useQuery(NOTIFICATION);
  let toastMessage;

  useEffect(() => {
    refetch(filterPayload());
  }, [refetch, filterPayload]);

  // Make a new count request for a new count of the # of rows from this query in the back-end.
  useEffect(() => {
    refetchCount({
      filter: {
        label: searchVal,
      },
    });
  }, [searchVal, refetchCount]);

  useEffect(() => {
    return () => {
      setNotification(client, null);
    };
  }, [toastMessage, client]);

  let deleteId: number = 0;

  const [deleteTag] = useMutation(DELETE_TAG, {
    update(cache) {
      const tags: any = cache.readQuery({
        query: FILTER_TAGS,
        variables: filterPayload(),
      });
      const tagsCopy = JSON.parse(JSON.stringify(tags));
      tagsCopy.tags = tags.tags.filter((val: any) => val.id !== deleteId);
      cache.writeQuery({
        query: FILTER_TAGS,
        variables: filterPayload(),
        data: tagsCopy,
      });
    },
  });

  const showDialogHandler = (id: any, label: string) => {
    setDeleteTagName(label);
    setDeleteTagID(id);
  };
  const closeToastMessage = () => {
    setNotification(client, null);
  };

  const closeDialogBox = () => {
    setDeleteTagID(null);
  };

  const handleDeleteTag = () => {
    if (deleteTagID !== null) {
      deleteHandler(deleteTagID);
    }
    setDeleteTagID(null);
  };

  if (message.data && message.data.message) {
    toastMessage = <ToastMessage message={message.data.message} handleClose={closeToastMessage} />;
  }

  let dialogBox;
  if (deleteTagID) {
    dialogBox = (
      <DialogBox
        title={`Are you sure you want to delete the tag "${deleteTagName}"?`}
        handleOk={handleDeleteTag}
        handleCancel={closeDialogBox}
        colorOk="secondary"
        alignButtons={styles.ButtonsCenter}
      >
        <p className={styles.DialogText}>You won't be able to use this for tagging messages.</p>
      </DialogBox>
    );
  }

  if (newTag) {
    return <Redirect to="/tag/add" />;
  }

  if (loading || l) return <Loading />;
  if (error || e) {
    // TODO: fix setting of actual error message
    let errorMessage: any;
    // if (error) {
    //   errorMessage = error;
    // } else {
    //   errorMessage = e;
    // }
    errorMessage = 'An error has occured!';
    setErrorMessage(client, errorMessage);
    return null;
  }

  const deleteHandler = (id: number) => {
    deleteId = id;
    deleteTag({ variables: { id } });
    setNotification(client, 'Tag deleted Successfully');
  };

  // Reformat all tags to be entered in table
  function getIcons(id: number | undefined, label: string) {
    if (id) {
      return (
        <div className={styles.Icons}>
          <Link to={'/tag/' + id + '/edit'}>
            <IconButton aria-label="Edit" color="default" data-testid="EditIcon">
              <EditIcon />
            </IconButton>
          </Link>
          <IconButton
            aria-label="Delete"
            color="default"
            data-testid="DeleteIcon"
            onClick={() => showDialogHandler(id!, label)}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      );
    }
  }

  const getLabel = (label: string) => {
    return (
      <div className={styles.LabelContainer}>
        <FilledTagIcon className={styles.FilledTagIcon} />
        <p className={styles.LabelText}>{label}</p>
      </div>
    );
  };

  const getDescription = (text: string) => {
    return <p className={styles.TableText}>{text}</p>;
  };

  const getKeywords = (keyword: any) => {
    return <p className={styles.TableText}>{keyword ? keyword.join(', ') : null}</p>;
  };

  function formatTags(tags: Array<any>) {
    // Should be type tag, but can't import Tag type into file
    return tags.map((tag: any) => {
      return {
        label: getLabel(tag.label),
        description: getDescription(tag.description),
        keywords: getKeywords(tag.keywords),
        operations: getIcons(tag.id, tag.label),
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

  // Get tag data and total number of tags.
  let tagList: any;
  if (data) {
    tagList = formatTags(data.tags);
  }

  let tagCount: number = tableVals.pageRows;
  if (countData) {
    tagCount = countData.countTags;
  }

  const columnStyles = [styles.Label, styles.Description, styles.Keywords, styles.Actions];

  return (
    <>
      <div className={styles.Header}>
        <Typography variant="h5" className={styles.Title}>
          <IconButton disabled={true} className={styles.Icon}>
            <TagIcon className={styles.TagIcon} />
          </IconButton>
          Tags
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
        </div>
        <div>
          {toastMessage}
          {dialogBox}
          <div className={styles.AddButton}>
            <Button color="primary" variant="contained" onClick={() => setNewTag(true)}>
              Add New
            </Button>
            {/* <MaterialButton color="primary" variant="contained" className={styles.DropdownButton}>
              :
            </MaterialButton> */}
          </div>
        </div>
      </div>

      {/* Rendering list of tags */}
      {tagList ? (
        <Pager
          columnStyles={columnStyles}
          columnNames={columnNames}
          data={tagList}
          totalRows={tagCount}
          handleTableChange={handleTableChange}
          tableVals={tableVals}
        />
      ) : (
        <div>There are no tags.</div>
      )}
    </>
  );
};
