import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import { useApolloClient, DocumentNode, ApolloError } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client';
import { Typography, IconButton } from '@material-ui/core';

import { Button } from '../../components/UI/Form/Button/Button';
import { Dropdown } from '../../components/UI/Form/Dropdown/Dropdown';
import { DialogBox } from '../../components/UI/DialogBox/DialogBox';
import { Loading } from '../../components/UI/Layout/Loading/Loading';
import { ReactComponent as DeleteIcon } from '../../assets/images/icons/Delete/White.svg';
import { setNotification, setErrorMessage } from '../../common/notification';
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
  setPayload?: any;
  advanceSearch?: any;
  button?: string;
  type?: string;
  afterSave?: any;
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
  setPayload,
  advanceSearch,
  button = 'Save',
  type,
  afterSave,
}: FormLayoutProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [deleteItem] = useMutation(deleteItemQuery);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [languageId, setLanguageId] = useState('');
  const [formCancelled, setFormCancelled] = useState(false);
  const [action, setAction] = useState(false);
  const [link, setLink] = useState(undefined);

  const languages = useQuery(GET_LANGUAGES, {
    onCompleted: (data) => {
      setLanguageId(data.languages[0].id);
    },
  });

  const capitalListItemName = listItemName[0].toUpperCase() + listItemName.slice(1);

  const itemId = match.params.id ? match.params.id : false;
  const { loading, error } = useQuery(getItemQuery, {
    variables: { id: itemId },
    fetchPolicy: 'network-only',
    skip: !itemId,
    onCompleted: (data) => {
      if (itemId && data) {
        item = data[listItem][listItem];
        setLink(data[listItem][listItem][linkParameter]);
        setStates(item);
        setLanguageId(languageSupport ? item.language.id : null);
      }
    },
  });
  const camelCaseItem = listItem[0].toUpperCase() + listItem.slice(1);

  const [updateItem] = useMutation(updateItemQuery, {
    onCompleted: (data) => {
      const itemUpdated = `update${camelCaseItem}`;

      if (data[itemUpdated].errors) {
        setErrorMessage(client, data[itemUpdated].errors[0]);
      } else {
        setFormSubmitted(true);
      }
    },
  });

  const [createItem] = useMutation(createItemQuery, {
    onCompleted: (data) => {
      const itemCreated = `create${camelCaseItem}`;

      if (data[itemCreated].errors) {
        setErrorMessage(client, data[itemCreated].errors[0]);
      } else {
        if (!itemId) setLink(data[itemCreated][listItem][linkParameter]);
        setFormSubmitted(true);
        // emit data after save
        if (afterSave) {
          afterSave(data);
        }
      }
    },
    onError: (error: ApolloError) => {
      setErrorMessage(client, error);
      return null;
    },
  });

  const client = useApolloClient();

  let item: any = null;

  if (loading) return <Loading />;
  if (error) {
    setErrorMessage(client, error);
    return null;
  }

  const saveHandler = ({ languageId, ...item }: any) => {
    let payload = {
      ...item,
      ...defaultAttribute,
    };

    payload = languageSupport ? { ...payload, languageId: Number(languageId) } : { ...payload };

    // create custom payload for collection
    if (setPayload) {
      payload = setPayload(payload);
      let data = advanceSearch(payload);

      if (data && data.heading && type === 'search') return;
    }

    // remove fields from the payload that marked as skipPayload = true
    formFields.map((field: any) => {
      if (field.skipPayload) {
        delete payload[field.name];
      }
    });

    let message;

    if (itemId) {
      updateItem({
        variables: {
          id: itemId,
          input: payload,
        },
      });
      message = `${capitalListItemName} edited successfully!`;
    } else {
      createItem({
        variables: {
          input: payload,
        },
      });
      message = `${capitalListItemName} added successfully!`;
    }
    setNotification(client, message);
  };

  const cancelHandler = () => {
    // for chat screen collection
    if (type === 'search' || type === 'saveSearch') {
      advanceSearch('cancel');
      return;
    }
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
  const deleteButton =
    itemId && !type ? (
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
                {button}
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
    setNotification(client, `${capitalListItemName} deleted successfully`);
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

  let heading = (
    <Typography variant="h5" className={styles.Title}>
      <IconButton disabled={true} className={styles.Icon}>
        {icon}
      </IconButton>
      {itemId ? `Edit ${listItemName} ` : `Add a new ${listItemName}`}
    </Typography>
  );

  if (advanceSearch) {
    let data = advanceSearch({});
    if (data && data.heading) heading = data.heading;
  }

  return (
    <div className={styles.ItemAdd}>
      {dialogBox}
      {heading}
      {form}
    </div>
  );
};
