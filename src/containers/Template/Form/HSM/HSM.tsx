import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';

import TemplateIcon from 'assets/images/icons/Template/UnselectedDark.svg?react';
import { GET_HSM_CATEGORIES, GET_SHORTCODES } from 'graphql/queries/Template';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Input } from 'components/UI/Form/Input/Input';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { Simulator } from 'components/simulator/Simulator';
import Template from '../Template';
import styles from './HSM.module.css';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { Typography } from '@mui/material';

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

  const [exisitingShortCode, setExistingShortcode] = useState('');
  const [newShortcode, setNewShortcode] = useState('');
  const [category, setCategory] = useState<any>(undefined);
  const [languageVariant, setLanguageVariant] = useState<boolean>(false);

  const { t } = useTranslation();
  const params = useParams();
  const location: any = useLocation();

  const { data: categoryList, loading } = useQuery(GET_HSM_CATEGORIES);
  const { data: shortCodes } = useQuery(GET_SHORTCODES);

  if (loading) {
    return <Loading />;
  }

  const categoryOpn: any = [];
  if (categoryList) {
    categoryList.whatsappHsmCategories.forEach((categories: any, index: number) => {
      categoryOpn.push({ label: categories, id: index });
    });
  }

  const shortCodeOptions: any = [];
  if (shortCodes) {
    shortCodes.sessionTemplates.forEach((value: any, index: number) => {
      shortCodeOptions.push({ label: value?.shortcode, id: index });
    });
  }

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
    console.log(1);

    setSampleMessages((val) => ({ ...val, body: text, media }));
  };

  const getAttachmentUrl = (type: any, media: any) => {
    const mediaBody = { ...media };
    const mediaObj: any = sampleMessages.media;
    mediaBody.caption = mediaObj.caption;
    console.log(1);
    setSampleMessages((val) => ({ ...val, type, media: mediaBody }));
  };
  console.log(sampleMessages);

  const addButtonsToSampleMessage = (buttonTemplate: string) => {
    const message: any = { ...sampleMessages };
    message.body = buttonTemplate;
    console.log(3);
    setSampleMessages(message);
  };

  const isCopyState = location.state === 'copy';
  let disabled = false;
  if (params.id && !isCopyState) {
    disabled = true;
  }

  const formFields = [
    {
      component: Checkbox,
      name: 'languageVariant',
      title: (
        <Typography variant="h6" className={styles.Checkbox}>
          Translate existing HSM?
        </Typography>
      ),
      handleChange: (value: any) => setLanguageVariant(value),
    },
    {
      component: Input,
      name: 'newShortCode',
      placeholder: `${t('Element name')}*`,
      label: `${t('Element name')}*`,
      disabled,
      skip: languageVariant ? true : false,
      onChange: (value: any) => {
        setNewShortcode(value);
      },
    },
    {
      component: AutoComplete,
      name: 'existingShortCode',
      options: shortCodeOptions,
      optionLabel: 'label',
      multiple: false,
      label: `${t('Element name')}*`,
      placeholder: `${t('Element name')}*`,
      disabled,
      onChange: (event: any) => {
        setExistingShortcode(event);
      },
      skip: !languageVariant ? true : false,
    },

    {
      component: AutoComplete,
      name: 'category',
      options: categoryOpn,
      optionLabel: 'label',
      multiple: false,
      label: `${t('Category')}*`,
      placeholder: `${t('Category')}*`,
      disabled,
      helperText: t('Select the most relevant category'),
      onChange: (event: any) => {
        setCategory(event);
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
        getUrlAttachmentAndType={getAttachmentUrl}
        setCategory={setCategory}
        category={category}
        onExampleChange={addButtonsToSampleMessage}
        languageVariant={languageVariant}
        getSimulatorMessage={getSimulatorMessage}
        newShortCode={newShortcode}
        existingShortCode={exisitingShortCode}
      />
      <Simulator isPreviewMessage message={sampleMessages} simulatorIcon={false} />
    </div>
  );
};

export default HSM;
