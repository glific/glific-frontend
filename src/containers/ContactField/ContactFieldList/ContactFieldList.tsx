import React from 'react';
import { useTranslation } from 'react-i18next';
// import { Dialog, DialogContent } from '@material-ui/core';

import styles from './ContactFieldList.module.css';
import { List } from '../../List/List';
import { setVariables } from '../../../common/constants';
import {
  COUNT_CONTACT_FIELDS,
  GET_ALL_CONTACT_FIELDS,
} from '../../../graphql/queries/ContactFields';
import { DELETE_CONTACT_FIELDS } from '../../../graphql/mutations/ContactFields';
import { ReactComponent as ConsultingIcon } from '../../../assets/images/icons/icon-consulting.svg';

interface ContactFieldListProps {
  match: any;
  openDialog?: boolean;
}

const ContactFieldList: React.SFC<ContactFieldListProps> = ({ match, openDialog }: any) => {
  const { t } = useTranslation();
  console.log(match, openDialog);
  const queries = {
    countQuery: COUNT_CONTACT_FIELDS,
    filterItemsQuery: GET_ALL_CONTACT_FIELDS,
    deleteItemQuery: DELETE_CONTACT_FIELDS,
  };

  const columnNames = ['VARIABLE NAME', 'INPUT NAME', 'VALUE TYPE'];

  const getName = (label: string) => {
    const text = label.split(' ').join('_').toLowerCase();
    return (
      <div className={styles.LabelContainer}>
        <p className={styles.LabelText}>@contact.fields.{text}</p>
      </div>
    );
  };

  const getOtherColumn = (label: any) => (
    <div>
      <p className={styles.StatusText}>{label}</p>
    </div>
  );

  const getColumns = ({ name, valueType }: any) => ({
    variableName: getName(name),
    name: getOtherColumn(name),
    valueType: getOtherColumn(valueType),
  });

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles: [styles.Label, styles.Status, styles.Status, styles.Actions],
  };

  const listIcon = <ConsultingIcon className={styles.ConsultingHoursIcon} />;
  const dialogMessage = 'This action cannot be undone.';
  const dialogTitle = 'Are you sure you want to delete this contact field record?';

  return (
    <>
      <List
        title={t('Contact Fields')}
        listItem="contactsFields"
        listItemName="contactField"
        pageLink="contact-fields"
        listIcon={listIcon}
        refetchQueries={{
          query: GET_ALL_CONTACT_FIELDS,
          variables: setVariables(),
        }}
        searchParameter="name"
        dialogMessage={dialogMessage}
        dialogTitle={dialogTitle}
        {...queries}
        {...columnAttributes}
      />
      {/* <Dialog
        open={!!openDialog}
        classes={{
          paper: styles.Dialogbox,
        }}
      >
        <DialogContent classes={{ root: styles.DialogContent }}>
          <Consulting match={match} />
        </DialogContent>
      </Dialog> */}
    </>
  );
};

export default ContactFieldList;
