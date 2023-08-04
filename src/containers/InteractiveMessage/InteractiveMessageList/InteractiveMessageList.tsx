import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as InteractiveMessageIcon } from 'assets/images/icons/InteractiveMessage/Dark.svg';
import { ReactComponent as DownArrow } from 'assets/images/icons/LanguageTranslation.svg';
import { ReactComponent as DuplicateIcon } from 'assets/images/icons/Flow/Copy.svg';
import { List } from 'containers/List/List';
import {
  FILTER_INTERACTIVE_MESSAGES,
  GET_INTERACTIVE_MESSAGES_COUNT,
} from 'graphql/queries/InteractiveMessage';
import { DELETE_INTERACTIVE } from 'graphql/mutations/InteractiveMessage';
import { getInteractiveMessageBody } from 'common/utils';
import { QUICK_REPLY } from 'common/constants';
import { useNavigate } from 'react-router-dom';
import styles from './InteractiveMessageList.module.css';
import { useQuery } from '@apollo/client';
import { GET_TAGS } from 'graphql/queries/Tags';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';

const getLabel = (text: string) => (
  <p data-testid="label" className={styles.LabelText}>
    {text}
  </p>
);

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

const getTranslations = (type: string, language: any, data: string) => {
  const dataObj: any = JSON.parse(data);
  if (Object.prototype.hasOwnProperty.call(dataObj, language.id)) {
    delete dataObj[language.id];
  }

  const result = Object.keys(dataObj).reduce((acc: any, langId: string) => {
    const { content, body } = dataObj[langId];
    if (type === QUICK_REPLY) {
      acc[langId] = { body: content?.text || '' };
    } else {
      acc[langId] = { body };
    }
    return acc;
  }, {});

  return JSON.stringify(result);
};

const columnStyles = [styles.Label, styles.Message, styles.Type, styles.Actions];
const interactiveMsgIcon = <InteractiveMessageIcon className={styles.FlowIcon} />;

const queries = {
  countQuery: GET_INTERACTIVE_MESSAGES_COUNT,
  filterItemsQuery: FILTER_INTERACTIVE_MESSAGES,
  deleteItemQuery: DELETE_INTERACTIVE,
};

export const InteractiveMessageList = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [selectedtag, setSelectedTag] = useState<any>(null);
  const navigate = useNavigate();

  const getColumns = ({ id, label, interactiveContent, type, language, translations }: any) => ({
    id,
    label: getLabel(label),
    message: getBody(interactiveContent),
    type: getType(type),
    translations: getTranslations(type, language, translations),
  });

  const columnNames = [
    { name: 'label', label: 'Title' },
    { label: t('Message') },
    { label: t('Type') },
    { label: t('Actions') },
  ];

  const dialogMessage = t("You won't be able to use this interactive message.");

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  const setDialog = (id: string) => {
    if (selectedId !== id) {
      setSelectedId(id);
      setOpen(true);
    } else {
      setOpen(!open);
    }
  };

  const handleCopyInteractive = (id: string) => {
    navigate(`/interactive-message/${id}/edit`, { state: 'copy' });
  };

  const additionalAction = () => [
    {
      label: t('Show all languages'),
      icon: <DownArrow />,
      parameter: 'id',
      dialog: setDialog,
    },
    {
      label: t('Make a copy'),
      icon: <DuplicateIcon />,
      parameter: 'id',
      dialog: handleCopyInteractive,
    },
  ];

  const { data: tag } = useQuery(GET_TAGS, {
    variables: {},
    fetchPolicy: 'network-only',
  });

  // OnChange handler for the dropdown
  const handleDropdownChange = (event: any) => {
    setSelectedTag(event.target.value);
  };

  const tagFilter = (
    <AutoComplete
      isFilterType
      placeholder="Select label"
      options={tag ? tag.tags : []}
      optionLabel="label"
      disabled={false}
      hasCreateOption={false}
      multiple={false}
      onChange={(value: any) => {
        setSelectedTag(value);
      }}
      form={{ setFieldValue: handleDropdownChange }}
      field={{
        value: selectedtag,
        onChange: handleDropdownChange,
      }}
    />
  );

  const helpData = {
    heading:
      'You can configure the interactive msg by clicking on the configure button and are as follows:',
    body: (
      <ul>
        <li>Save as Draft</li>
        <li>Publish Preview</li>
        <li>Revision history</li>
        <li>Reset interactive msg counts</li>
      </ul>
    ),
    link: 'https://glific.org/',
  };

  return (
    <List
      helpData={helpData}
      title={t('Interactive msg')}
      listItem="interactiveTemplates"
      listItemName="interactive"
      pageLink="interactive-message"
      listIcon={interactiveMsgIcon}
      dialogMessage={dialogMessage}
      noItemText="interactive message"
      searchParameter={['term']}
      {...queries}
      {...columnAttributes}
      button={{ show: true, label: t('Add New'), symbol: '+' }}
      additionalAction={additionalAction}
      collapseOpen={open}
      collapseRow={selectedId}
      filters={selectedtag && selectedtag.id && { tagIds: [parseInt(selectedtag.id)] }}
      filterDropdowm={tagFilter}
    />
  );
};

export default InteractiveMessageList;
