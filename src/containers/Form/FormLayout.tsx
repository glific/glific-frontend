import { useState } from 'react';
import { Navigate, Link, useParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
// eslint-disable-next-line no-unused-vars
import { DocumentNode, ApolloError, useQuery, useMutation } from '@apollo/client';
import { Typography, IconButton } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { Button } from 'components/UI/Form/Button/Button';
import { Dropdown } from 'components/UI/Form/Dropdown/Dropdown';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { setNotification, setErrorMessage } from 'common/notification';
import { getPlainTextFromEditor } from 'common/RichEditor';
import { SEARCH_QUERY_VARIABLES } from 'common/constants';
import { SEARCH_QUERY } from 'graphql/queries/Search';
import { USER_LANGUAGES } from 'graphql/queries/Organization';
import { GET_ROLE_NAMES } from 'graphql/queries/Role';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { ReactComponent as DeleteIcon } from 'assets/images/icons/Delete/White.svg';
import { ReactComponent as BackIcon } from 'assets/images/icons/Back.svg';
import { organizationHasDynamicRole } from 'common/utils';
import { getUserRole } from 'context/role';
import styles from './FormLayout.module.css';

export const Heading = ({ icon, formTitle }: any) => (
  <Typography variant="h5" className={styles.Title}>
    <IconButton disabled className={styles.Icon}>
      {icon}
    </IconButton>
    {formTitle}
  </Typography>
);

export interface FormLayoutProps {
  deleteItemQuery: DocumentNode;
  states: Object;
  setStates: Function;
  validationSchema: Object;
  listItemName: string;
  dialogMessage: string;
  formFields: Array<any>;
  redirectionLink: string;
  listItem: string;
  getItemQuery: DocumentNode;
  createItemQuery: DocumentNode;
  updateItemQuery: DocumentNode;
  defaultAttribute?: any;
  icon: React.ReactNode;
  idType?: string;
  additionalAction?: any;
  additionalQuery?: Function | null;
  linkParameter?: any;
  cancelLink?: string | null;
  languageSupport?: boolean;
  setPayload?: Function;
  advanceSearch?: any;
  additionalState?: any;
  button?: string;
  buttonState?: {
    text: string;
    status: boolean;
  };
  type?: string;
  afterSave?: Function;
  afterDelete?: { link: string };
  refetchQueries?: Array<any>;
  redirect?: boolean;
  title?: string;
  cancelAction?: Function;
  getLanguageId?: Function;
  backLinkButton?: {
    text: string;
    link: string;
  };
  isAttachment?: boolean;
  getMediaId?: any;
  customStyles?: any;
  customHandler?: Function;
  copyNotification?: string;
  roleAccessSupport?: boolean;
  showPreviewButton?: boolean;
  onPreviewClick?: Function;
  getQueryFetchPolicy?: any;
  saveOnPageChange?: boolean;
  entityId?: any;
  restrictDelete?: boolean;
  languageAttributes?: any;
}

export const FormLayout = ({
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
  additionalAction,
  icon,
  idType = 'id',
  additionalState,
  title,
  linkParameter = null,
  cancelLink = null,
  languageSupport = true,
  roleAccessSupport = false,
  setPayload,
  advanceSearch,
  cancelAction,
  button = 'Save',
  buttonState = { text: '', status: false },
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
  showPreviewButton = false,
  onPreviewClick = () => {},
  getQueryFetchPolicy = 'cache-first',
  saveOnPageChange = true,
  entityId = null,
  restrictDelete = false,
  languageAttributes = {},
}: FormLayoutProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [languageId, setLanguageId] = useState('');
  const [formCancelled, setFormCancelled] = useState(false);
  const [action, setAction] = useState(false);
  const [link, setLink] = useState(undefined);
  const [deleted, setDeleted] = useState(false);
  const [saveClick, onSaveClick] = useState(false);
  const [isLoadedData, setIsLoadedData] = useState(false);
  const [customError, setCustomError] = useState<any>(null);
  const params = useParams();

  const { t } = useTranslation();

  // TODO: this query should only get triggered when roles are enabled for an organization
  const { data: roleData } = useQuery(GET_ROLE_NAMES);

  const capitalListItemName = listItemName[0].toUpperCase() + listItemName.slice(1);
  let item: any = null;
  let itemId = params.id ? params.id : false;
  if (!itemId && entityId) {
    itemId = entityId;
  }

  let variables: any = itemId ? { [idType]: itemId } : false;

  const [deleteItem] = useMutation(deleteItemQuery, {
    onCompleted: () => {
      setNotification(`${capitalListItemName} deleted successfully`);
      setDeleted(true);
    },
    onError: (err: ApolloError) => {
      setShowDialog(false);
      setErrorMessage(err);
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
    variables = params.type ? { shortcode: params.type } : false;
  }

  const { loading, error } = useQuery(getItemQuery, {
    variables,
    skip: !itemId,
    fetchPolicy: getQueryFetchPolicy,
    onCompleted: (data) => {
      if (data) {
        item = data[listItem] ? data[listItem][listItem] : data[Object.keys(data)[0]][listItem];
        if (item) {
          setIsLoadedData(true);
          setLink(data[listItem] ? data[listItem][listItem][linkParameter] : item.linkParameter);
          setStates(item);
          setLanguageId(languageSupport ? item.language.id : null);
        }
      }
    },
  });

  const camelCaseItem = listItem[0].toUpperCase() + listItem.slice(1);

  const [updateItem] = useMutation(updateItemQuery, {
    onCompleted: (data) => {
      let itemUpdatedObject: any = Object.keys(data)[0];
      itemUpdatedObject = data[itemUpdatedObject];
      const updatedItem = itemUpdatedObject[listItem];
      const { errors } = itemUpdatedObject;

      if (errors) {
        if (customHandler) {
          customHandler(errors);
        } else {
          setErrorMessage(errors[0]);
        }
      } else if (updatedItem && typeof updatedItem.isValid === 'boolean' && !updatedItem.isValid) {
        if (customError) {
          // this is a custom error for extensions. We need to move this out of this component
          const codeErrors = { code: 'Failed to compile code. Please check again' };
          customError.setErrors(codeErrors);
        }
      } else {
        if (type === 'copy') setLink(updatedItem[linkParameter]);
        if (additionalQuery) {
          additionalQuery(itemId);
        }

        if (saveOnPageChange || saveClick) {
          setFormSubmitted(true);
          // display successful message after update
          let message = `${capitalListItemName} edited successfully!`;
          if (type === 'copy') {
            message = copyNotification;
          }
          setNotification(message);
        } else {
          setNotification('Your changes have been autosaved');
        }
        // emit data after save
        if (afterSave) {
          afterSave(data, saveClick);
        }
      }
      onSaveClick(false);
    },
    onError: (e: ApolloError) => {
      onSaveClick(false);
      setErrorMessage(e);
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
      let itemCreatedObject: any = `create${camelCaseItem}`;
      itemCreatedObject = data[itemCreatedObject];
      const itemCreated = itemCreatedObject[listItem];

      const { errors } = itemCreatedObject;
      if (errors) {
        if (customHandler) {
          customHandler(errors);
        } else {
          setErrorMessage(errors[0]);
        }
      } else if (itemCreated && typeof itemCreated.isValid === 'boolean' && !itemCreated.isValid) {
        if (customError) {
          const codeErrors = { code: 'Failed to compile code. Please check again' };
          customError.setErrors(codeErrors);
        }
      } else {
        if (additionalQuery) {
          additionalQuery(itemCreated.id);
        }
        if (!itemId) setLink(itemCreated[linkParameter]);
        if (saveOnPageChange || saveClick) {
          setFormSubmitted(true);
          // display successful message after create
          setNotification(`${capitalListItemName} created successfully!`);
        } else {
          setNotification('Your changes have been autosaved');
        }
        // emit data after save
        if (afterSave) {
          afterSave(data, saveClick);
        }
      }
      setIsLoadedData(true);
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
      setErrorMessage(e);
      return null;
    },
  });

  if (loading) return <Loading />;
  if (error) {
    setErrorMessage(error);
    return null;
  }
  const performTask = (payload: any) => {
    if (itemId) {
      if (isLoadedData) {
        let idKey = idType;
        let idVal = itemId;

        /**
         * When idType is organizationId
         * We are updating billing for given organization
         * since params.id is orgId we want billing
         * id to update billing details
         */
        const payloadBody = { ...payload };
        if (idType === 'organizationId') {
          idKey = 'id';
          idVal = payloadBody.billingId;
          // Clearning unnecessary fields
          delete payloadBody.billingId;
        }

        updateItem({
          variables: {
            [idKey]: idVal,
            input: payloadBody,
          },
        });
      } else {
        createItem({
          variables: {
            input: payload,
          },
        });
      }
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
        payload[field.name] = getPlainTextFromEditor(payload[field.name]);
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
          setErrorMessage(e);
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
    if (cancelAction) {
      cancelAction();
    }
    setFormCancelled(true);
  };

  if (formSubmitted && redirect) {
    return <Navigate to={action ? `${additionalAction.link}/${link}` : `/${redirectionLink}`} />;
  }

  if (deleted) {
    if (afterDelete) {
      return <Navigate to={afterDelete.link} />;
    }
    return <Navigate to={`/${redirectionLink}`} />;
  }

  if (formCancelled) {
    return <Navigate to={cancelLink ? `/${cancelLink}` : `/${redirectionLink}`} />;
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

  let formFieldItems = formFields;

  if (languageSupport) {
    const language = {
      ...languageAttributes,
      component: Dropdown,
      name: 'languageId',
      placeholder: t('Language'),
      options: languageOptions,
      validate: validateLanguage,
      helperText: t('For more languages check settings or connect with your admin'),
    };

    formFieldItems = [...formFields, language];
  }

  if (roleAccessSupport && organizationHasDynamicRole() && getUserRole().includes('Admin')) {
    const roleAccess = {
      component: AutoComplete,
      name: 'roles',
      placeholder: t('Roles'),
      options: roleData
        ? roleData.accessRoles.map((role: any) => ({ label: role.label, id: role.id }))
        : [],
      optionLabel: 'label',
      multiple: true,
      textFieldProps: {
        label: t('Roles'),
        variant: 'outlined',
      },

      helperText: t('Select roles to apply to the resource'),
    };

    formFieldItems = [...formFields, roleAccess];
  }

  const deleteButton =
    itemId && !type && !restrictDelete ? (
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

  const onSaveButtonClick = (errors: any) => {
    if (Object.keys(errors).length > 0) {
      return;
    }
    onSaveClick(true);
  };

  const form = (
    <Formik
      enableReinitialize
      validateOnMount
      initialValues={{
        languageId,
        ...states,
      }}
      validationSchema={validationSchema}
      onSubmit={(itemData, { setErrors }) => {
        // when you want to show custom error on form field and error message is not coming from api
        setCustomError({ setErrors });
        saveHandler(itemData);
      }}
    >
      {({ errors, submitForm }) => (
        <Form className={[styles.Form, customStyles].join(' ')} data-testid="formLayout">
          {formFieldItems.map((field, index) => {
            const key = index;

            if (field.skip) {
              return null;
            }

            return (
              <>
                {field.label && (
                  <Typography variant="h5" key={key} className={styles.FieldLabel}>
                    {field.label}
                  </Typography>
                )}
                <Field key={key} {...field} onSubmit={submitForm} />
              </>
            );
          })}
          <div className={styles.Buttons}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                onSaveButtonClick(errors);
                submitForm();
              }}
              className={styles.Button}
              data-testid="submitActionButton"
              loading={saveClick}
              disabled={buttonState.status}
            >
              {buttonState.status ? buttonState.text : button}
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
            {showPreviewButton && (
              <Button
                variant="contained"
                color="primary"
                onClick={onPreviewClick}
                className={styles.Button}
                data-testid="previewButton"
              >
                Preview
              </Button>
            )}
            {deleteButton}
          </div>
        </Form>
      )}
    </Formik>
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
        contentAlign="center"
      >
        {dialogMessage}
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

  let heading = <Heading icon={icon} formTitle={formTitle} />;
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
