import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { EditorState } from 'draft-js';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Loading from 'components/UI/Layout/Loading/Loading';
import { ReactComponent as TemplateIcon } from 'assets/images/icons/Template/UnselectedDark.svg';
import { GET_HSM_CATEGORIES } from 'graphql/queries/Template';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Input } from 'components/UI/Form/Input/Input';
import { EmojiInput } from 'components/UI/Form/EmojiInput/EmojiInput';
import { Simulator } from 'components/simulator/Simulator';
import Template from '../Template';
import styles from './HSM.module.css';

const defaultAttribute = {
  isHsm: true,
};

const templateIcon = <TemplateIcon className={styles.TemplateIcon} />;

export const HSM = () => {
  const [sampleMessages, setSampleMessages] = useState({
    type: 'TEXT',
    location: null,
    media: {},
    body: '',
  });
  const [shortcode, setShortcode] = useState('');
  const [example, setExample] = useState(EditorState.createEmpty());
  const [category, setCategory] = useState<any>({ label: '', id: '' });
  const { t } = useTranslation();
  const params = useParams();

  const { data: categoryList, loading } = useQuery(GET_HSM_CATEGORIES);

  if (loading) {
    return <Loading />;
  }

  const categoryOpn: any = [];
  if (categoryList) {
    categoryList.whatsappHsmCategories.forEach((categories: any, index: number) => {
      categoryOpn.push({ label: categories, id: index });
    });
  }

  let sessionTemplates: any;
  const getSessionTemplates = (data: any) => {
    sessionTemplates = data;
  };

  const validateShortcode = (value: any) => {
    let error;
    let found = [];
    if (sessionTemplates && value) {
      // need to check exact shortcode
      found = sessionTemplates.sessionTemplates.filter((search: any) => search.shortcode === value);
      if (params.id && found.length > 0) {
        found = found.filter((search: any) => search.id !== params.id);
      }
    }
    if (found.length > 0) {
      error = t('Element name already exists.');
    }

    return error;
  };

  const removeFirstLineBreak = (text: any) =>
    text?.length === 1 ? text.slice(0, 1).replace(/(\r\n|\n|\r)/, '') : text;

  const getTemplate = (text: string) => {
    const { body } = sampleMessages;
    /**
     * Regular expression to check if message contains given pattern
     * If pattern is present search will return first index of given pattern
     * otherwise it will return -1
     */
    const exp = /(\|\s\[)|(\|\[)/;

    const areButtonsPresent = body.search(exp);
    if (areButtonsPresent > -1) {
      const buttons = body.substr(areButtonsPresent);
      return text + buttons;
    }
    return text;
  };

  const getSimulatorMessage = (messages: any) => {
    const message = removeFirstLineBreak(messages);
    const media: any = { ...sampleMessages.media };
    const text = getTemplate(message);
    media.caption = text;
    setSampleMessages((val) => ({ ...val, body: text, media }));
  };

  const getAttachmentUrl = (type: any, media: any) => {
    const mediaBody = { ...media };
    const mediaObj: any = sampleMessages.media;
    mediaBody.caption = mediaObj.caption;
    setSampleMessages((val) => ({ ...val, type, media: mediaBody }));
  };

  const addButtonsToSampleMessage = (buttonTemplate: string) => {
    const message: any = { ...sampleMessages };
    message.body = buttonTemplate;
    setSampleMessages(message);
  };

  let disabled = false;
  if (params.id) {
    disabled = true;
  }

  const formFields = [
    {
      component: EmojiInput,
      name: 'example',
      placeholder: `${t('Sample message')}*`,
      rows: 5,
      convertToWhatsApp: true,
      textArea: true,
      disabled,
      helperText:
        'Replace variables eg. {{1}} with actual values enclosed in [ ] eg. [12345] to show a complete message with meaningful word/statement/numbers/ special characters.',
      handleChange: getSimulatorMessage,
      getEditorValue: (value: any) => {
        setExample(value);
      },
    },
    {
      component: AutoComplete,
      name: 'category',
      options: categoryOpn,
      optionLabel: 'label',
      multiple: false,
      textFieldProps: {
        variant: 'outlined',
        label: `${t('Category')}*`,
      },
      disabled,
      helperText: t('Select the most relevant category'),
      onChange: (event: any) => {
        setCategory(event);
      },
    },
    {
      component: Input,
      name: 'shortcode',
      placeholder: `${t('Element name')}*`,
      validate: validateShortcode,
      disabled,
      inputProp: {
        onBlur: (event: any) => setShortcode(event.target.value),
      },
    },
  ];

  return (
    <div>
      <Template
        listItemName="HSM Template"
        redirectionLink="template"
        icon={templateIcon}
        defaultAttribute={defaultAttribute}
        formField={formFields}
        getSessionTemplatesCallBack={getSessionTemplates}
        getUrlAttachmentAndType={getAttachmentUrl}
        getShortcode={shortcode}
        getExample={example}
        setCategory={setCategory}
        category={category}
        onExampleChange={addButtonsToSampleMessage}
      />
      <Simulator
        setSimulatorId={0}
        showSimulator
        isPreviewMessage
        message={sampleMessages}
        simulatorIcon={false}
      />
    </div>
  );
};

export default HSM;
