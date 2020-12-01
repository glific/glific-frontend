import React from 'react';

import styles from './Template.module.css';
import { List } from '../../List/List';
import { WhatsAppToJsx } from '../../../common/RichEditor';
import { setVariables } from '../../../common/constants';
import { GET_TEMPLATES_COUNT, FILTER_TEMPLATES } from '../../../graphql/queries/Template';
import { DELETE_TEMPLATE } from '../../../graphql/mutations/Template';

const columnNames = ['LABEL', 'BODY', 'LAST MODIFIED', 'ACTIONS'];
const columnStyles = [styles.Label, styles.Body, styles.LastModified, styles.Actions];

const getLabel = (label: string) => <div className={styles.LabelText}>{label}</div>;

const getBody = (text: string) => <p className={styles.TableText}>{WhatsAppToJsx(text)}</p>;

const getUpdatedAt = (date: string) => <div className={styles.LastModified}>{date}</div>;

const getColumns = ({ label, body, updatedAt }: any) => ({
  label: getLabel(label),
  body: getBody(body),
  updatedAt: getUpdatedAt(updatedAt),
});

const queries = {
  countQuery: GET_TEMPLATES_COUNT,
  filterItemsQuery: FILTER_TEMPLATES,
  deleteItemQuery: DELETE_TEMPLATE,
};

const columnAttributes = {
  columnNames,
  columns: getColumns,
  columnStyles,
};

const dialogMessage = 'It will stop showing when you draft a customized message';

export interface TemplateProps {
  title: string;
  listItem: string;
  listItemName: string;
  pageLink: string;
  listIcon: any;
  filters: any;
  buttonLabel: string;
}

export const Template: React.SFC<TemplateProps> = (props) => {
  const { title, listItem, listItemName, pageLink, listIcon, filters, buttonLabel } = props;

  return (
    <List
      title={title}
      listItem={listItem}
      listItemName={listItemName}
      pageLink={pageLink}
      listIcon={listIcon}
      dialogMessage={dialogMessage}
      filters={filters}
      refetchQueries={{
        query: FILTER_TEMPLATES,
        variables: setVariables({ term: '' }),
      }}
      button={{ show: true, label: buttonLabel }}
      {...columnAttributes}
      {...queries}
    />
  );
};

export default Template;
