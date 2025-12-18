import { useMutation } from '@apollo/client';
import { FormControl, MenuItem, Select } from '@mui/material';
import PublishIcon from 'assets/images/icons/Publish/PublishGray.svg?react';
import { whatsappFormsInfo } from 'common/HelpData';
import { setErrorMessage, setNotification } from 'common/notification';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { List } from 'containers/List/List';
import { ACTIVATE_FORM, DEACTIVATE_FORM, DELETE_FORM, PUBLISH_FORM, SYNC_FORM } from 'graphql/mutations/WhatsAppForm';
import { GET_WHATSAPP_FORM, LIST_WHATSAPP_FORMS } from 'graphql/queries/WhatsAppForm';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { formatError } from '../WhatsAppForms';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import LinkIcon from 'assets/images/icons/Sheets/Link.svg?react';
import { Button } from 'components/UI/Form/Button/Button';
import styles from './WhatsAppFormList.module.css';

const columnStyles = [styles.Name, styles.status, styles.Label, styles.Actions];

const queries = {
  filterItemsQuery: LIST_WHATSAPP_FORMS,
  deleteItemQuery: DELETE_FORM,
  getItemQuery: GET_WHATSAPP_FORM,
  publishFlowQuery: PUBLISH_FORM,
};

const getName = (name: string) => <div className={styles.NameText}>{name}</div>;

const getStatus = (status: string) => {
  if (status === 'PUBLISHED') {
    return <div className={styles.PublishBadge}>Published</div>;
  } else if (status === 'DRAFT') {
    return <div className={styles.DraftBadge}>Draft</div>;
  } else if (status === 'INACTIVE') {
    return <div className={styles.InactiveBadge}>Inactive</div>;
  }
};

const getCategories = (categories: string[]) => {
  if (!categories?.length) return null;

  const displayedCategories = categories.slice(0, 2);
  const hiddenCategories = categories.slice(2);

  return (
    <div className={styles.LabelWrapper}>
      <div className={styles.LabelButton}>
        {displayedCategories.map((category) => (
          <span key={category} className={styles.CategoryTag}>
            {category}
          </span>
        ))}

        {categories.length > 2 && (
          <div className={styles.MoreWrapper}>
            <span className={styles.CategoryMore}> + {categories.length - 2} more</span>
            <div className={styles.MoreList}>
              {hiddenCategories.map((category) => (
                <div key={category} className={styles.MoreListItem}>
                  {category}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const WhatsAppFormList = () => {
  const [formId, setFormId] = useState<string | null>(null);
  const [dialogType, setDialogType] = useState<'publish' | 'inactive' | 'activate' | null>(null);
  const [filter, setFilter] = useState<any>('all');

  const navigate = useNavigate();

  const [publishForm, { loading: publishLoading }] = useMutation(PUBLISH_FORM, {
    onCompleted: () => {
      setFormId(null);
      setDialogType(null);
      setNotification('Form published successfully');
    },
    onError: (errors) => {
      setErrorMessage(formatError(errors.message), 'An error occurred');
    },
  });
  const handleFormUpdates = () => {
    syncWhatsappForm();
  };

  const [syncWhatsappForm, { loading: syncLoading }] = useMutation(SYNC_FORM, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      const errors = data?.syncWhatsappForm?.errors;
      if (errors?.length) {
        setNotification('Sorry, failed to sync whatsapp forms updates.', 'warning');
      } else {
        setNotification(
          'Syncing of the WhatsApp forms has started in the background. Please check the Notifications page for updates.',
          'success'
        );
      }
    },
    onError: () => {
      setNotification('Sorry, failed to sync whatsapp forms updates.', 'warning');
    },
  });

  const [activateForm, { loading: activateFormLoading }] = useMutation(ACTIVATE_FORM, {
    onCompleted: () => {
      setFormId(null);
      setDialogType(null);
      setNotification('Form activated successfully');
    },
    onError: (errors) => {
      setErrorMessage(errors);
    },
  });

  const [deactivateForm, { loading: deactivateLoading }] = useMutation(DEACTIVATE_FORM, {
    onCompleted: () => {
      setFormId(null);
      setDialogType(null);
      setNotification('Form deactivated successfully');
    },
    onError: (errors) => {
      setErrorMessage(errors);
    },
  });

  const columnNames = [
    { name: 'name', label: 'Name' },
    { name: 'status', label: 'Status' },
    { name: 'category', label: 'Category' },
    { name: 'actions', label: 'Actions' },
  ];

  const getColumns = ({ name, categories, status }: any) => ({
    name: getName(name),
    status: getStatus(status),
    category: getCategories(categories),
  });

  const filterList = [
    { label: 'All', value: 'all' },
    { label: 'Published', value: 'published' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Draft', value: 'draft' },
  ];

  const additionalAction = (item: any) => {
    const linkAction = {
      label: 'Link',
      icon: <LinkIcon data-testid="link-icon" />,
      parameter: 'id',
      dialog: (id: string) => {
        window.open(item.sheet?.url);
      },
    };

    const deactivateAction = {
      label: 'Deactivate',
      icon: <HighlightOffIcon className={styles.IconSize} data-testid="deactivate-icon" />,
      parameter: 'id',
      dialog: (id: string) => {
        setFormId(id);
        setDialogType('inactive');
      },
    };

    const publishAction = {
      label: 'Publish',
      icon: <PublishIcon className={styles.IconSize} data-testid="publish-icon" />,
      parameter: 'id',
      dialog: (id: string) => {
        setFormId(id);
        setDialogType('publish');
      },
    };

    const activateAction = {
      label: 'Activate',
      icon: <AddCircleOutlineIcon className={styles.IconSize} data-testid="activate-icon" />,
      parameter: 'id',
      dialog: (id: string) => {
        setFormId(id);
        activateForm({ variables: { activateWhatsappFormId: id } });
      },
    };

    let actions = [];

    if (item.sheet?.url) {
      actions.push(linkAction);
    }

    if (item.status === 'PUBLISHED') {
      actions.push(deactivateAction);
    } else if (item.status === 'DRAFT') {
      actions.push(publishAction);
    } else {
      actions.push(activateAction);
    }

    return actions;
  };
  const filters = useMemo(() => {
    let filters: any = {};
    if (filter !== 'all') {
      filters = { status: filter.toUpperCase() };
    }
    return filters;
  }, [filter]);

  const formFilter = (
    <FormControl>
      <Select
        aria-label="form-type"
        name="form-type"
        value={filter}
        onChange={(event) => {
          const { value } = event.target;
          setFilter(value);
        }}
        className={styles.SearchBar}
      >
        {filterList.map((filter: any) => (
          <MenuItem key={filter.label} value={filter.value}>
            {filter.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
  const secondaryButton = (
    <Button
      variant="outlined"
      color="primary"
      className={styles.HsmUpdates}
      data-testid="syncWhatsappForm"
      onClick={() => handleFormUpdates()}
      loading={syncLoading}
      aria-hidden="true"
    >
      Sync Whatsapp Forms
    </Button>
  );

  let dialog = null;
  if (formId && dialogType) {
    const handleOk = () => {
      if (dialogType === 'publish') {
        publishForm({ variables: { id: formId } });
      } else if (dialogType === 'inactive') {
        deactivateForm({ variables: { id: formId } });
      }
    };

    let dialogTitle = '';
    let dialogText = '';

    if (dialogType === 'publish') {
      dialogTitle = 'Do you want to publish this form?';
      dialogText = 'The form will be published on Meta and made visible to users.';
    } else if (dialogType === 'inactive') {
      dialogTitle = 'Do you want to deactivate this form?';
      dialogText = 'The form will be marked inactive and cannot be used.';
    }

    dialog = (
      <DialogBox
        title={dialogTitle}
        handleOk={handleOk}
        handleCancel={() => {
          setFormId(null);
          setDialogType(null);
        }}
        alignButtons="center"
        buttonOkLoading={deactivateLoading || activateFormLoading || publishLoading}
      >
        <p className={styles.DialogText}>{dialogText}</p>
      </DialogBox>
    );
  }

  return (
    <>
      <List
        {...queries}
        helpData={whatsappFormsInfo}
        title="WhatsApp Forms"
        listItem="listWhatsappForms"
        listItemName="form"
        pageLink="whatsapp-forms"
        secondaryButton={secondaryButton}
        columnNames={columnNames}
        columns={getColumns}
        columnStyles={columnStyles}
        filters={filters}
        filterList={formFilter}
        button={{ show: true, label: 'Create New Form', action: () => navigate('/whatsapp-forms/add') }}
        searchParameter={['name']}
        additionalAction={additionalAction}
        dialogMessage={'The form will be permanently deleted and cannot be recovered.'}
      />
      {dialog}
    </>
  );
};

export default WhatsAppFormList;
