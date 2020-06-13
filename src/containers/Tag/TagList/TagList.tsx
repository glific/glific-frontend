import React, { useState, useEffect } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { IconButton, InputBase, Button, Typography, Divider } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import DataTable from 'react-data-table-component';

import { GET_TAGS, GET_TAGS_COUNT, FILTER_TAGS } from '../../../graphql/queries/Tag';
import { DELETE_TAG } from '../../../graphql/mutations/Tag';

import styles from './TagList.module.css';

export interface TagListProps {}

export const TagList: React.SFC<TagListProps> = (props) => {
  const [newTag, setNewTag] = useState(false);

  // For measuring when to get a new request for data.
  const [pageRows, setPageRows] = useState(10);
  const [pageNum, setPageNum] = useState(1);
  const [searchVal, setSearchVal] = useState('');
  const [sortDirection, setSortDirection] = useState('ASC');

  const [searchOpen, setSearchOpen] = useState(false);

  // These methods might not even be needed?

  // Makes a new fetch request for new data from the back-end.
  useEffect(() => {
    refetch({
      filter: {
        label: searchVal,
      },
      opts: {
        limit: pageRows,
        offset: (pageNum - 1) * pageRows, // May need to change the math here for different `Rows per page` changes.
        order: sortDirection,
      },
    });
  }, [searchVal, pageNum, pageRows, sortDirection]);

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
          label: searchVal,
        },
      },
    }
  );

  // Get tag data here
  const { loading, error, data, refetch } = useQuery(FILTER_TAGS, {
    variables: {
      filter: {
        label: searchVal,
      },
      opts: {
        limit: pageRows,
        offset: 0,
        order: sortDirection,
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  let deleteId: number = 0;
  const [deleteTag] = useMutation(DELETE_TAG, {
    update(cache) {
      const tags: any = cache.readQuery({ query: GET_TAGS });
      const tagsCopy = JSON.parse(JSON.stringify(tags));
      tagsCopy.tags = tags.tags.filter((val: any) => val.id !== deleteId);
      cache.writeQuery({
        query: GET_TAGS,
        data: tagsCopy,
      });
    },
  });

  if (newTag) {
    return <Redirect to="/tag/add" />;
  }

  if (loading || l) return <p>Loading...</p>;
  if (error || e) return <p>Error :(</p>;

  const deleteHandler = (id: number) => {
    deleteId = id;
    deleteTag({ variables: { id } });
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
          <IconButton aria-label="Delete" color="default" onClick={() => deleteHandler(id!)}>
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

  const handleSearch = (e: any) => {
    e.preventDefault();
    let searchVal = e.target.nameSearch.value.trim();
    setSearchVal(searchVal);
  };

  // Making different columns for the table
  const columns = [
    {
      name: 'Name',
      selector: 'label',
      sortable: true,
    },
    {
      name: 'Description',
      selector: 'description',
      sortable: false,
    },
    {
      name: 'Operations',
      selector: 'operations',
      sortable: false,
    },
  ];

  // Get tag data and total number of tags.
  let tagList: any;
  if (data) {
    tagList = formatTags(data.tags);
  }

  let tagCount: number = pageRows;
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
                <div className={styles.ResetSearch} onClick={() => setSearchVal('')}>
                  <Divider orientation="vertical" />
                  <CloseIcon className={styles.CloseIcon}></CloseIcon>
                </div>
              ) : null}
            </div>
          </form>

          {/* Not sure how to override Material UI button styling without too much hassle */}
          <Button
            style={{
              height: '80%',
              textTransform: 'capitalize',
              borderRadius: '20px',
              marginLeft: '10px',
            }}
            color="primary"
            variant="contained"
            disableElevation={true}
            onClick={() => setNewTag(true)}
          >
            Add New
          </Button>
        </div>
      </div>

      {/* Table */}
      {tagList ? (
        <DataTable
          className={styles.Table}
          columns={columns}
          data={tagList}
          pagination
          noHeader
          onChangePage={(page, totalRows) => setPageNum(page)} // passes (page, totalRows)
          onChangeRowsPerPage={(currentRowsPerPage, currentPage) => setPageRows(currentRowsPerPage)} // passes (currentRowsPerPage, currentPage)
          paginationTotalRows={tagCount}
          paginationServer
          paginationPerPage={pageRows}
          sortServer
          // BUG: When trying to sort on a column, you have to click the column twice in order to see any changes.
          onSort={(column, sortBy) => {
            setPageNum(1);
            setSortDirection(sortBy === 'asc' ? 'ASC' : 'DESC');
          }} // passes (column, sortDirection, event)
          defaultSortAsc={sortDirection === 'ASC'} // used to change icon direction
        />
      ) : (
        <div>There are no tags.</div>
      )}
    </>
  );
};
