import React, { useState } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
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
import { Loading } from '../../../components/UI/Layout/Loading/Loading'
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import styles from './TagList.module.css';
import { GET_TAGS } from '../../../graphql/queries/Tag';
import { NOTIFICATION } from '../../../graphql/queries/Notification';
import { DELETE_TAG } from '../../../graphql/mutations/Tag';
import { ToastMessage } from '../../../components/UI/ToastMessage/ToastMessage';
import { DialogBox } from '../../../components/UI/DialogBox/DialogBox';

export interface TagListProps { }

export const TagList: React.SFC<TagListProps> = (props) => {
  const client = useApolloClient();

  // DialogBox states
  const [deleteTagID, setDeleteTagID] = useState<number | null>(null);

  const [newTag, setNewTag] = useState(false);

  const { loading, error, data } = useQuery(GET_TAGS);
  const message = useQuery(NOTIFICATION);

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

  if (loading) return <Loading />;
  if (error) return <p>Error</p>;
  const tagList = data.tags;

  const deleteHandler = (id: number) => {
    deleteId = id;
    deleteTag({ variables: { id } });
    setNotification(client, 'Tag deleted Successfully');
  };

  let listing: any;
  if (tagList.length > 0) {
    listing = tagList.map((n: any) => {
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
            <IconButton
              aria-label="Delete"
              color="default"
              onClick={() => showDialogHandler(n.id!)}
            >
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
      {dialogBox}
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
