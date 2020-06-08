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
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

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

  let deleteId: number = 0;
  const [deleteTag] = useMutation(DELETE_TAG, {
    update(cache, { data: { deleteTag } }) {
      const tags: any = cache.readQuery({ query: GET_TAGS });
      const tagsCopy = JSON.parse(JSON.stringify(tags));
      tagsCopy.tags = tags.tags.filter((val: any) => val.id !== deleteId);
      cache.writeQuery({
        query: GET_TAGS,
        data: tagsCopy,
      });
    },
  });

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

  const deleteHandler = (id: number) => {
    deleteId = id;
    deleteTag({ variables: { id } });
  };

  let listing: any;
  if (tagList.length > 0) {
    listing = tagList.map((n: Tag) => {
      return (
        <TableRow key={n.id}>
          <TableCell component="th" scope="row">
            {n.label}
          </TableCell>
          <TableCell scope="row">{n.description}</TableCell>
          <TableCell>
            <Link to={'/tag/' + n.id + '/edit'}>
              <IconButton aria-label="Edit" color="default">
                <EditIcon />
              </IconButton>
            </Link>
            <IconButton aria-label="Delete" color="default" onClick={() => deleteHandler(n.id)}>
              <DeleteIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      );
    });
  } else {
    listing = (
      <TableRow>
        <TableCell>There are no tags.</TableCell>
      </TableRow>
    );
  }

  return (
    <div>
      <div className={styles.AddButtton}>
        <button onClick={() => setNewTag(true)}>New Tag</button>
      </div>
      <br />
      <br />
      <TableContainer component={Paper}>
        <Table className={styles.Table} aria-label="tag listing">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{listing}</TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
