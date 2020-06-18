import React, { useState, useEffect } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { useApolloClient } from '@apollo/client';
import { setNotification } from '../../../common/notification';
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
import { Button } from '../../../components/UI/Form/Button/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import styles from './TagList.module.css';
import { GET_TAGS } from '../../../graphql/queries/Tag';
import { NOTIFICATION } from '../../../graphql/queries/Notification';
import { DELETE_TAG } from '../../../graphql/mutations/Tag';
import { ToastMessage } from '../../../components/UI/ToastMessage/ToastMessage';

export interface TagListProps {}

export const TagList: React.SFC<TagListProps> = (props) => {
  const client = useApolloClient();
  const [newTag, setNewTag] = useState(false);

  const [getTags, { loading, data }] = useLazyQuery(GET_TAGS);

  const [messages, message] = useLazyQuery(NOTIFICATION);

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

  useEffect(() => {
    getTags();
    messages();
  }, [getTags, data, messages]);

  const closeToastMessage = () => {
    setNotification(client, null);
  };

  let toastMessage;
  if (message.data && message.data.message) {
    toastMessage = <ToastMessage message={message.data.message} handleClose={closeToastMessage} />;
  }

  if (newTag) {
    return <Redirect to="/tag/add" />;
  }

  if (loading) return <p>Loading...</p>;

  const deleteHandler = (id: number) => {
    deleteId = id;
    deleteTag({ variables: { id } });
    setNotification(client, 'Tag deleted Successfully');
  };

  let listing: any;
  if (data && data.tags.length > 0) {
    listing = data.tags.map((n: any) => {
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
            <IconButton aria-label="Delete" color="default" onClick={() => deleteHandler(n.id!)}>
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
      {toastMessage}
      <div className={styles.AddButtton}>
        <Button variant="contained" color="primary" onClick={() => setNewTag(true)}>
          New Tag
        </Button>
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
