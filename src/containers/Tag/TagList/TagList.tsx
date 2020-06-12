import React, { useState } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { useQuery, gql, useMutation } from '@apollo/client';
import {
  Paper,
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  IconButton,
  InputBase,
  Button,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import DataTable from 'react-data-table-component';

// import { Tag } from '../../../store/Tag/types';
import { GET_TAGS } from '../../../graphql/queries/Tag';
import { DELETE_TAG } from '../../../graphql/mutations/Tag';

import styles from './TagList.module.css';

// Add a couple of parameters of this query (OFFSET, LIMIT).
const FILTER_TAGS = gql`
  query tags($filter: TagFilter!, $order: SortOrder!) {
    tags(filter: $filter, order: $order) {
      id
      label
      description
    }
  }
`;

export interface TagListProps {}

export const TagList: React.SFC<TagListProps> = (props) => {
  const [newTag, setNewTag] = useState(false);
  // const { loading, error, data } = useQuery(GET_TAGS);
  const { loading, error, data, fetchMore, refetch } = useQuery(FILTER_TAGS, {
    variables: {
      filter: {
        label: '',
      },
      order: 'ASC',
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

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
    // Should be type tag, import Tag type into file
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
    console.log('you searched', searchVal);
    refetch({
      filter: {
        label: searchVal,
      },
      order: 'ASC',
    });
  };

  const columns = [
    {
      name: 'Name',
      selector: 'label',
      sortable: true,
    },
    {
      name: 'Description',
      selector: 'description',
      sortable: true,
    },
    {
      name: 'Operations',
      selector: 'operations',
      sortable: false,
    },
  ];

  let tagList;
  if (data) {
    tagList = formatTags(data.tags);
  }

  return (
    <div>
      <div className={styles.AddButtton}>
        <Button variant="contained" color="primary" onClick={() => setNewTag(true)}>
          New Tag
        </Button>
      </div>
      <br />
      <br />

      {/* Search functionality */}
      <form onSubmit={handleSearch}>
        <div className={styles.searchBar}>
          <SearchIcon style={{ verticalAlign: 'middle' }} />
          <InputBase
            placeholder="Search a name..."
            inputProps={{ 'aria-label': 'search' }}
            type="text"
            name="nameSearch"
          />
          <Button color="primary" variant="contained" type="submit">
            Search
          </Button>
        </div>
      </form>

      {/* Table */}
      {tagList ? (
        <DataTable
          className={styles.PaginationTable}
          columns={columns}
          data={tagList}
          pagination={true}
          noHeader={true}
          onChangePage={console.log}
          // paginationTotalRows={50}
        />
      ) : (
        <div>There are no tags.</div>
        // <TableRow>
        //   <TableCell>There are no tags.</TableCell>
        // </TableRow>
      )}
    </div>
  );
};
