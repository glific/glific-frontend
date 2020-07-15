import React from 'react';

import { GET_TEMPLATES_COUNT, FILTER_TEMPLATES } from '../../../graphql/queries/Template';
import { DELETE_TEMPLATE } from '../../../graphql/mutations/Template';
import styles from './MessageTemplateList.module.css';
import { ReactComponent as SpeedSendIcon } from '../../../assets/images/icons/SpeedSend/Selected.svg';
import { List } from '../../List/List';

export interface TemplateListProps {}

export const MessageTemplateList: React.SFC<TemplateListProps> = (props) => {
  const columnNames = ['LABEL', 'BODY', 'ACTIONS'];
  const speedSendIcon = <SpeedSendIcon className={styles.SpeedSendIcon} />;
  const dialogMessage = ' It will stop showing when you are drafting a customized message';
  const columnStyles = [styles.Label, styles.Body, styles.Actions];

  const getColumns = ({ label, body }: any) => {
    return {
      label: getLabel(label),
      body: getBody(body),
    };
  };
  const getLabel = (label: string) => {
    return <div className={styles.LabelText}>{label}</div>;
  };

  const getBody = (text: string) => {
    return <p className={styles.TableText}>{text}</p>;
  };

  return (
    <List
      title="Speed sends"
      columnNames={columnNames}
      countQuery={GET_TEMPLATES_COUNT}
      listItem="sessionTemplates"
      listItemName="speed send"
      pageLink="speed-send"
      listIcon={speedSendIcon}
      dialogMessage={dialogMessage}
      filterItemsQuery={FILTER_TEMPLATES}
      deleteItemQuery={DELETE_TEMPLATE}
      columns={getColumns}
      columnStyles={columnStyles}
    />
  );
};
