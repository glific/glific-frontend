import React from 'react';
import { ReactComponent as TemplateIcon } from '../../../assets/images/icons/Template/UnselectedDark.svg';
import styles from '../HSMPage/HSMPage.module.css';
import { List } from '../../../containers/List/List';
import { GET_HSM_TEMPLATES_COUNT, FILTER_HSM_TEMPLATES } from '../../../graphql/queries/Template';
import { DELETE_TEMPLATE } from '../../../graphql/mutations/Template';

export interface HSMPageProps {}

export const HSMPage: React.SFC<HSMPageProps> = () => {
  const columnNames = ['LABEL', 'BODY', 'ACTIONS'];
  const dialogMessage = 'It will stop showing when you are drafting a customized message';
  const columnStyles = [styles.Label, styles.Body, styles.Actions];
  const templateIcon = <TemplateIcon className={styles.TemplateIcon} />;

  const getColumns = ({ label, body }: any) => ({
    label: getLabel(label),
    body: getBody(body),
  });

  const getLabel = (label: string) => <div className={styles.LabelText}>{label}</div>;

  const getBody = (text: string) => <p className={styles.TableText}>{text}</p>;

  const queries = {
    countQuery: GET_HSM_TEMPLATES_COUNT,
    filterItemsQuery: FILTER_HSM_TEMPLATES,
    deleteItemQuery: DELETE_TEMPLATE,
  };

  const columnAttributes = {
    columnNames: columnNames,
    columns: getColumns,
    columnStyles: columnStyles,
  };

  return (
    <List
      title="HSM Messages"
      listItem="sessionTemplates"
      listItemName="speed send"
      pageLink="speed-send"
      listIcon={templateIcon}
      dialogMessage={dialogMessage}
      {...columnAttributes}
      {...queries}
    />
  );
};
