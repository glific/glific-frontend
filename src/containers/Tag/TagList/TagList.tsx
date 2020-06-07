import React, { useState } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import {
  Paper,
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
} from '@material-ui/core';

import { Tag } from '../../../store/Tag/types';
import styles from './TagList.module.css';

const GET_TAGS = gql`
  {
    tags {
      id
      label
      description
    }
  }
`;

const DELETE_TAG = gql`
  mutation deleteTag($id: ID!) {
    deleteTag(id: $id) {
      errors {
        key
        message
      }
    }
  }
`;

export interface TagListProps {}

export const TagList: React.SFC<TagListProps> = (props) => {
  const [newTag, setNewTag] = useState(false);

  const { loading, error, data } = useQuery(GET_TAGS);

  const onTagDelete = (tagId: number) => {};

  // TO-DO: Need to figure out how to use apollo with redux hence keeping below commented for now
  // const tagList = useSelector((state: AppState) => {
  //   return state.tag.tags;
  // });

  // const dispatch = useDispatch();

  // const onFetchTags = useCallback(() => {
  //   dispatch(tagActions.fetchTags());
  // }, [dispatch]);

  // const onTagDelete = (tagId: number) => {
  //   dispatch(tagActions.deleteTag(tagId));
  // };

  // useEffect(() => {
  //   onFetchTags();
  // }, [onFetchTags]);

  if (newTag) {
    return <Redirect to="/tag/add" />;
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;
  const tagList = data.tags;

  let listing: any;
  if (tagList.length > 0) {
    listing = tagList.map((n: Tag) => {
      return (
        <TableRow key={n.id}>
          <TableCell component="th" scope="row">
            {n.label}
          </TableCell>
          <TableCell>
            <Link to={'/tag/' + n.id + '/edit'}>Edit</Link>{' '}
            <button onClick={() => onTagDelete(n.id)}>Delete</button>
          </TableCell>
        </TableRow>
      );
    });
  } else {
    listing = <p>There are no tags.</p>;
  }

  return (
    <div>
      <h2>List of tags</h2>
      <div>
        <button onClick={() => setNewTag(true)}>New Tag</button>
      </div>
      <br />
      <TableContainer component={Paper}>
        <Table className={styles.Table} aria-label="tag listing">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody></TableBody>
          {listing}
        </Table>
      </TableContainer>
    </div>
  );
};
