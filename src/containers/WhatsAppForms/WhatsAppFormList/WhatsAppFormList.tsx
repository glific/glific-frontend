import { whatsappFormsInfo } from 'common/HelpData';
import { useNavigate } from 'react-router';
import { List } from 'containers/List/List';
import { LIST_WHATSAPP_FORMS, GET_WHATSAPP_FORM } from 'graphql/queries/WhatsAppForm';
import { DELETE_FORM, PUBLISH_FORM, DEACTIVATE_FORM } from 'graphql/mutations/WhatsAppForm';
import { useState, useMemo } from 'react';
import PublishIcon from 'assets/images/icons/PublishGood.svg?react';
import DeactivateIcon from 'assets/images/icons/DeactivateIcon.svg?react';
import styles from './WhatsAppFormList.module.css';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { FormControl, MenuItem, Select } from '@mui/material';
import { useMutation } from '@apollo/client';
import { setErrorMessage, setNotification } from 'common/notification';

const columnStyles = [styles.Name, styles.status, styles.Label, styles.Actions];

const queries = {
  filterItemsQuery: LIST_WHATSAPP_FORMS,
  deleteItemQuery: DELETE_FORM,
  getItemQuery: GET_WHATSAPP_FORM,
  publishFlowQuery: PUBLISH_FORM,
};

export const WhatsAppFormList = () => {
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [dialogType, setDialogType] = useState<'publish' | 'inactive' | null>(null);
  const navigate = useNavigate();
  const [filter, setFilter] = useState<any>('all');
  const [publishForm] = useMutation(PUBLISH_FORM, {
    onCompleted: () => {
      setCurrentItem(null);
      setDialogType(null);
    },
  });

  const [deactivateForm] = useMutation(DEACTIVATE_FORM, {
    onCompleted: () => {
      setCurrentItem(null);
      setDialogType(null);
    },
  });

  const publishItem = async (item: any) => {
    try {
      await publishForm({
        variables: { id: item.id },
      });
      setNotification('Form published successfully');
    } catch (error) {
      setErrorMessage(error);
    }
  };

  const InactiveItem = async (item: any) => {
    try {
      await deactivateForm({
        variables: { id: item.id },
      });
      setNotification('Form deactivated successfully');
    } catch (error) {
      setErrorMessage(error);
    }
  };
  const columnNames = [
    { name: 'name', label: 'Form Name' },
    { name: 'status', label: 'Status' },
    { name: 'label', label: 'Category' },
    { name: 'actions', label: 'Actions' },
  ];
  const CategoryTags = ({ categories }: { categories: string[] }) => {
    if (!categories?.length) return null;

    const displayedCategories = categories.slice(0, 2);
    const hiddenCategories = categories.slice(2);

    return (
      <div className={styles.LabelWrapper}>
        <div className={styles.LabelButton}>
          {displayedCategories.map((cat, index) => (
            <span key={index} className={styles.CategoryTag}>
              {cat}
            </span>
          ))}

          {categories.length > 2 && (
            <div className={styles.MoreWrapper}>
              <span className={styles.CategoryMore}>+{categories.length - 2} more</span>
              <div className={styles.MoreList}>
                {hiddenCategories.map((cat, index) => (
                  <div key={index} className={styles.MoreListItem}>
                    {cat}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getColumns = ({ name, categories, status }: any) => ({
    name: <div className={styles.NameText}>{name}</div>,
    status:
      status === 'PUBLISHED' ? (
        <div className={styles.PublishedBadge}>Published</div>
      ) : status === 'DRAFT' ? (
        <div className={styles.NotPublishedBadge}>Draft</div>
      ) : (
        <div className={styles.InactiveBadge}>Inactive</div>
      ),
    label: <CategoryTags categories={categories} />,
  });

  const filterList = [
    { label: 'All', value: 'all' },
    { label: 'Published', value: 'published' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Draft', value: 'draft' },
  ];

  const additionalAction = (item: any) => {
    const actions = [];

    if (item.status === 'DRAFT') {
      actions.push({
        label: 'Publish',
        icon: <PublishIcon className={styles.IconSize} data-testid="publish-icon" />,
        parameter: 'id',
        dialog: () => {
          setCurrentItem(item);
          setDialogType('publish');
        },
      });
    }

    if (item.status === 'DRAFT' || item.status === 'PUBLISHED') {
      actions.push({
        label: 'Deactivate',
        icon: <DeactivateIcon className={styles.IconSize} data-testid="deactivate-icon" />,
        parameter: 'id',
        dialog: () => {
          setCurrentItem(item);
          setDialogType('inactive');
        },
      });
    }

    return actions;
  };
  const filters = useMemo(() => {
    let filters: any = {};

    if (filter === 'published') {
      filters = { status: 'PUBLISHED' };
    } else if (filter === 'draft') {
      filters = { status: 'DRAFT' };
    } else if (filter === 'inactive') {
      filters = { status: 'INACTIVE' };
    }

    return filters;
  }, [filter]);

  const activeFilter = (
    <>
      <FormControl>
        <Select
          aria-label="template-type"
          name="template-type"
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
    </>
  );

  let dialog = null;
  if (currentItem && dialogType) {
    const handleOk = () => {
      if (dialogType === 'publish') {
        publishItem(currentItem);
      } else if (dialogType === 'inactive') {
        InactiveItem(currentItem);
      }
    };

    dialog = (
      <DialogBox
        title={dialogType === 'publish' ? 'Do you want to publish this form?' : 'Do you want to deactivate this form?'}
        handleOk={handleOk}
        handleCancel={() => {
          setCurrentItem(null);
          setDialogType(null);
        }}
        alignButtons="center"
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
        helpData={whatsappFormsInfo}
        title="WhatsApp Forms"
        listItem="listWhatsappForms"
        listItemName="form"
        pageLink="whatsapp-forms"
        columnNames={columnNames}
        columns={getColumns}
        columnStyles={columnStyles}
        {...queries}
        filters={filters}
        filterList={activeFilter}
        button={{ show: true, label: 'Create New Form', action: () => navigate('/whatsapp-forms/add') }}
        searchParameter={['name']}
        restrictedAction={(item: any) => ({
          edit: item.status !== 'PUBLISHED',
          delete: true,
        })}
        additionalAction={additionalAction}
      />
      {dialog}
    </>
  );
};

export default WhatsAppFormList;
