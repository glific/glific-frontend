import React, { useState } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import { useApolloClient, DocumentNode, ApolloError, useQuery, useMutation } from '@apollo/client';
import { Typography, IconButton } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import styles from './FormLayout.module.css';
import { Button } from '../../components/UI/Form/Button/Button';
import { Dropdown } from '../../components/UI/Form/Dropdown/Dropdown';
import { DialogBox } from '../../components/UI/DialogBox/DialogBox';
import { Loading } from '../../components/UI/Layout/Loading/Loading';
import { setNotification, setErrorMessage } from '../../common/notification';
import { convertToWhatsApp } from '../../common/RichEditor';
import { SEARCH_QUERY_VARIABLES } from '../../common/constants';
import { SEARCH_QUERY } from '../../graphql/queries/Search';
import { USER_LANGUAGES } from '../../graphql/queries/Organization';
import { ReactComponent as DeleteIcon } from '../../assets/images/icons/Delete/White.svg';
import { ReactComponent as BackIcon } from '../../assets/images/icons/Back.svg';

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
  refetchQueries?: Array<any>;
  redirect?: boolean;
  title?: string;
  getLanguageId?: any;
  backLinkButton?: any;
  isAttachment?: boolean;
  getMediaId?: any;
  customStyles?: any;
  customHandler?: any;
  copyNotification?: string;
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
  isAttachment = false,
  getMediaId,
  customStyles = null,
  customHandler,
  copyNotification = '',
}: FormLayoutProps) => {
  const client = useApolloClient();
  const [showDialog, setShowDialog] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [languageId, setLanguageId] = useState('');
  const [formCancelled, setFormCancelled] = useState(false);
  const [action, setAction] = useState(false);
  const [link, setLink] = useState(undefined);
  const [deleted, setDeleted] = useState(false);
  const [saveClick, onSaveClick] = useState(false);
  const { t } = useTranslation();

  const capitalListItemName = listItemName[0].toUpperCase() + listItemName.slice(1);
  let item: any = null;
  const itemId = match.params.id ? match.params.id : false;
  let variables: any = itemId ? { id: itemId } : false;

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

  // get the organization for current user and have languages option set to that.

  const organization = useQuery(USER_LANGUAGES, {
    onCompleted: (data: any) => {
      if (!itemId) {
        setLanguageId(data.currentUser.user.organization.defaultLanguage.id);
      }
    },
  });

  if (listItem === 'credential') {
    variables = match.params.shortcode ? { shortcode: match.params.shortcode } : false;
  }

  const { loading, error } = useQuery(getItemQuery, {
    variables,
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
      const itemUpdated = Object.keys(data)[0];

      if (data[itemUpdated] && data[itemUpdated].errors) {
        if (customHandler) {
          customHandler(client, data[itemUpdated].errors);
        } else {
          setErrorMessage(client, data[itemUpdated].errors[0]);
        }
      } else {
        if (type === 'copy') setLink(data[itemUpdated][listItem][linkParameter]);
        if (additionalQuery) {
          additionalQuery(itemId);
        }
        setFormSubmitted(true);
        // emit data after save
        if (afterSave) {
          afterSave(data);
        }
        // display successful message after update
        let message = `${capitalListItemName} edited successfully!`;
        if (type === 'copy') {
          message = copyNotification;
        }
        setNotification(client, message);
      }
      onSaveClick(false);
    },
    onError: (e: ApolloError) => {
      onSaveClick(false);
      setErrorMessage(client, e);
      return null;
    },
    refetchQueries: () => {
      if (refetchQueries)
        return refetchQueries.map((refetchQuery: any) => ({
          query: refetchQuery.query,
          variables: refetchQuery.variables,
        }));
      return [];
    },
  });

  const [createItem] = useMutation(createItemQuery, {
    onCompleted: (data) => {
      const itemCreated = `create${camelCaseItem}`;
      if (data[itemCreated].errors) {
        if (customHandler) {
          customHandler(client, data[itemCreated].errors);
        } else {
          setErrorMessage(client, data[itemCreated].errors[0]);
        }
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
        // display successful message after create
        setNotification(client, `${capitalListItemName} created successfully!`);
      }
      onSaveClick(false);
    },
    refetchQueries: () => {
      if (refetchQueries)
        return refetchQueries.map((refetchQuery: any) => ({
          query: refetchQuery.query,
          variables: refetchQuery.variables,
        }));

      return [];
    },
    onError: (e: ApolloError) => {
      onSaveClick(false);
      setErrorMessage(client, e);
      return null;
    },
  });

  if (loading) return <Loading />;
  if (error) {
    setErrorMessage(client, error);
    return null;
  }

  const performTask = (payload: any) => {
    if (itemId) {
      updateItem({
        variables: {
          id: itemId,
          input: payload,
        },
      });
    } else {
      createItem({
        variables: {
          input: payload,
        },
      });
    }
  };

  const saveHandler = ({ languageId: languageIdValue, ...itemData }: any) => {
    let payload = {
      ...itemData,
      ...defaultAttribute,
    };

    payload = languageSupport
      ? { ...payload, languageId: Number(languageIdValue) }
      : { ...payload };

    // create custom payload for searches
    if (setPayload) {
      payload = setPayload(payload);
      if (advanceSearch) {
        const data = advanceSearch(payload);

        if (data && data.heading && type === 'search') return;
      }
    }

    // remove fields from the payload that marked as skipPayload = true
    formFields.forEach((field: any) => {
      if (field.additionalState) {
        additionalState(payload[field.additionalState]);
      }
      if (field.convertToWhatsApp && payload[field.name]) {
        payload[field.name] = convertToWhatsApp(payload[field.name]);
      }
      if (field.skipPayload) {
        delete payload[field.name];
      }
    });
    // for template create media for attachment
    if (isAttachment && payload.type !== 'TEXT' && payload.type) {
      getMediaId(payload)
        .then((data: any) => {
          if (data) {
            const payloadCopy = payload;
            delete payloadCopy.attachmentURL;
            payloadCopy.messageMediaId = parseInt(data.data.createMessageMedia.messageMedia.id, 10);
            performTask(payloadCopy);
          }
        })
        .catch((e: any) => {
          setErrorMessage(client, e);
        });
    } else {
      performTask(payload);
    }
  };

  const cancelHandler = () => {
    // for chat screen searches
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
    }
    return <Redirect to={`/${redirectionLink}`} />;
  }

  if (formCancelled) {
    return <Redirect to={cancelLink ? `/${cancelLink}` : `/${redirectionLink}`} />;
  }

  const validateLanguage = (value: any) => {
    if (value && getLanguageId) {
      getLanguageId(value);
    }
  };

  const languageOptions = organization.data
    ? organization.data.currentUser.user.organization.activeLanguages.slice()
    : [];
  // sort languages by their name
  languageOptions.sort((first: any, second: any) => (first.label > second.label ? 1 : -1));

  const language = languageSupport
    ? {
        component: Dropdown,
        name: 'languageId',
        placeholder: t('Language'),
        options: languageOptions,
        validate: validateLanguage,
        helperText: t('For more languages check settings or connect with your admin'),
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

  const form = (
    <>
      <Formik
        enableReinitialize
        initialValues={{
          ...states,
          languageId,
        }}
        validationSchema={validationSchema}
        onSubmit={(itemData) => {
          saveHandler(itemData);
          onSaveClick(true);
        }}
      >
        {({ submitForm }) => (
          <Form className={[styles.Form, customStyles].join(' ')} data-testid="formLayout">
            {formFieldItems.map((field, index) => {
              const key = index;
              return (
                <React.Fragment key={key}>
                  {field.label ? (
                    <Typography variant="h5" className={styles.FieldLabel}>
                      {field.label}
                    </Typography>
                  ) : null}
                  <Field key={key} {...field} />
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
                loading={saveClick}
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
                {t('Cancel')}
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
        alignButtons="center"
      >
        <p className={styles.DialogText}>{dialogMessage}</p>
      </DialogBox>
    );
  }

  let formTitle = '';

  // set title if there is a title
  if (title) {
    formTitle = title;
  } else if (type === 'copy') {
    formTitle = `Copy ${listItemName}`; // case when copying an item
  } else if (itemId) {
    formTitle = `Edit ${listItemName}`; // case when editing a item
  } else {
    formTitle = `Add a new ${listItemName}`; // case when adding a new item
  }

  let heading = (
    <Typography variant="h5" className={styles.Title}>
      <IconButton disabled className={styles.Icon}>
        {icon}
      </IconButton>
      {formTitle}
    </Typography>
  );

  if (advanceSearch) {
    const data = advanceSearch({});
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
