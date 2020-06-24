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
import { GET_TAGS_COUNT, FILTER_TAGS } from '../../../graphql/queries/Tag';
import { NOTIFICATION } from '../../../graphql/queries/Notification';
import { DELETE_TAG } from '../../../graphql/mutations/Tag';
import { ToastMessage } from '../../../components/UI/ToastMessage/ToastMessage';
import { DialogBox } from '../../../components/UI/DialogBox/DialogBox';
import styles from './TagList.module.css';

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

  const [newTag, setNewTag] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // Table attributes
  const columnNames = ['Name', 'Description', 'Actions'];
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

  const filterPayload = () => {
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
  };

  useEffect(() => {
    refetch(filterPayload());
  }, [searchVal, setTableVals]);

  // Make a new count request for a new count of the # of rows from this query in the back-end.
  useEffect(() => {
    refetchCount({
      filter: {
        label: searchVal,
      },
    });
  }, [searchVal]);

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
    fetchPolicy: 'cache-and-network',
  });

  const message = useQuery(NOTIFICATION);

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

  const showDialogHandler = (id: any) => {
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

  let toastMessage;
  if (message.data && message.data.message) {
    toastMessage = <ToastMessage message={message.data.message} handleClose={closeToastMessage} />;
  }

  let dialogBox;
  if (deleteTagID) {
    dialogBox = (
      <DialogBox
        message="Are you sure you want to delete the tag?"
        handleCancel={closeDialogBox}
        handleOK={handleDeleteTag}
      />
    );
  }

  if (newTag) {
    return <Redirect to="/tag/add" />;
  }

  if (loading || l) return <Loading />;
  if (error || e) return <p>Error :(</p>;

  const deleteHandler = (id: number) => {
    deleteId = id;
    deleteTag({ variables: { id } });
    setNotification(client, 'Tag deleted Successfully');
  };

  // Reformat all tags to be entered in table
  function getIcons(id: number | undefined) {
    if (id) {
      return (
        <>
          <Link to={'/tag/' + id + '/edit'}>
            <IconButton aria-label="Edit" color="default">
              <EditIcon />
            </IconButton>
          </Link>
          <IconButton aria-label="Delete" color="default" onClick={() => showDialogHandler(id!)}>
            <DeleteIcon />
          </IconButton>
        </>
      );
    }
  }

  function formatTags(tags: Array<any>) {
    // Should be type tag, but can't import Tag type into file
    return tags.map((t: any) => {
      return {
        label: t.label,
        description: t.description,
        operations: getIcons(t.id),
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
    let searchVal = e.target.nameSearch.value.trim();
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

  return (
    <>
      <div className={styles.Header}>
        <Typography variant="h5" className={styles.Title}>
          Tags
        </Typography>
        <div className={styles.Buttons}>
          <IconButton className={styles.IconButton} onClick={() => setSearchOpen(!searchOpen)}>
            <SearchIcon className={styles.SearchIcon}></SearchIcon>
          </IconButton>
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
              <Button color="primary" variant="contained" onClick={() => setNewTag(true)}>
                Add New
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Rendering list of tags */}
      {tagList ? (
        <Pager
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
