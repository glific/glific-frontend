import { useMutation } from '@apollo/client';
import { FormControl, MenuItem, Select } from '@mui/material';
import DeactivateIcon from 'assets/images/icons/DeactivateIcon.svg?react';
import DeleteIcon from 'assets/images/icons/Delete/Red.svg?react';
import EditIcon from 'assets/images/icons/Edit.svg?react';
import PublishIcon from 'assets/images/icons/Publish/PublishGray.svg?react';
import { whatsappFormsInfo } from 'common/HelpData';
import { setErrorMessage, setNotification } from 'common/notification';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { List } from 'containers/List/List';
import { DEACTIVATE_FORM, DELETE_FORM, PUBLISH_FORM } from 'graphql/mutations/WhatsAppForm';
import { GET_WHATSAPP_FORM, LIST_WHATSAPP_FORMS } from 'graphql/queries/WhatsAppForm';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
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
  const [dialogType, setDialogType] = useState<'publish' | 'inactive' | 'delete' | null>(null);
  const [filter, setFilter] = useState<any>('all');

  const navigate = useNavigate();

  const [publishForm, { loading: publishLoading }] = useMutation(PUBLISH_FORM, {
    onCompleted: () => {
      setFormId(null);
      setDialogType(null);
      setNotification('Form published successfully');
    },
    onError: () => {
      setErrorMessage('Failed to publish form');
    },
  });

  const [deactivateForm, { loading: deactivateLoading }] = useMutation(DEACTIVATE_FORM, {
    onCompleted: () => {
      setFormId(null);
      setDialogType(null);
      setNotification('Form deactivated successfully');
    },
    onError: () => {
      setErrorMessage('Failed to deactivate form');
    },
  });

  const [deleteForm, { loading: deleteLoading }] = useMutation(DELETE_FORM, {
    onCompleted: () => {
      setFormId(null);
      setDialogType(null);
      setNotification('Form deleted successfully');
    },
    onError: () => {
      setErrorMessage('Failed to delete form');
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
    const deleteAction = {
      label: 'Delete',
      icon: <DeleteIcon className={styles.Delete} data-testid="delete-icon" />,
      parameter: 'id',
      dialog: (id: any) => {
        console.log(id);
        setFormId(id);
        setDialogType('delete');
      },
    };
    const deactivateAction = {
      label: 'Deactivate',
      icon: <DeactivateIcon className={styles.IconSize} data-testid="deactivate-icon" />,
      parameter: 'id',
      dialog: (id: string) => {
        setFormId(id);
        setDialogType('inactive');
      },
    };

    const editIcon = {
      label: 'Edit',
      icon: <EditIcon className={styles.IconSize} data-testid="edit-icon" />,
      parameter: 'id',
      dialog: (id: string) => {
        navigate(`/whatsapp-forms/edit/${id}`);
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

    let actions = [];

    if (item.status === 'PUBLISHED') {
      actions = [deactivateAction, deleteAction];
    } else if (item.status === 'DRAFT') {
      actions = [publishAction, editIcon, deactivateAction, deleteAction];
    } else if (item.status === 'INACTIVE') {
      actions = [deleteAction];
    } else {
      actions = [publishAction, editIcon, deactivateAction, deleteAction];
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
      } else if (dialogType === 'delete') {
        deleteForm({ variables: { id: formId } });
      }
    };

    dialog = (
      <DialogBox
        title={dialogType === 'publish' ? 'Do you want to publish this form?' : 'Do you want to deactivate this form?'}
        handleOk={handleOk}
        handleCancel={() => {
          setFormId(null);
          setDialogType(null);
        }}
        alignButtons="center"
        buttonOkLoading={publishLoading || deactivateLoading || deleteLoading}
      >
        <p className={styles.DialogText}>
          {dialogType === 'publish'
            ? 'The form will be published on Meta and made visible to users.'
            : 'The form will be marked inactive and cannot be used.'}
        </p>
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
        columnNames={columnNames}
        columns={getColumns}
        columnStyles={columnStyles}
        filters={filters}
        filterList={formFilter}
        button={{ show: true, label: 'Create New Form', action: () => navigate('/whatsapp-forms/add') }}
        searchParameter={['name']}
        additionalAction={additionalAction}
        restrictedAction={(item: any) => ({
          edit: false,
          delete: false,
        })}
      />
      {dialog}
    </>
  );
};

export default WhatsAppFormList;
