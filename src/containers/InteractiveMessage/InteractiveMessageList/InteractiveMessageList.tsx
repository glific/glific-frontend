import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './InteractiveMessageList.module.css';
import { ReactComponent as InteractiveMessageIcon } from '../../../assets/images/icons/InteractiveMessage/Dark.svg';

import { List } from '../../List/List';
import {
  FILTER_INTERACTIVE_MESSAGES,
  GET_INTERACTIVE_MESSAGES_COUNT,
} from '../../../graphql/queries/InteractiveMessage';
import { DELETE_INTERACTIVE } from '../../../graphql/mutations/InteractiveMessage';
import { getInteractiveMessageBody } from '../../../common/utils';

export interface InteractiveMessageListProps {}

const getLabel = (text: string) => <p className={styles.LabelText}>{text}</p>;

const getType = (text: string) => {
  let type = '';
  if (text === 'QUICK_REPLY') {
    type = 'Quick Reply';
  } else if (text === 'LIST') {
    type = 'List';
  }
  return <p className={styles.TableText}>{type}</p>;
};

const getBody = (text: string) => {
  const message = getInteractiveMessageBody(JSON.parse(text));
  return <div className={styles.TableText}>{message}</div>;
};

const columnStyles = [styles.Label, styles.Message, styles.Type, styles.Actions];
const interactiveMsgIcon = <InteractiveMessageIcon className={styles.FlowIcon} />;

const queries = {
  countQuery: GET_INTERACTIVE_MESSAGES_COUNT,
  filterItemsQuery: FILTER_INTERACTIVE_MESSAGES,
  deleteItemQuery: DELETE_INTERACTIVE,
};

export const InteractiveMessageList: React.SFC<InteractiveMessageListProps> = () => {
  const { t } = useTranslation();

  const getColumns = ({ label, interactiveContent, type }: any) => ({
    label: getLabel(label),
    message: getBody(interactiveContent),
    type: getType(type),
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
        listItem="interactiveTemplates"
        listItemName="interactive"
        pageLink="interactive-message"
        listIcon={interactiveMsgIcon}
        dialogMessage={dialogMessage}
        noItemText="interactive messages"
        {...queries}
        removeSortBy={['TYPE', 'MESSAGE']}
        {...columnAttributes}
        button={{ show: true, label: t('+ ADD NEW') }}
      />
    </>
  );
};

export default InteractiveMessageList;
