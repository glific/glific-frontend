import React from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from '@material-ui/core';

import styles from './ConsultingList.module.css';
import { Consulting } from '../Consulting';
import { List } from '../../List/List';
import { setVariables } from '../../../common/constants';
import {
  GET_CONSULTING_HOURS,
  GET_CONSULTING_HOURS_COUNT,
} from '../../../graphql/queries/Consulting';
import { DELETE_CONSULTING_HOURS } from '../../../graphql/mutations/Consulting';
import { ReactComponent as ConsultingIcon } from '../../../assets/images/icons/icon-consulting.svg';

interface ConsultingListProps {
  match: any;
  openDialog?: boolean;
}

const ConsultingList: React.SFC<ConsultingListProps> = ({ match, openDialog }: any) => {
  const { t } = useTranslation();

  const queries = {
    countQuery: GET_CONSULTING_HOURS_COUNT,
    filterItemsQuery: GET_CONSULTING_HOURS,
    deleteItemQuery: DELETE_CONSULTING_HOURS,
  };

  const columnNames = ['NAME', 'DATE', 'MINUTES', 'TYPE', 'ACTIONS'];

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

  const getColumns = ({ organizationName, duration, when, isBillable }: any) => ({
    organizationName: getName(organizationName),
    when: getOtherColumn(when, true),
    duration: getOtherColumn(duration),
    isBillable: getBillableColumn(isBillable),
  });

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles: [styles.Label, styles.Status, styles.Status, styles.Status, styles.Actions],
  };

  const listIcon = <ConsultingIcon className={styles.ConsultingHoursIcon} />;
  const dialogMessage = 'This action cannot be undone.';
  const dialogTitle = 'Are you sure you want to delete this consulting record?';

  const addNewButton = {
    show: true,
    label: 'Add Hours',
  };

  return (
    <>
      <List
        title={t('Consulting')}
        listItem="consultingHours"
        listItemName="consultingHour"
        pageLink="consulting-hours"
        listIcon={listIcon}
        refetchQueries={{
          query: GET_CONSULTING_HOURS,
          variables: setVariables(),
        }}
        searchParameter="organizationName"
        dialogMessage={dialogMessage}
        dialogTitle={dialogTitle}
        button={addNewButton}
        {...queries}
        {...columnAttributes}
      />
      <Dialog
        open={!!openDialog}
        classes={{
          paper: styles.Dialogbox,
        }}
      >
        <DialogContent classes={{ root: styles.DialogContent }}>
          <Consulting match={match} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConsultingList;
