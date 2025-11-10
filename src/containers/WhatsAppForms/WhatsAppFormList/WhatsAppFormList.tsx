import { whatsappFormsInfo } from 'common/HelpData';
import { useNavigate } from 'react-router';
import { List } from 'containers/List/List';
import { LIST_WHATSAPP_FORMS, GET_WHATSAPP_FORM } from 'graphql/queries/WhatsAppForm';
import { DELETE_FORM } from 'graphql/mutations/WhatsAppForm';
import { useState, useMemo } from 'react';
import styles from './WhatsAppFormList.module.css';

const columnStyles = [styles.Name, styles.status, styles.Label, styles.Actions];

const queries = {
  filterItemsQuery: LIST_WHATSAPP_FORMS,
  deleteItemQuery: DELETE_FORM,
  getItemQuery: GET_WHATSAPP_FORM,
};

export const WhatsAppFormList = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('PUBLISHED');

  const columnNames = [
    { name: 'name', label: 'Form Name' },
    { name: 'status', label: 'Status' },
    { name: 'label', label: 'Category' },
    { name: 'actions', label: 'Actions' },
  ];

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

  const filters = useMemo(() => ({ status: statusFilter }), [statusFilter]);

  const filterList = (
    <select className={styles.SearchBar} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
      <option value="PUBLISHED">Published</option>
      <option value="DRAFT">Draft</option>
      <option value="INACTIVE">Inactive</option>
    </select>
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
      filterList={filterList}
      button={{ show: true, label: 'Create New Form', action: () => navigate('/whatsapp-forms/add') }}
      searchParameter={['name']}
    />
  );
};

export default WhatsAppFormList;
