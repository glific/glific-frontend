import { speedSendInfo } from 'common/HelpData';
import SpeedSendIcon from 'assets/images/icons/SpeedSend/Dark.svg?react';
import DuplicateIcon from 'assets/images/icons/Duplicate.svg?react';
import DownArrow from 'assets/images/icons/DownArrow.svg?react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import styles from './SpeedSendList.module.css';
import { FILTER_SESSION_TEMPLATES, GET_TEMPLATES_COUNT } from 'graphql/queries/Template';
import { DELETE_TEMPLATE } from 'graphql/mutations/Template';
import { WhatsAppToJsx } from 'common/RichEditor';
import dayjs from 'dayjs';
import { STANDARD_DATE_TIME_FORMAT } from 'common/constants';
import { List } from 'containers/List/List';

const speedSendIcon = <SpeedSendIcon className={styles.SpeedSendIcon} />;

const getLabel = (label: string) => (
  <div className={styles.LabelContainer}>
    <div className={styles.LabelText}>{label}</div>
  </div>
);
const getBody = (text: string) => <p className={styles.TableText}>{WhatsAppToJsx(text)}</p>;
const getUpdatedAt = (date: string) => (
  <div className={styles.LastModified}>{dayjs(date).format(STANDARD_DATE_TIME_FORMAT)}</div>
);

const getTranslations = (language: any, data: string) => {
  const dataObj = JSON.parse(data);
  if (Object.prototype.hasOwnProperty.call(dataObj, language.id)) {
    delete dataObj[language.id];
  }
  return JSON.stringify(dataObj);
};

export const SpeedSendList = () => {
  const [open, setOpen] = useState(false);
  const [Id, setId] = useState('');
  const [selectedTag, setSelectedTag] = useState<any>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const queries = {
    countQuery: GET_TEMPLATES_COUNT,
    filterItemsQuery: FILTER_SESSION_TEMPLATES,
    deleteItemQuery: DELETE_TEMPLATE,
  };

  const columnNames: any = [
    { name: 'label', label: t('Title') },
    { name: 'body', label: t('Body') },
    { name: 'updated_at', label: t('Last modified') },
    { label: t('Actions') },
  ];

  let columnStyles: any = [styles.Name, styles.Body, styles.LastModified, styles.Actions];

  const getColumns = ({ id, language, label, body, updatedAt, translations }: any) => {
    const columns: any = {
      id,
      label: getLabel(label),
      body: getBody(body),
      updatedAt: getUpdatedAt(updatedAt),
      translations: getTranslations(language, translations),
    };

    return columns;
  };

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  const setDialog = (id: string) => {
    if (Id !== id) {
      setId(id);
      setOpen(true);
    } else {
      setOpen(!open);
    }
  };

  const setCopyDialog = (id: any) => {
    navigate(`/speed-send/${id}/edit`, { state: 'copy' });
  };

  let additionalAction: any = () => [
    {
      label: t('Show all languages'),
      icon: <DownArrow data-testid="down-arrow" />,
      parameter: 'id',
      dialog: setDialog,
    },
    {
      label: t('Copy'),
      icon: <DuplicateIcon data-testid="copyTemplate" />,
      parameter: 'id',
      dialog: setCopyDialog,
      insideMore: true,
    },
  ];

  const button = { show: true, label: t('Create') };
  const dialogMessage = t('It will stop showing when you draft a customized message');
  let appliedFilters = { isHsm: false };

  appliedFilters = {
    ...appliedFilters,
    ...(selectedTag?.id && { tagIds: [parseInt(selectedTag?.id)] }),
  };

  return (
    <>
      {/* {dialogBox} */}
      <List
        helpData={speedSendInfo}
        title="Speed sends"
        listItem="sessionTemplates"
        listItemName="speed send"
        pageLink="speed-send"
        listIcon={speedSendIcon}
        additionalAction={additionalAction}
        dialogMessage={dialogMessage}
        filters={appliedFilters}
        button={button}
        {...columnAttributes}
        {...queries}
        collapseOpen={open}
        collapseRow={Id}
      />
    </>
  );
};

export default SpeedSendList;
