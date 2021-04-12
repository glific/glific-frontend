import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';

import styles from './HSM.module.css';
import { ReactComponent as TemplateIcon } from '../../../../assets/images/icons/Template/UnselectedDark.svg';
import Template from '../Template';
import { AutoComplete } from '../../../../components/UI/Form/AutoComplete/AutoComplete';
import { Input } from '../../../../components/UI/Form/Input/Input';
import { EmojiInput } from '../../../../components/UI/Form/EmojiInput/EmojiInput';
import { GET_HSM_CATEGORIES } from '../../../../graphql/queries/Template';
import { Simulator } from '../../../../components/simulator/Simulator';

const getFields = (
  match: { params: { id: any } },
  categoryOpns: any,
  validateShortcode: any,
  getExampleMessage: any
) => [
  {
    component: EmojiInput,
    name: 'example',
    placeholder: 'Sample message*',
    rows: 5,
    convertToWhatsApp: true,
    textArea: true,
    disabled: match.params.id,
    helperText:
      'Replace variables eg. {{1}} with actual values enclosed in [ ] eg. [12345] to show a complete message with meaningful word/statement/numbers/ special characters.',
    handleChange: getExampleMessage,
  },
  {
    component: AutoComplete,
    name: 'category',
    options: categoryOpns,
    optionLabel: 'label',
    multiple: false,
    textFieldProps: {
      variant: 'outlined',
      label: 'Category*',
    },
    disabled: match.params.id,
    helperText: 'Select the most relevant category',
  },
  {
    component: Input,
    name: 'shortcode',
    placeholder: 'Element name*',
    validate: validateShortcode,
    disabled: match.params.id,
  },
];
export interface HSMProps {
  match: any;
}

const defaultAttribute = {
  isHsm: true,
};

const templateIcon = <TemplateIcon className={styles.TemplateIcon} />;

export const HSM: React.SFC<HSMProps> = ({ match }) => {
  const [categoryOpns, setCategoryOpn] = useState([]);
  const [sampleMessages, setSampleMessages] = useState({
    type: 'TEXT',
    location: null,
    media: null,
    body: '',
  });
  const { data: categoryList } = useQuery(GET_HSM_CATEGORIES);

  useEffect(() => {
    if (categoryList) {
      const categoryOpn: any = [];
      categoryList.whatsappHsmCategories.forEach((categories: any) => {
        categoryOpn.push({ label: categories, id: categories });
      });

      setCategoryOpn(categoryOpn);
    }
  }, [categoryList]);

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
      if (match.params.id && found.length > 0) {
        found = found.filter((search: any) => search.id !== match.params.id);
      }
    }
    if (found.length > 0) {
      error = 'Element name already exists.';
    }

    return error;
  };

  const removeFirstLineBreak = (text: any) =>
    text?.length === 1 ? text.slice(0, 1).replace(/(\r\n|\n|\r)/, '') : text;

  const getExampleMessage = (messages: any) => {
    const message = removeFirstLineBreak(messages);
    const media: any = {
      caption: message,
    };
    setSampleMessages((val) => ({ ...val, body: message, media }));
  };

  const getAttachmentUrl = (type: any, media: any) => {
    const mediaBody = { ...media };
    mediaBody.caption = sampleMessages.body;
    setSampleMessages((val) => ({ ...val, type, media: mediaBody }));
  };

  return (
    <div>
      <Template
        match={match}
        listItemName="HSM Template"
        redirectionLink="template"
        icon={templateIcon}
        defaultAttribute={defaultAttribute}
        formField={getFields(match, categoryOpns, validateShortcode, getExampleMessage)}
        getSessionTemplatesCallBack={getSessionTemplates}
        getUrlAttachmentAndType={getAttachmentUrl}
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
