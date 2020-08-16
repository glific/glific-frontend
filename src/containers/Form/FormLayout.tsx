import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import { useApolloClient, DocumentNode, ApolloError } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client';
import { Typography, IconButton } from '@material-ui/core';
import moment from 'moment';

import { Button } from '../../components/UI/Form/Button/Button';
import { Dropdown } from '../../components/UI/Form/Dropdown/Dropdown';
import { DialogBox } from '../../components/UI/DialogBox/DialogBox';
import { Loading } from '../../components/UI/Layout/Loading/Loading';
import { ReactComponent as DeleteIcon } from '../../assets/images/icons/Delete/White.svg';
import { setNotification, setErrorMessage } from '../../common/notification';
import { DATE_FORMAT } from '../../common/constants';
import { GET_LANGUAGES } from '../../graphql/queries/List';
import styles from './FormLayout.module.css';

export interface FormLayoutProps {
  match: any;
  deleteItemQuery: DocumentNode;
  states: any;
  setStates: any;
  validationSchema: any;
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
  additionalAction?: any;
  linkParameter?: any;
  cancelLink?: any;
  languageSupport?: boolean;
}

export const FormLayout: React.SFC<FormLayoutProps> = ({
  match,
  deleteItemQuery,
  states,
  setStates,
  validationSchema,
  listItemName,
  dialogMessage,
  formFields,
  redirectionLink,
  listItem,
  getItemQuery,
  createItemQuery,
  updateItemQuery,
  defaultAttribute = null,
  additionalAction = null,
  icon,
  linkParameter = null,
  cancelLink = null,
  languageSupport = true,
}: FormLayoutProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [deleteItem] = useMutation(deleteItemQuery);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [languageId, setLanguageId] = useState('');
  const [formCancelled, setFormCancelled] = useState(false);
  const [action, setAction] = useState(false);
  const [link, setLink] = useState(undefined);
  const [groupsID, setGroupsID] = useState();

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
        setLink(data[listItem][listItem][linkParameter]);
        setStates(item);
        setLanguageId(languageSupport ? item.language.id : null);
        if (data.user && data.user.user) {
          setGroupsID(data.user.user.groups === undefined ? null : data.user.user.groups);
        }
      }
    },
  });

  const [updateItem] = useMutation(updateItemQuery, {
    onCompleted: () => {
      setFormSubmitted(true);
    },
  });

  const [createItem] = useMutation(createItemQuery, {
    onCompleted: (data) => {
      const camelCaseItem = listItem[0].toUpperCase() + listItem.slice(1);
      if (!itemId) setLink(data[`create${camelCaseItem}`][listItem][linkParameter]);
      setFormSubmitted(true);
    },
    onError: (error: ApolloError) => {
      console.log('Error', error);
    },
  });

  const client = useApolloClient();

  let item: any = null;

  if (loading) return <Loading />;
  if (error) {
    setErrorMessage(client, error);
    return null;
  }

  const collectionPayload = (payload: any) => {
    return {
      label: payload.label,
      shortcode: payload.shortcode,
      args: JSON.stringify({
        messageOpts: {
          offset: 0,
          limit: 10,
        },
        filter: {
          term: payload.term,
          includeTags: payload.includeTags.map((option: any) => option.id),
          includeGroups: payload.includeGroups.map((option: any) => option.id),
          dateRange: {
            to: moment(payload.dateFrom).format(DATE_FORMAT),
            from: moment(payload.dateTo).format(DATE_FORMAT),
          },
        },
        contactOpts: {
          offset: 0,
          limit: 20,
        },
      }),
    };
  };

  const saveHandler = ({ languageId, ...item }: any) => {
    let payload = {
      ...item,
      ...defaultAttribute,
    };

    payload = languageSupport ? { ...payload, languageId: Number(languageId) } : { ...payload };

    // create custom payload for collection
    if (listItemName === 'collection') {
      payload = collectionPayload(payload);
    }

    let message;

    if (itemId) {
      console.log(payload);
      updateItem({
        variables: {
          id: itemId,
          groupIds: groupsID,
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
    setFormCancelled(true);
  };

  if (formSubmitted) {
    return <Redirect to={action ? `${additionalAction.link}/${link}` : `/${redirectionLink}`} />;
  }

  if (formCancelled) {
    return <Redirect to={cancelLink ? `/${cancelLink}` : `/${redirectionLink}`} />;
  }

  const languageOptions = languages.data ? languages.data.languages : null;
  const language = languageSupport
    ? {
        component: Dropdown,
        name: 'languageId',
        placeholder: 'Language',
        options: languageOptions,
      }
    : null;

  const formFieldItems = languageSupport ? [...formFields, language] : formFields;

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
        validationSchema={validationSchema}
        onSubmit={(item) => {
          console.log(item);
          saveHandler(item);
        }}
      >
        {({ submitForm }) => (
          <Form className={styles.Form}>
            {formFieldItems.map((field, index) => {
              return (
                <React.Fragment key={index}>
                  {field.label ? (
                    <Typography variant="h5" className={styles.Title}>
                      {field.label}
                    </Typography>
                  ) : null}
                  <Field key={index} {...field}></Field>
                </React.Fragment>
              );
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
              {additionalAction ? (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    submitForm();
                    setAction(true);
                  }}
                >
                  {additionalAction.label}
                </Button>
              ) : null}
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
