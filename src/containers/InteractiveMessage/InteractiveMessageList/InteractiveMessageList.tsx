import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InteractiveMessageIcon from 'assets/images/icons/InteractiveMessage/Dark.svg?react';
import DownArrow from 'assets/images/icons/DownArrow.svg?react';
import DuplicateIcon from 'assets/images/icons/Duplicate.svg?react';
import { List } from 'containers/List/List';
import { FILTER_INTERACTIVE_MESSAGES, GET_INTERACTIVE_MESSAGES_COUNT } from 'graphql/queries/InteractiveMessage';
import { DELETE_INTERACTIVE } from 'graphql/mutations/InteractiveMessage';
import { getInteractiveMessageBody } from 'common/utils';
import { BLOCKS, QUICK_REPLY } from 'common/constants';
import { ChannelBadges } from 'components/blocks/ChannelBadges';
import { deriveBody, getComponentLabel } from 'containers/InteractiveMessage/Blocks.helper';
import { useNavigate, useSearchParams } from 'react-router';
import styles from './InteractiveMessageList.module.css';
import { useQuery } from '@apollo/client';
import { GET_TAGS } from 'graphql/queries/Tags';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { interactiveMessageInfo } from 'common/HelpData';

const getLabel = (text: string) => (
  <p data-testid="label" className={styles.LabelText}>
    {text}
  </p>
);

const typeMappings: any = {
  LOCATION_REQUEST_MESSAGE: 'Location request',
  QUICK_REPLY: 'Reply buttons',
  LIST: 'List',
};

/**
 * §11 — a blocks template's type label comes from `interactive_content.component`
 * ("Carousel", "Image panel", "Form", "Custom Block"), never from the enum: all four Web
 * entries in the type selector share `BLOCKS`.
 */
const getType = (type: string, interactiveContent: string) => {
  let label = typeMappings[type];
  if (type === BLOCKS) {
    let component;
    try {
      component = JSON.parse(interactiveContent)?.component;
    } catch (error) {
      component = undefined;
    }
    label = getComponentLabel(component);
  }

  return (
    <div className={styles.TableText}>
      <p className={styles.TypeLabel}>{label ?? type}</p>
    </div>
  );
};

/** §11 — derived, read-only channel support. Pure presentation over the type. */
const getChannels = (type: string) => (
  <div className={styles.TableText}>
    <ChannelBadges templateType={type} compact />
  </div>
);

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
    } else if (type === BLOCKS) {
      // §9 — a Blocks envelope has no authored body; it is derived from its text nodes.
      acc[langId] = { body: deriveBody(dataObj[langId]) };
    } else {
      acc[langId] = { body };
    }
    return acc;
  }, {});

  return JSON.stringify(result);
};

const columnStyles = [styles.Label, styles.Message, styles.Type, styles.Channel, styles.Actions];
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
  const [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();

  const getColumns = ({ id, label, interactiveContent, type, language, translations }: any) => ({
    id,
    label: getLabel(label),
    message: getBody(interactiveContent),
    type: getType(type, interactiveContent),
    channel: getChannels(type),
    translations: getTranslations(type, language, translations),
  });

  const columnNames = [
    { name: 'label', label: 'Title' },
    { label: t('Message') },
    { label: t('Type') },
    { label: t('Channel') },
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
      icon: <DownArrow data-testid="down-arrow" />,
      parameter: 'id',
      dialog: setDialog,
    },
    {
      label: t('Copy'),
      icon: <DuplicateIcon data-testid="copy-interactive-message" />,
      parameter: 'id',
      dialog: handleCopyInteractive,
    },
  ];

  const { data: tags } = useQuery(GET_TAGS, {
    variables: {},
    fetchPolicy: 'network-only',
  });

  const navigateToCreate = () => {
    if (selectedtag?.label) {
      navigate('/interactive-message/add', { state: { tag: selectedtag } });
    } else {
      navigate('/interactive-message/add');
    }
  };

  useEffect(() => {
    const tagValue = searchParams.get('tag');

    if (tagValue && tags) {
      const tag = tags?.tags.find((tag: any) => tagValue === tag.label);
      setSelectedTag(tag);
    } else {
      setSelectedTag(null);
    }
  }, [searchParams, tags]);

  const tagFilter = (
    <AutoComplete
      isFilterType
      placeholder="Select tag"
      options={tags ? tags.tags : []}
      optionLabel="label"
      multiple={false}
      onChange={(value: any) => {
        if (value) {
          setSearchParams({
            tag: value.label,
          });
        } else {
          setSearchParams({
            tag: '',
          });
        }
      }}
      form={{ setFieldValue: () => {} }}
      field={{
        name: 'selectedtag',
        value: selectedtag,
      }}
    />
  );

  return (
    <List
      helpData={interactiveMessageInfo}
      title={t('Interactive messages')}
      listItem="interactiveTemplates"
      listItemName="interactive"
      pageLink="interactive-message"
      listIcon={interactiveMsgIcon}
      dialogMessage={dialogMessage}
      noItemText="interactive message"
      searchParameter={['term']}
      {...queries}
      {...columnAttributes}
      button={{ show: true, label: t('Create'), action: navigateToCreate }}
      additionalAction={additionalAction}
      collapseOpen={open}
      collapseRow={selectedId}
      filters={selectedtag && selectedtag.id && { tagIds: [parseInt(selectedtag.id)] }}
      filterList={tagFilter}
    />
  );
};

export default InteractiveMessageList;
