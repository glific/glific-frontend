import React, { useState } from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from '@material-ui/core';
import { ReactComponent as EditIcon } from 'assets/images/icons/Edit.svg';
import { List } from 'containers/List/List';
import { GET_CONSULTING_HOURS, GET_CONSULTING_HOURS_COUNT } from 'graphql/queries/Consulting';
import { ReactComponent as ConsultingIcon } from 'assets/images/icons/icon-consulting.svg';
import { Consulting } from '../Consulting';
import styles from './ConsultingList.module.css';

interface ConsultingListProps {}

const ConsultingList: React.SFC<ConsultingListProps> = () => {
  const { t } = useTranslation();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedConsulting, setSelectedConsulting] = useState('');

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
          <Consulting
            match={{ params: { id: selectedConsulting } }}
            setOpenDialog={setOpenDialog}
          />
        </DialogContent>
      </Dialog>
    );
  }

  const queries = {
    countQuery: GET_CONSULTING_HOURS_COUNT,
    filterItemsQuery: GET_CONSULTING_HOURS,
    deleteItemQuery: null,
  };

  const columnNames = ['NAME', 'DATE', 'MINUTES', 'TYPE', 'TEAM', 'ACTIONS'];

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

  const additionalActions = [
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
        defaultSortBy="DATE"
        listOrder="desc"
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
        restrictedAction={restrictedAction}
        searchParameter={['organizationName']}
        dialogMessage={dialogMessage}
        dialogTitle={dialogTitle}
        noItemText="consulting record"
        {...queries}
        {...columnAttributes}
      />
    </>
  );
};

export default ConsultingList;
