/* eslint-disable */
import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './InteractiveMessageList.module.css';
import { ReactComponent as InteractiveMessageIcon } from '../../../assets/images/icons/InteractiveMessage/Dark.svg';

import { List } from '../../List/List';
import { DELETE_FLOW } from '../../../graphql/mutations/Flow';

import {
  FILTER_INTERACTIVE_MESSAGES,
  GET_INTERACTIVE_MESSAGES_COUNT,
} from '../../../graphql/queries/InteractiveMessage';

export interface InteractiveMessageListProps {}

const getLabel = (text: string) => {
  return <p className={styles.TableText}>{text}</p>;
};

const getBody = (text: string) => {
  const message = JSON.parse(text);
  console.log(message);
  let messageText = '';
  if (message.type === 'list') {
    messageText = message.body;
  }

  return <div className={styles.TableText}>{messageText}</div>;
};

const columnStyles = [styles.Label, styles.Message, styles.Type, styles.Actions];
const interactiveMsgIcon = <InteractiveMessageIcon className={styles.FlowIcon} />;

const queries = {
  countQuery: GET_INTERACTIVE_MESSAGES_COUNT,
  filterItemsQuery: FILTER_INTERACTIVE_MESSAGES,
  deleteItemQuery: DELETE_FLOW,
};

export const InteractiveMessageList: React.SFC<InteractiveMessageListProps> = () => {
  const { t } = useTranslation();

  const getColumns = ({ label, interactiveContent, type }: any) => ({
    label: getLabel(label),
    message: getBody(interactiveContent),
    type: getLabel(type),
  });

  const columnNames = ['LABEL', 'MESSAGE', 'TYPE', 'ACTIONS'];
  const dialogMessage = t("You won't be able to use this interactive message.");

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  return (
    <>
      <List
        title={t('Interactive msg')}
        listItem="interactives"
        listItemName="interactive"
        pageLink="interactive-message"
        listIcon={interactiveMsgIcon}
        dialogMessage={dialogMessage}
        noItemText={'interactive messages'}
        {...queries}
        removeSortBy={['TYPE', 'MESSAGE']}
        {...columnAttributes}
        button={{ show: true, label: t('+ ADD NEW') }}
      />
    </>
  );
};

export default InteractiveMessageList;
