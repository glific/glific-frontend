import React from 'react';
import { List } from '../../List/List';
import { GET_TEMPLATES_COUNT, FILTER_TEMPLATES } from '../../../graphql/queries/Template';
import { DELETE_TEMPLATE } from '../../../graphql/mutations/Template';
import styles from './Template.module.css';
import { WhatsAppToJsx } from '../../../common/RichEditor';

const columnNames = ['LABEL', 'BODY', 'ACTIONS'];
const columnStyles = [styles.Label, styles.Body, styles.Actions];

const getColumns = ({ label, body }: any) => ({
  label: getLabel(label),
  body: getBody(body),
});

const getLabel = (label: string) => <div className={styles.LabelText}>{label}</div>;

const getBody = (text: string) => <p className={styles.TableText}>{WhatsAppToJsx(text)}</p>;

const queries = {
  countQuery: GET_TEMPLATES_COUNT,
  filterItemsQuery: FILTER_TEMPLATES,
  deleteItemQuery: DELETE_TEMPLATE,
};

const columnAttributes = {
  columnNames: columnNames,
  columns: getColumns,
  columnStyles: columnStyles,
};

const dialogMessage = 'It will stop showing when you draft a customized message';

export interface TemplateProps {
  title: string;
  listItem: string;
  listItemName: string;
  pageLink: string;
  listIcon: any;
  filters: any;
}

export const Template: React.SFC<TemplateProps> = (props) => {
  return (
    <List
      title={props.title}
      listItem={props.listItem}
      listItemName={props.listItemName}
      pageLink={props.pageLink}
      listIcon={props.listIcon}
      dialogMessage={dialogMessage}
      filters={props.filters}
      {...columnAttributes}
      {...queries}
    />
  );
};

export default Template;
