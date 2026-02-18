import { useMutation } from '@apollo/client';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { FormControl, MenuItem, Select } from '@mui/material';
import ConfigureIcon from 'assets/images/icons/Configure/UnselectedDark.svg?react';
import EditIcon from 'assets/images/icons/Edit.svg?react';
import LinkIcon from 'assets/images/icons/Sheets/Link.svg?react';
import ViewIcon from 'assets/images/icons/ViewLight.svg?react';
import { STANDARD_DATE_TIME_FORMAT } from 'common/constants';
import { whatsappFormsInfo } from 'common/HelpData';
import { setErrorMessage, setNotification } from 'common/notification';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Button } from 'components/UI/Form/Button/Button';
import { List } from 'containers/List/List';
import dayjs from 'dayjs';
import { ACTIVATE_FORM, DEACTIVATE_FORM, DELETE_FORM, SYNC_FORM } from 'graphql/mutations/WhatsAppForm';
import { COUNT_WHATSAPP_FORMS, GET_WHATSAPP_FORM, LIST_WHATSAPP_FORMS } from 'graphql/queries/WhatsAppForm';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import styles from './WhatsAppFormList.module.css';

const columnStyles = [styles.Name, styles.StatusColumn, styles.ModifiedAt, styles.Actions];

const queries = {
  filterItemsQuery: LIST_WHATSAPP_FORMS,
  deleteItemQuery: DELETE_FORM,
  getItemQuery: GET_WHATSAPP_FORM,
  countQuery: COUNT_WHATSAPP_FORMS,
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

const getLastModifiedAt = (updatedAt: string) => (
  <div className={styles.LabelWrapper}>{updatedAt ? dayjs(updatedAt).format(STANDARD_DATE_TIME_FORMAT) : ''}</div>
);

export const WhatsAppFormList = () => {
  const [formId, setFormId] = useState<string | null>(null);
  const [dialogType, setDialogType] = useState<'inactive' | 'activate' | null>(null);
  const [filter, setFilter] = useState<any>('all');

  const navigate = useNavigate();

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
    { label: 'Name', name: 'name' },
    { label: 'Status' },
    { label: 'Last Modified At' },
    { name: 'actions', label: 'Actions' },
  ];

  const getColumns = ({ name, status, updatedAt }: Record<string, string>) => ({
    name: getName(name),
    status: getStatus(status),
    updatedAt: getLastModifiedAt(updatedAt),
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

    const handleEdit = (view: boolean) => ({
      label: view ? 'View' : 'Configure',
      icon: view ? (
        <ViewIcon data-testid="view-form" />
      ) : (
        <EditIcon className={styles.IconSize} data-testid="configure-icon" />
      ),
      parameter: 'id',
      dialog: (id: any) => {
        navigate(`/whatsapp-forms/${id}/configure`);
      },
    });

    const deactivateAction = {
      label: 'Deactivate',
      icon: <HighlightOffIcon className={styles.IconSize} data-testid="deactivate-icon" />,
      parameter: 'id',
      dialog: (id: string) => {
        setFormId(id);
        setDialogType('inactive');
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
    const configureIcon = {
      label: 'Edit',
      icon: <ConfigureIcon data-testid="edit-icon" />,
      parameter: 'id',
      dialog: (id: string) => {
        navigate(`/whatsapp-forms/${id}/edit`);
      },
    };

    const actions = [handleEdit(item.status !== 'DRAFT')];

    if (item.status === 'PUBLISHED') {
      actions.push(deactivateAction);
    } else if (item.status === 'INACTIVE') {
      actions.push(activateAction);
    } else if (item.status === 'DRAFT') {
      actions.push(configureIcon);
    }

    if (item.sheet?.url) {
      actions.push(linkAction);
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
    >
      Sync Forms
    </Button>
  );

  let dialog = null;
  if (formId && dialogType) {
    const handleOk = () => {
      if (dialogType === 'inactive') {
        deactivateForm({ variables: { id: formId } });
      }
    };

    let dialogTitle = '';
    let dialogText = '';

    if (dialogType === 'inactive') {
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
        buttonOkLoading={deactivateLoading || activateFormLoading}
      >
        <p className={styles.DialogText}>{dialogText}</p>
      </DialogBox>
    );
  }
  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  return (
    <>
      <List
        helpData={whatsappFormsInfo}
        title="WhatsApp Forms"
        listItem="whatsappForms"
        listItemName="form"
        pageLink="whatsapp-forms"
        secondaryButton={secondaryButton}
        {...queries}
        {...columnAttributes}
        columnNames={columnNames}
        columns={getColumns}
        columnStyles={columnStyles}
        filters={filters}
        filterList={formFilter}
        button={{ show: true, label: 'Create New Form', action: () => navigate('/whatsapp-forms/add') }}
        searchParameter={['name']}
        additionalAction={additionalAction}
        dialogMessage={'The form will be permanently deleted and cannot be recovered.'}
        restrictedAction={(item: any) => ({
          edit: false,
          delete: true,
        })}
      />
      {dialog}
    </>
  );
};

export default WhatsAppFormList;
