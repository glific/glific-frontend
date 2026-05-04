import { useState, Fragment, useEffect } from 'react';
import { Navigate, useParams } from 'react-router';
import { Field, useFormik, FormikProvider } from 'formik';
// eslint-disable-next-line no-unused-vars
import { DocumentNode, useQuery, useMutation } from '@apollo/client';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { Button } from 'components/UI/Form/Button/Button';
import { Dropdown } from 'components/UI/Form/Dropdown/Dropdown';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { setNotification, setErrorMessage } from 'common/notification';
import { SEARCH_QUERY_VARIABLES } from 'common/constants';
import { SEARCH_QUERY } from 'graphql/queries/Search';
import { USER_LANGUAGES } from 'graphql/queries/Organization';
import { GET_ROLE_NAMES } from 'graphql/queries/Role';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Heading } from 'components/UI/Heading/Heading';
import DeleteIcon from 'assets/images/icons/Delete/White.svg?react';
import { organizationHasDynamicRole } from 'common/utils';
import { getUserRole } from 'context/role';
import styles from './FormLayout.module.css';
import { HelpDataProps } from 'common/HelpData';
import { LexicalWrapper } from 'common/LexicalWrapper';

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
    text?: string;
    status?: boolean;
    styles?: string;
    show?: boolean;
  };
  type?: string;
  afterSave?: Function;
  afterDelete?: { link: string };
  refetchQueries?: Array<any>;
  redirect?: boolean;
  title?: string;
  cancelAction?: Function;
  getLanguageId?: Function;
  backLinkButton?: string;
  isAttachment?: boolean;
  getMediaId?: any;
  customStyles?: any;
  customHandler?: Function;
  copyNotification?: string;
  roleAccessSupport?: boolean;
  getQueryFetchPolicy?: any;
  saveOnPageChange?: boolean;
  entityId?: any;
  restrictDelete?: boolean;
  languageAttributes?: any;
  helpData?: HelpDataProps;
  headerHelp?: string;
  noHeading?: boolean;
  isView?: boolean;
  partialPage?: boolean;
  confirmationState?: {
    show: boolean;
    title: string;
    message: React.ReactNode | ((formValues: any) => React.ReactNode);
  };
  restrictButtonStatus?: {
    text?: string;
    status?: boolean;
  };
  errorButtonState?: {
    show?: boolean;
    text?: string;
  };
}

export const FormLayout = ({
  deleteItemQuery,
  states,
  setStates,
  validationSchema,
  listItemName,
  isView = false,
  dialogMessage,
  formFields,
  redirectionLink,
  errorButtonState = {
    show: true,
    text: 'Cancel',
  },
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
  // Todo: lets move advanced search out of here as this is not generic
  advanceSearch,
  cancelAction,
  button = 'Save',
  buttonState = { text: '', status: false, styles: '', show: true },
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
  getQueryFetchPolicy = 'cache-first',
  saveOnPageChange = true,
  entityId = null,
  restrictDelete = false,
  languageAttributes = {},
  headerHelp: headerHelpOverride,
  noHeading = false,
  partialPage = false,
  confirmationState,
  restrictButtonStatus,
}: FormLayoutProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formCancelled, setFormCancelled] = useState(false);
  const [action, setAction] = useState(false);
  const [link, setLink] = useState(undefined);
  const [deleted, setDeleted] = useState(false);
  const [saveClick, onSaveClick] = useState(false);
  const [customError, setCustomError] = useState<any>(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const params = useParams();

  const capitalListItemName = listItemName[0].toUpperCase() + listItemName.slice(1);
  const camelCaseItem = listItem[0].toUpperCase() + listItem.slice(1);
  let itemId = entityId;
  if (!itemId) {
    itemId = params.id;
  }

  let variables: any = itemId ? { [idType]: itemId } : false;
  if (listItem === 'credential') {
    variables = params.type ? { shortcode: params.type } : false;
  }

  const saveHandler = ({ languageId: languageIdValue, ...itemData }: any, isSaveClick: boolean = false) => {
    let payload = {
      ...itemData,
      ...defaultAttribute,
    };

    payload = languageSupport ? { ...payload, languageId: Number(languageIdValue) } : { ...payload };

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
      if (field.skipPayload) {
        delete payload[field.name];
      }
    });
    // for template create media for attachment
    if (isAttachment && payload.type !== 'TEXT' && payload.type && !entityId) {
      getMediaId(payload)
        .then((data: any) => {
          if (data) {
            const payloadCopy = payload;
            delete payloadCopy.attachmentURL;
            payloadCopy.messageMediaId = parseInt(data.data.createMessageMedia.messageMedia.id, 10);
            performTask(payloadCopy, isSaveClick);
          }
        })
        .catch((e: any) => {
          setErrorMessage(e);
        });
    } else {
      performTask(payload, isSaveClick);
    }
  };

  const handleUpdateCompleted = (data: any, isSaveClick: boolean) => {
    setShowConfirmationDialog(false);
    let itemUpdatedObject: any = Object.keys(data)[0];
    itemUpdatedObject = data[itemUpdatedObject];
    const updatedItem = itemUpdatedObject[listItem];
    const { errors, message } = itemUpdatedObject;

    if (errors) {
      if (customHandler) {
        customHandler(errors);
      } else {
        setErrorMessage(errors[0]);
      }
    } else if (updatedItem && typeof updatedItem.isValid === 'boolean' && !updatedItem.isValid) {
      if (customError) {
        const codeErrors = { code: 'Failed to compile code. Please check again' };
        customError.setErrors(codeErrors);
      }
    } else {
      if (type === 'copy') setLink(updatedItem[linkParameter]);
      if (additionalQuery) {
        additionalQuery(itemId);
      }

      if (saveOnPageChange || isSaveClick) {
        setFormSubmitted(true);
        let notificationMessage = `${capitalListItemName} edited successfully!`;
        if (type === 'copy') {
          notificationMessage = copyNotification;
        }
        setNotification(notificationMessage);
      } else {
        setNotification('Your changes have been autosaved');
      }
      if (afterSave) {
        afterSave(data, isSaveClick, message);
      }
    }
    onSaveClick(false);
  };

  const handleCreateCompleted = (data: any, isSaveClick: boolean) => {
    setShowConfirmationDialog(false);
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
      if (saveOnPageChange || isSaveClick) {
        setFormSubmitted(true);
        setNotification(`${capitalListItemName} created successfully!`);
      } else {
        setNotification('Your changes have been autosaved');
      }
      if (afterSave) {
        afterSave(data, isSaveClick);
      }
    }
    onSaveClick(false);
  };

  const handleMutationError = (e: any) => {
    setShowConfirmationDialog(false);
    onSaveClick(false);
    if (customHandler) {
      customHandler(e.message);
    } else {
      setErrorMessage(e);
    }
  };

  const performTask = async (payload: any, isSaveClick: boolean) => {
    try {
      if (itemId && isLoadedData) {
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
          delete payloadBody.billingId;
        }

        const { data } = await updateItem({
          variables: {
            [idKey]: idVal,
            input: payloadBody,
          },
        });
        if (data) handleUpdateCompleted(data, isSaveClick);
      } else {
        const { data } = await createItem({
          variables: {
            input: payload,
          },
        });
        if (data) handleCreateCompleted(data, isSaveClick);
      }
    } catch (e: any) {
      handleMutationError(e);
    }
  };

  const organization = useQuery(USER_LANGUAGES, {
    skip: !languageSupport,
  });

  const {
    loading,
    error,
    data: itemData,
    refetch,
  } = useQuery(getItemQuery, {
    variables,
    skip: !itemId,
    fetchPolicy: getQueryFetchPolicy,
  });

  const fetchedItem: any = itemData
    ? (itemData[listItem]?.[listItem] ?? itemData[Object.keys(itemData)[0]]?.[listItem] ?? null)
    : null;

  useEffect(() => {
    if (fetchedItem && setStates) {
      setStates(fetchedItem);
    }
  }, [itemData]);

  const isLoadedData = Boolean(fetchedItem);

  const getLanguageIdValue = () => {
    if (fetchedItem) {
      return languageSupport ? (fetchedItem.language?.id ?? '') : null;
    }
    if (!itemId && organization.data) {
      return organization.data.currentUser.user.organization.defaultLanguage.id;
    }
    return '';
  };
  const languageId = getLanguageIdValue();

  const formik = useFormik({
    initialValues: {
      languageId,
      ...states,
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { setErrors }) => {
      if (confirmationState?.show) {
        setShowConfirmationDialog(true);
      } else {
        setCustomError({ setErrors });
        saveHandler(values);
      }
    },
  });

  const { t } = useTranslation();

  const { data: roleData } = useQuery(GET_ROLE_NAMES, { skip: !roleAccessSupport });

  useEffect(() => {
    if (advanceSearch) {
      advanceSearch({});
    }
  }, [advanceSearch]);

  useEffect(() => {
    if (entityId) {
      refetch();
    }
  }, [entityId]);

  const [deleteItem] = useMutation(deleteItemQuery, {
    awaitRefetchQueries: true,
    refetchQueries: [
      {
        query: SEARCH_QUERY,
        variables: SEARCH_QUERY_VARIABLES,
      },
    ],
  });

  const [updateItem] = useMutation(updateItemQuery, {
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
    refetchQueries: () => {
      if (refetchQueries)
        return refetchQueries.map((refetchQuery: any) => ({
          query: refetchQuery.query,
          variables: refetchQuery.variables,
        }));

      return [];
    },
  });

  if (loading) return <Loading />;

  if (error) {
    setErrorMessage(error);
    return null;
  }
  if (languageSupport && organization.error) {
    setErrorMessage(organization.error);
    return null;
  }

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
      label: t('Language'),
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
      options: roleData ? roleData.accessRoles.map((role: any) => ({ label: role.label, id: role.id })) : [],
      optionLabel: 'label',
      multiple: true,
      label: t('Roles'),

      helperText: t('Select roles to apply to the resource'),
    };

    formFieldItems = [...formFields, roleAccess];
  }

  const deleteButton =
    itemId && !type && !restrictDelete ? (
      <Button
        variant="contained"
        color="warning"
        data-testid="remove-icon"
        className={styles.DeleteButton}
        onClick={() => setShowDialog(true)}
        disabled={restrictButtonStatus?.status}
      >
        <DeleteIcon className={styles.DeleteIcon} />
        {restrictButtonStatus?.text || 'Remove'}
      </Button>
    ) : null;

  const form = (
    <LexicalWrapper>
      <form onSubmit={formik.handleSubmit}>
        <div className={[styles.Form, customStyles].join(' ')} data-testid="formLayout">
          {formFieldItems.map((field, index) => {
            const key = index;

            if (field.skip) {
              return null;
            }

            return (
              <Fragment key={key}>
                {field.label && (
                  <Typography data-testid="formLabel" variant="h5" className={styles.FieldLabel}>
                    {field.label}
                  </Typography>
                )}
                <Field key={key} {...field} onSubmit={formik.submitForm} />
              </Fragment>
            );
          })}
          <div className={buttonState.styles ? buttonState.styles : styles.Buttons}>
            {buttonState.show && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  formik.validateForm().then((errors) => {
                    if (Object.keys(errors).length > 0) {
                      formik.submitForm();
                      return;
                    }
                    onSaveClick(true);
                    if (confirmationState?.show) {
                      setShowConfirmationDialog(true);
                    } else {
                      setCustomError({ setErrors: formik.setErrors });
                      saveHandler(formik.values, true);
                    }
                  });
                }}
                className={styles.Button}
                data-testid="submitActionButton"
                loading={saveClick}
                disabled={buttonState.status}
              >
                {buttonState.status ? buttonState.text : button}
              </Button>
            )}
            {additionalAction ? (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  setAction(true);

                  if (additionalAction?.action) {
                    additionalAction.action(`${additionalAction.link}/${link}`);
                  } else {
                    formik.submitForm();
                  }
                }}
                data-testid="additionalActionButton"
              >
                {additionalAction.label}
              </Button>
            ) : null}
            {errorButtonState?.show && (
              <Button variant="outlined" color="secondary" onClick={cancelHandler} data-testid="cancelActionButton">
                {errorButtonState?.text}
              </Button>
            )}

            {deleteButton}
          </div>
        </div>
      </form>
    </LexicalWrapper>
  );

  const handleDeleteItem = async () => {
    try {
      await deleteItem({ variables: { id: itemId } });
      setNotification(`${capitalListItemName} deleted successfully`);
      setDeleted(true);
    } catch (err: any) {
      setShowDialog(false);
      setErrorMessage(err);
    }
  };

  let dialogBox;

  if (showDialog) {
    dialogBox = (
      <DialogBox
        title={`Are you sure you want to delete the ${listItemName}?`}
        handleOk={handleDeleteItem}
        handleCancel={() => setShowDialog(false)}
        colorOk="warning"
        alignButtons="center"
        contentAlign="center"
      >
        {dialogMessage}
      </DialogBox>
    );
  }

  let formTitle = '';
  let headerHelp: string = `Please enter below details.`;

  // set title if there is a title
  if (title) {
    formTitle = title;
  } else if (type === 'copy') {
    formTitle = `Copy ${listItemName}`; // case when copying an item
  } else if (itemId) {
    formTitle = isView ? `${listItemName}` : `Edit ${listItemName}`; // case when editing a item
  } else {
    formTitle = `Create a new ${listItemName}`; // case when adding a new item
  }
  if (isView) {
    headerHelp = `Please view below details.`;
  }
  if (headerHelpOverride !== undefined) {
    headerHelp = headerHelpOverride;
  }
  let heading = <Heading backLink={backLinkButton} formTitle={formTitle} headerHelp={headerHelp} />;

  let confirmationDialog;
  if (showConfirmationDialog) {
    confirmationDialog = (
      <DialogBox
        title={confirmationState?.title || 'Are you sure you want to proceed?'}
        handleOk={() => {
          saveHandler(formik.values, true);
        }}
        handleCancel={() => {
          onSaveClick(false);
          setShowConfirmationDialog(false);
        }}
        colorOk="warning"
        alignButtons="center"
        contentAlign="center"
        data-testid="confirmation-dialog"
      >
        {typeof confirmationState?.message === 'function'
          ? confirmationState.message(formik.values)
          : confirmationState?.message}
      </DialogBox>
    );
  }
  return (
    <FormikProvider value={formik}>
      <div className={partialPage ? styles.ItemAddDialog : styles.ItemAdd} data-testid="add-container">
        {dialogBox}
        {confirmationDialog}
        {!noHeading && heading}
        {form}
      </div>
    </FormikProvider>
  );
};
