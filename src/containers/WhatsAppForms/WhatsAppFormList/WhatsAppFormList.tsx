import { useMutation } from '@apollo/client';
import { Button } from 'components/UI/Form/Button/Button';

import { FormControl, MenuItem, Select, IconButton } from '@mui/material';
import Tooltip from 'components/UI/Tooltip/Tooltip';
import PublishIcon from 'assets/images/icons/Publish/PublishGray.svg?react';
import PinIcon from 'assets/images/icons/Pin/Pin.svg?react';
import ActivePinIcon from 'assets/images/icons/Pin/Active.svg?react';
import { whatsappFormsInfo } from 'common/HelpData';
import { setErrorMessage, setNotification } from 'common/notification';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { List } from 'containers/List/List';
import {
  ACTIVATE_FORM,
  DEACTIVATE_FORM,
  DELETE_FORM,
  PUBLISH_FORM,
  SYNC_WHATSAPP_FORMS,
  PIN_WHATSAPP_FORM,
} from 'graphql/mutations/WhatsAppForm';
import { GET_WHATSAPP_FORM, LIST_WHATSAPP_FORMS } from 'graphql/queries/WhatsAppForm';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { formatError } from '../WhatsAppForms';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import styles from './WhatsAppFormList.module.css';

const columnStyles = [styles.Pinned, styles.Name, styles.status, styles.Label, styles.Actions];

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
  const [refresh, setRefresh] = useState(false);

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

  const [syncWhatsappForm, { loading: syncLoading }] = useMutation(SYNC_WHATSAPP_FORMS, {
    onCompleted: (data) => {
      if (data.syncWhatsappForm.errors) {
        setErrorMessage(data.syncWhatsappForm.errors[0].message);
      } else {
        setNotification('WhatsApp Forms synced successfully');
        // Trigger list refresh
        setRefresh((prev) => !prev);
      }
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const [updatePinned] = useMutation(PIN_WHATSAPP_FORM);

  const handlePin = (id: string, pin: boolean) => {
    updatePinned({
      variables: {
        id,
        input: {
          isPinned: pin,
        },
      },
      onCompleted: () => {
        setRefresh((prev) => !prev);
        setNotification(pin ? 'Form pinned successfully' : 'Form unpinned successfully');
      },
      onError: (error) => {
        setErrorMessage(error.message);
      },
    });
  };

  const displayPinned = (isPinned: boolean, id: string) => {
    if (isPinned) {
      return (
        <Tooltip title={'Unpin'} placement={'top-start'}>
          <IconButton data-testid="unpin-button" onClick={() => handlePin(id, false)}>
            <ActivePinIcon />
          </IconButton>
        </Tooltip>
      );
    }
    return (
      <Tooltip title={'Pin'} placement={'top-start'}>
        <IconButton data-testid="pin-button" onClick={() => handlePin(id, true)}>
          <PinIcon />
        </IconButton>
      </Tooltip>
    );
  };

  const columnNames = [
    { name: 'isPinned', label: '', sort: true, order: 'desc' },
    { name: 'name', label: 'Name', sort: true },
    { name: 'status', label: 'Status' },
    { name: 'category', label: 'Category' },
    { name: 'actions', label: 'Actions' },
  ];

  const getColumns = ({ name, categories, status, isPinned, id }: any) => ({
    isPinned: displayPinned(isPinned, id),
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

    if (item.status === 'PUBLISHED') {
      actions = [deactivateAction];
    } else if (item.status === 'DRAFT') {
      actions = [publishAction];
    } else {
      actions = [activateAction];
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
        refreshList={refresh}
        listItem="listWhatsappForms"
        listItemName="form"
        pageLink="whatsapp-forms"
        columnNames={columnNames}
        columns={getColumns}
        columnStyles={columnStyles}
        secondaryButton={
          <div style={{ marginRight: '10px' }}>
            <Button
              className={styles.SyncButton}
              variant="outlined"
              color="primary"
              onClick={() => syncWhatsappForm()}
              loading={syncLoading}
            >
              Sync Whatsapp Form
            </Button>
          </div>
        }
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
