import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, Button } from '@material-ui/core';
import { useMutation } from '@apollo/client';

import styles from './ContactFieldList.module.css';
import { List } from '../../List/List';
import { ContactField } from '../ContactField';
import { InlineInput } from '../../../components/UI/Form/InlineInput/InlineInput';
import { setVariables } from '../../../common/constants';
import {
  COUNT_CONTACT_FIELDS,
  GET_ALL_CONTACT_FIELDS,
} from '../../../graphql/queries/ContactFields';
import {
  DELETE_CONTACT_FIELDS,
  UPDATE_CONTACT_FIELDS,
} from '../../../graphql/mutations/ContactFields';
import { ReactComponent as ContactVariableIcon } from '../../../assets/images/icons/ContactVariable.svg';
import { ReactComponent as EditIcon } from '../../../assets/images/icons/GreenEdit.svg';

interface ContactFieldListProps {
  match: any;
  openDialog?: boolean;
}

interface EditItemShape {
  id: any;
  column: string;
}

const ContactFieldList: React.SFC<ContactFieldListProps> = ({ match, openDialog }: any) => {
  const { t } = useTranslation();
  const [itemToBeEdited, setItemToBeEdited] = useState<EditItemShape | any>(null);

  const [updateContactField] = useMutation(UPDATE_CONTACT_FIELDS, {
    update(cache, { data: updateContactsField }) {
      const existingList: Array<any> | any = cache.readQuery({
        query: GET_ALL_CONTACT_FIELDS,
        variables: setVariables(),
      });
      console.log({ existingList, updateContactsField });
      // const updatedList = existingList.data.contactsFields.map((contactField: any) => {
      //   if(contactField.id === updateContactsField.id){
      //     return updateContactsField
      //   }
      //   return contactField
      // })

      // cache.writeQuery({
      //   query: GET_ALL_CONTACT_FIELDS,
      //   data: {contactsFields: updatedList}
      // });
    },
  });

  const queries = {
    countQuery: COUNT_CONTACT_FIELDS,
    filterItemsQuery: GET_ALL_CONTACT_FIELDS,
    deleteItemQuery: DELETE_CONTACT_FIELDS,
  };

  const handleEditCallback = (row: any, updatedVal: string, column: string) => {
    const payload = { [column]: updatedVal };

    const variables = {
      id: row.id,
      input: payload,
    };

    updateContactField({ variables });
    // Cleanup
    setItemToBeEdited(null);
  };

  const columnNames = ['VARIABLE NAME', 'INPUT NAME', 'SHORTCODE'];

  const getName = (label: string) => (
    <div className={styles.LabelContainer}>
      <p className={styles.LabelText}>{label}</p>
    </div>
  );

  const getOtherColumn = (row: any, column: string) => {
    const { id } = row;
    const label: any = row[column];
    const showInline = itemToBeEdited?.id === id && itemToBeEdited?.column === column;
    const labelText = column === 'name' ? 'Input Name' : 'Shortcode';

    return (
      <div className={styles.OtherColumnContainer}>
        <p className={styles.OtherColumnText}>
          {label}
          {!false ? (
            <span>
              <Button onClick={() => setItemToBeEdited({ id, column })}>
                <EditIcon />
              </Button>
            </span>
          ) : null}
        </p>
        {showInline ? (
          <div className={styles.OtherColumnEditContainer}>
            <InlineInput
              key={itemToBeEdited}
              value={label}
              label={labelText}
              closeModal={() => setItemToBeEdited(null)}
              callback={(updatedColumnValue: string) =>
                handleEditCallback(row, updatedColumnValue, column)
              }
            />
          </div>
        ) : null}
      </div>
    );
  };

  const getColumns = (row: any) => ({
    variableName: getName(row.shortcode),
    name: getOtherColumn(row, 'name'),
    shortcode: getOtherColumn(row, 'shortcode'),
  });

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles: [styles.Label, styles.OtherColumn, styles.OtherColumn, styles.Actions],
  };

  const listIcon = (
    <ContactVariableIcon className={styles.ConsultingHoursIcon} color="primary.dark" />
  );
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
        editSupport={false}
        backLinkButton={{ text: t('Back to flows'), link: '/flow' }}
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
          <ContactField match={match} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContactFieldList;
