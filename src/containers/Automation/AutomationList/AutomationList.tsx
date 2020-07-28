import React from 'react';
import styles from './AutomationList.module.css';
import { ReactComponent as AutomationIcon } from '../../../assets/images/icons/Automations/Selected.svg';
import { List } from '../../List/List';
import { FILTER_AUTOMATION, GET_AUTOMATION_COUNT } from '../../../graphql/queries/Automation';
import { DELETE_AUTOMATION } from '../../../graphql/mutations/Automation';

export interface AutomationListProps {}

const getColumns = ({ shortcode, name }: any) => ({
  shortcode: getShortcode(shortcode),
  name: getName(name),
});

const getShortcode = (label: string) => <p className={styles.LabelText}>{label}</p>;
const getName = (text: string) => <p className={styles.TableText}>{text}</p>;

const columnNames = ['SHORTCODE', 'NAME', 'ACTIONS'];
const dialogMessage = "You won't be able to use this automation.";
const columnStyles = [styles.Shortcode, styles.Name, styles.Actions];
const automationIcon = <AutomationIcon className={styles.AutomationIcon} />;

const queries = {
  countQuery: GET_AUTOMATION_COUNT,
  filterItemsQuery: FILTER_AUTOMATION,
  deleteItemQuery: DELETE_AUTOMATION,
};

const columnAttributes = {
  columnNames: columnNames,
  columns: getColumns,
  columnStyles: columnStyles,
};

const additionalAction = { parameter: 'uuid', link: '/automation/configure' };

export const AutomationList: React.SFC<AutomationListProps> = (props) => (
  <List
    title="Automations"
    listItem="flows"
    listItemName="automation"
    pageLink="automation"
    listIcon={automationIcon}
    dialogMessage={dialogMessage}
    {...queries}
    {...columnAttributes}
    searchParameter="name"
    additionalAction={additionalAction}
  />
);
