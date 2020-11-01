import React, { useState } from 'react';
import { Redirect, Link } from 'react-router-dom';
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
import styles from './FormLayout.module.css';
import { convertToWhatsApp } from '../../common/RichEditor';
import { SEARCH_QUERY } from '../../graphql/queries/Search';
import { SEARCH_QUERY_VARIABLES } from '../../common/constants';
import { ToastMessage } from '../../components/UI/ToastMessage/ToastMessage';
import { NOTIFICATION } from '../../graphql/queries/Notification';
import { ReactComponent as BackIcon } from '../../assets/images/icons/Back.svg';
import { USER_LANGUAGES } from '../../graphql/queries/Organization';

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
  additionalQuery?: any;
  linkParameter?: any;
  cancelLink?: any;
  languageSupport?: boolean;
  setPayload?: any;
  advanceSearch?: any;
  additionalState?: any;
  button?: string;
  type?: string;
  afterSave?: any;
  afterDelete?: any;
  refetchQueries?: any;
  redirect?: boolean;
  title?: string;
  getLanguageId?: any;
  backLinkButton?: any;
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
  additionalQuery = null,
  defaultAttribute = null,
  additionalAction = null,
  icon,
  additionalState,
  title,
  linkParameter = null,
  cancelLink = null,
  languageSupport = true,
  setPayload,
  advanceSearch,
  button = 'Save',
  type,
  afterSave,
  afterDelete,
  refetchQueries,
  redirect = true,
  getLanguageId,
  backLinkButton,
}: FormLayoutProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [deleteItem] = useMutation(deleteItemQuery, {
    onCompleted: () => {
      setNotification(client, `${capitalListItemName} deleted successfully`);
      setDeleted(true);
    },
    awaitRefetchQueries: true,
    refetchQueries: [
      {
        query: SEARCH_QUERY,
        variables: SEARCH_QUERY_VARIABLES,
      },
    ],
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [languageId, setLanguageId] = useState('');
  const [formCancelled, setFormCancelled] = useState(false);
  const [action, setAction] = useState(false);
  const [link, setLink] = useState(undefined);
  const [deleted, setDeleted] = useState(false);
  const message = useQuery(NOTIFICATION);
  let toastMessage: {} | null | undefined;
  let item: any = null;

  // get the organization for current user and have languages option set to that.

  const organization = useQuery(USER_LANGUAGES, {
    onCompleted: (data: any) => {
      if (!itemId) {
        setLanguageId(data.currentUser.user.organization.defaultLanguage.id);
      }
    },
  });

  const capitalListItemName = listItemName[0].toUpperCase() + listItemName.slice(1);
  let itemId = match.params.id ? match.params.id : false;
  let variables: any = itemId ? { id: itemId } : false;

  if (listItem === 'credential') {
    variables = match.params.shortcode ? { shortcode: match.params.shortcode } : false;
  }

  const { loading, error } = useQuery(getItemQuery, {
    variables: variables,
    skip: !itemId,
    onCompleted: (data) => {
      if (data) {
        item = data[listItem][listItem];
        if (item) {
          setLink(data[listItem][listItem][linkParameter]);
          setStates(item);
          setLanguageId(languageSupport ? item.language.id : null);
        }
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
        if (additionalQuery) {
          additionalQuery(itemId);
        }
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
    refetchQueries: () => {
      if (refetchQueries) {
        return [{ query: refetchQueries.query, variables: refetchQueries.variables }];
      } else return [];
    },
  });

  const [createItem] = useMutation(createItemQuery, {
    onCompleted: (data) => {
      const itemCreated = `create${camelCaseItem}`;
      if (data[itemCreated].errors) {
        setErrorMessage(client, data[itemCreated].errors[0]);
      } else {
        if (additionalQuery) {
          additionalQuery(data[`create${camelCaseItem}`][listItem].id);
        }
        if (!itemId) setLink(data[itemCreated][listItem][linkParameter]);
        setFormSubmitted(true);
        // emit data after save
        if (afterSave) {
          afterSave(data.createSavedSearch);
        }
      }
    },
    refetchQueries: () => {
      if (refetchQueries) {
        return [{ query: refetchQueries.query, variables: refetchQueries.variables }];
      } else return [];
    },
    onError: (error: ApolloError) => {
      setErrorMessage(client, error);
      return null;
    },
  });

  const client = useApolloClient();

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
      if (advanceSearch) {
        let data = advanceSearch(payload);

        if (data && data.heading && type === 'search') return;
      }
    }

    // remove fields from the payload that marked as skipPayload = true
    formFields.map((field: any) => {
      if (field.additionalState) {
        additionalState(payload[field.additionalState]);
      }
      if (field.convertToWhatsApp) {
        payload[field.name] = convertToWhatsApp(payload[field.name]);
      }
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
      message = `${capitalListItemName} created successfully!`;
    }
    setNotification(client, message);
  };

  //toast
  const closeToastMessage = () => {
    setNotification(client, null);
  };

  if (message.data && message.data.message) {
    toastMessage = <ToastMessage message={message.data.message} handleClose={closeToastMessage} />;
  }

  const cancelHandler = () => {
    // for chat screen collection
    if (type === 'search' || type === 'saveSearch') {
      advanceSearch('cancel');
      return;
    }
    setFormCancelled(true);
  };

  if (formSubmitted && redirect) {
    return <Redirect to={action ? `${additionalAction.link}/${link}` : `/${redirectionLink}`} />;
  }

  if (deleted) {
    if (afterDelete) {
      return <Redirect to={afterDelete.link} />;
    } else {
      return <Redirect to={redirectionLink} />;
    }
  }

  if (formCancelled) {
    return <Redirect to={cancelLink ? `/${cancelLink}` : `/${redirectionLink}`} />;
  }

  const validateLanguage = (value: any) => {
    if (value && getLanguageId) {
      getLanguageId(value);
    }
  };

  let languageOptions = organization.data
    ? organization.data.currentUser.user.organization.activeLanguages.slice()
    : [];
  // sort languages by their name
  languageOptions.sort((first: any, second: any) => {
    return first.label > second.label ? 1 : -1;
  });
  const language = languageSupport
    ? {
        component: Dropdown,
        name: 'languageId',
        placeholder: 'Languagess',
        options: languageOptions,
        validate: validateLanguage,
        helperText: 'For more languages check settings or connect with your admin',
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
          <Form className={styles.Form} data-testid="formLayout">
            {toastMessage}
            {formFieldItems.map((field, index) => {
              return (
                <React.Fragment key={index}>
                  {field.label ? (
                    <Typography variant="h5" className={styles.FieldLabel}>
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
                data-testid="submitActionButton"
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
                  data-testid="additionalActionButton"
                >
                  {additionalAction.label}
                </Button>
              ) : null}
              <Button
                variant="contained"
                color="default"
                onClick={cancelHandler}
                data-testid="cancelActionButton"
              >
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
  };
  let dialogBox;

  if (showDialog) {
    dialogBox = (
      <DialogBox
        title={`Are you sure you want to delete the ${listItemName}?`}
        handleOk={handleDeleteItem}
        handleCancel={() => setShowDialog(false)}
        colorOk="secondary"
        alignButtons={'center'}
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
      {title ? title : itemId ? `Edit ${listItemName} ` : `Add a new ${listItemName}`}
    </Typography>
  );

  if (advanceSearch) {
    let data = advanceSearch({});
    if (data && data.heading) heading = data.heading;
  }

  const backLink = backLinkButton ? (
    <div className={styles.BackLink}>
      <Link to={backLinkButton.link}>
        <BackIcon />
        {backLinkButton.text}
      </Link>
    </div>
  ) : null;

  return (
    <div className={styles.ItemAdd}>
      {dialogBox}
      {heading}
      {backLink}
      {form}
    </div>
  );
};
