import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import { Button } from '../../../components/UI/Form/Button/Button';
import { Dropdown } from '../../../components/UI/Form/Dropdown/Dropdown';
import { Loading } from '../../../components/UI/Layout/Loading/Loading';
import { useApolloClient, DocumentNode } from '@apollo/client';
import styles from './ListItem.module.css';
import { useQuery, useMutation } from '@apollo/client';
import { GET_LANGUAGES } from '../../../graphql/queries/Tag';
import { setNotification } from '../../../common/notification';
import { Typography, IconButton } from '@material-ui/core';
import { ReactComponent as DeleteIcon } from '../../../assets/images/icons/Delete/White.svg';
import { DialogBox } from '../../../components/UI/DialogBox/DialogBox';

export interface ListItemProps {
  match: any;
  deleteItemQuery: DocumentNode;
  states: any;
  setStates: any;
  setValidation: any;
  listItemName: string;
  dialogMessage: string;
  formFields: Array<any>;
  redirectionLink: string;
  listItem: string;
  getItemQuery: DocumentNode;
  createItemQuery: DocumentNode;
  updateItemQuery: DocumentNode;
  defaultAttribute?: any;
  icon: any;
}

export const ListItem: React.SFC<ListItemProps> = ({
  match,
  deleteItemQuery,
  states,
  setStates,
  setValidation,
  listItemName,
  dialogMessage,
  formFields,
  redirectionLink,
  listItem,
  getItemQuery,
  createItemQuery,
  updateItemQuery,
  defaultAttribute = null,
  icon,
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [deleteItem] = useMutation(deleteItemQuery);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [languageId, setLanguageId] = useState('');

  const languages = useQuery(GET_LANGUAGES, {
    onCompleted: (data) => {
      setLanguageId(data.languages[0].id);
    },
  });
  const itemId = match.params.id ? match.params.id : false;
  const { loading, error } = useQuery(getItemQuery, {
    variables: { id: itemId },
    skip: !itemId,
    onCompleted: (data) => {
      if (itemId && data) {
        item = data[listItem][listItem];
        setStates(item);
        setLanguageId(item.language.id);
      }
    },
  });
  const [updateItem] = useMutation(updateItemQuery, {
    onCompleted: () => {
      setFormSubmitted(true);
    },
  });

  const [createItem] = useMutation(createItemQuery, {
    onCompleted: () => {
      setFormSubmitted(true);
    },
  });

  const client = useApolloClient();

  let item: any = null;

  if (loading) return <Loading />;
  if (error) return <p>Error :(</p>;

  const saveHandler = ({ languageId, ...item }: any) => {
    const payload = {
      ...item,
      ...defaultAttribute,
      languageId: Number(languageId),
    };

    let message;

    if (itemId) {
      updateItem({
        variables: {
          id: itemId,
          input: payload,
        },
      });
      message = `${listItemName} edited successfully!`;
    } else {
      createItem({
        variables: {
          input: payload,
        },
      });
      message = `${listItemName} added successfully!`;
    }
    setNotification(client, message);
  };

  const cancelHandler = () => {
    setFormSubmitted(true);
  };

  if (formSubmitted) {
    return <Redirect to={`/${redirectionLink}`} />;
  }

  const languageOptions = languages.data ? languages.data.languages : null;
  const formFieldItems = [
    ...formFields,
    {
      component: Dropdown,
      name: 'languageId',
      placeholder: 'Language',
      options: languageOptions,
    },
  ];

  const deleteButton = itemId ? (
    <Button
      variant="contained"
      color="secondary"
      className={styles.DeleteButton}
      onClick={() => setShowDialog(true)}
    >
      <DeleteIcon className={styles.DeleteIcon} />
      Remove
    </Button>
  ) : null;

  let form = (
    <>
      <Formik
        enableReinitialize
        initialValues={{
          ...states,
          languageId: languageId,
        }}
        validate={setValidation}
        onSubmit={(item) => {
          saveHandler(item);
        }}
      >
        {({ submitForm }) => (
          <Form className={styles.Form}>
            {formFieldItems.map((field, index) => {
              return <Field key={index} {...field}></Field>;
            })}
            <div className={styles.Buttons}>
              <Button
                variant="contained"
                color="primary"
                onClick={submitForm}
                className={styles.Button}
              >
                Save
              </Button>
              <Button variant="contained" color="default" onClick={cancelHandler}>
                Cancel
              </Button>
              {deleteButton}
            </div>
          </Form>
        )}
      </Formik>
    </>
  );

  const handleDeleteItem = () => {
    deleteItem({ variables: { id: itemId } });
    setNotification(client, `${listItemName} deleted Successfully`);
    setFormSubmitted(true);
  };
  let dialogBox;

  if (showDialog) {
    dialogBox = (
      <DialogBox
        title={`Are you sure you want to delete the ${listItemName}?`}
        handleOk={handleDeleteItem}
        handleCancel={() => setShowDialog(false)}
        colorOk="secondary"
        alignButtons={styles.ButtonsCenter}
      >
        <p className={styles.DialogText}>{dialogMessage}</p>
      </DialogBox>
    );
  }

  const heading = (
    <Typography variant="h5" className={styles.Title}>
      <IconButton disabled={true} className={styles.Icon}>
        {icon}
      </IconButton>
      {itemId ? `Edit ${listItemName} ` : `Add a new ${listItemName}`}
    </Typography>
  );

  return (
    <div className={styles.ItemAdd}>
      {dialogBox}
      {heading}
      {form}
    </div>
  );
};
