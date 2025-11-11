import { whatsappFormsInfo } from 'common/HelpData';
import { useNavigate } from 'react-router';
import { List } from 'containers/List/List';
import { LIST_WHATSAPP_FORMS, GET_WHATSAPP_FORM } from 'graphql/queries/WhatsAppForm';
import { DELETE_FORM, PUBLISH_FORM } from 'graphql/mutations/WhatsAppForm';
import { useState, useMemo } from 'react';
import PublishIcon from 'assets/images/icons/PublishGood.svg?react';
import styles from './WhatsAppFormList.module.css';
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
  const navigate = useNavigate();
  const [filter, setFilter] = useState<any>('all');
  const [publishForm] = useMutation(PUBLISH_FORM);

  const columnNames = [
    { name: 'name', label: 'Form Name' },
    { name: 'status', label: 'Status' },
    { name: 'label', label: 'Category' },
    { name: 'actions', label: 'Actions' },
  ];
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
    label: categories?.length ? (
      <div className={styles.LabelButton}>
        {categories.map((cat: string, index: number) => (
          <span key={index} className={styles.CategoryTag}>
            {cat}
          </span>
        ))}
      </div>
    ) : (
      ''
    ),
  });

  const filterList = [
    { label: 'Published', value: 'published' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Draft', value: 'draft' },
    { label: 'All', value: 'all' },
  ];

  const additionalAction = (item: any) => {
    const actions = [];

    if (item.status === 'DRAFT') {
      actions.push({
        label: 'Publish',
        icon: <PublishIcon className={styles.IconSize} />,
        parameter: 'id',
        insideMore: false,
        dialog: () => publishItem(item),
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

  return (
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
  );
};

export default WhatsAppFormList;
