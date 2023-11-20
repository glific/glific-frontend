import { useState } from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from '@mui/material';
import EditIcon from 'assets/images/icons/Edit.svg?react';
import ConsultingIcon from 'assets/images/icons/icon-consulting.svg?react';
import { List } from 'containers/List/List';
import { Consulting } from '../Consulting';
import { ExportConsulting } from './ExportConsulting/ExportConsulting';
import { GET_CONSULTING_HOURS, GET_CONSULTING_HOURS_COUNT } from 'graphql/queries/Consulting';
import styles from './ConsultingList.module.css';

const ConsultingList = () => {
  const { t } = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedConsulting, setSelectedConsulting] = useState('');
  const [filters, setFilters] = useState({});

  let dialog;

  if (openDialog) {
    dialog = (
      <Dialog
        open
        classes={{
          paper: styles.Dialogbox,
        }}
      >
        <DialogContent classes={{ root: styles.DialogContent }}>
          <Consulting organizationId={selectedConsulting} setOpenDialog={setOpenDialog} />
        </DialogContent>
      </Dialog>
    );
  }

  const queries = {
    countQuery: GET_CONSULTING_HOURS_COUNT,
    filterItemsQuery: GET_CONSULTING_HOURS,
    deleteItemQuery: null,
  };

  const columnNames = [
    { name: 'organization_name', label: t('Name') },
    { name: 'when', label: t('Date'), sort: true, order: 'desc' },
    { name: 'duration', label: t('Minutes') },
    { name: 'is_billable', label: t('Type') },
    { label: t('Team') },
    { label: t('Actions') },
  ];

  const getName = (label: string) => (
    <div className={styles.LabelContainer}>
      <p className={styles.LabelText}>{label}</p>
    </div>
  );

  const getOtherColumn = (label: any, isDate: boolean = false) => {
    const text = isDate ? moment(label).format('DD MMM YYYY') : label;
    return (
      <div>
        <p className={styles.StatusText}>{text}</p>
      </div>
    );
  };

  const getBillableColumn = (isBillable: boolean) => {
    const text = isBillable ? t('Billable') : t('Non-Billable');
    return (
      <div>
        <p className={styles.StatusText}>{text}</p>
      </div>
    );
  };

  const getStaffColumn = (staff: any) => (
    <div>
      <p className={styles.StatusText}>{staff}</p>
    </div>
  );

  const getColumns = ({ organizationName, duration, when, isBillable, staff }: any) => ({
    organizationName: getName(organizationName),
    when: getOtherColumn(when, true),
    duration: getOtherColumn(duration),
    isBillable: getBillableColumn(isBillable),
    staff: getStaffColumn(staff),
  });

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles: [
      styles.Label,
      styles.Status,
      styles.Status,
      styles.Status,
      styles.Status,
      styles.Actions,
    ],
  };

  const editConsulting = (id: string) => {
    setSelectedConsulting(id);
    setOpenDialog(true);
  };

  const listIcon = <ConsultingIcon className={styles.ConsultingHoursIcon} />;
  const dialogMessage = t('This action cannot be undone.');
  const dialogTitle = t('Are you sure you want to delete this consulting record?');

  const restrictedAction = () => ({ delete: false, edit: false });

  const additionalActions = () => [
    {
      icon: <EditIcon />,
      parameter: 'id',
      label: t('Edit'),
      dialog: editConsulting,
    },
  ];

  return (
    <>
      {dialog}
      <List
        descriptionBox={<ExportConsulting setFilters={setFilters} />}
        title={t('Consulting')}
        listItem="consultingHours"
        listItemName="consultingHour"
        pageLink="consulting-hours"
        listIcon={listIcon}
        additionalAction={additionalActions}
        button={{
          show: true,
          label: t('Add Consulting Hours'),
          action: () => {
            setOpenDialog(true);
            setSelectedConsulting('');
          },
        }}
        filters={filters}
        restrictedAction={restrictedAction}
        searchParameter={['organizationName']}
        dialogMessage={dialogMessage}
        dialogTitle={dialogTitle}
        noItemText="consulting record"
        customStyles={styles.Body}
        {...queries}
        {...columnAttributes}
      />
    </>
  );
};

export default ConsultingList;
