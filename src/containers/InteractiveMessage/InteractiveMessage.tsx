/* eslint-disable */
import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { EditorState } from 'draft-js';

import styles from './InteractiveMessage.module.css';
import { Input } from '../../components/UI/Form/Input/Input';
import { FormLayout } from '../Form/FormLayout';
import { ReactComponent as InteractiveMessageIcon } from '../../assets/images/icons/InteractiveMessage/Dark.svg';

import { CREATE_FLOW, UPDATE_FLOW, DELETE_FLOW } from '../../graphql/mutations/Flow';
import { Checkbox } from '../../components/UI/Form/Checkbox/Checkbox';
import { GET_FLOW } from '../../graphql/queries/Flow';
import { EmojiInput } from '../../components/UI/Form/EmojiInput/EmojiInput';
import { InteractiveOptions } from './InteractiveOptions/InteractiveOptions';
import { LIST, QUICK_REPLY } from '../../common/constants';

export interface FlowProps {
  match: any;
}

const interactiveMessageIcon = <InteractiveMessageIcon className={styles.FlowIcon} />;

const queries = {
  getItemQuery: GET_FLOW,
  createItemQuery: CREATE_FLOW,
  updateItemQuery: UPDATE_FLOW,
  deleteItemQuery: DELETE_FLOW,
};

export const InteractiveMessage: React.SFC<FlowProps> = ({ match }) => {
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [body, setBody] = useState(EditorState.createEmpty());
  const [isActive, setIsActive] = useState(true);
  const [ignoreKeywords, setIgnoreKeywords] = useState(false);
  const [templateType, setTemplateType] = useState<string>('QUICK_REPLY');
  const [templateButtons, setTemplateButtons] = useState<Array<any>>([{ value: '' }]);
  const { t } = useTranslation();

  const states = { isActive, name, keywords, ignoreKeywords, body, templateButtons, templateType };

  const setStates = ({
    name: nameValue,
    keywords: keywordsValue,
    isActive: isActiveValue,
    ignoreKeywords: ignoreKeywordsValue,
  }: any) => {
    // Override name & keywords when creating Flow Copy

    const fieldKeywords = keywordsValue;

    setName(nameValue);
    setIsActive(isActiveValue);

    // we are receiving keywords as an array object
    if (fieldKeywords.length > 0) {
      // lets display it comma separated
      setKeywords(fieldKeywords.join(','));
    }
    setIgnoreKeywords(ignoreKeywordsValue);
  };

  const FormSchema = Yup.object().shape({
    name: Yup.string().required(t('Name is required.')),
  });

  const handleAddInteractiveTemplate = (addFromTemplate: boolean = true) => {
    let buttons: any = [];
    const buttonType: any = {
      QUICK_REPLY: { value: '' },
      LIST: { title: '', options: [{ title: '', description: '' }] },
    };

    buttons = addFromTemplate
      ? [...templateButtons, buttonType[templateType]]
      : [buttonType[templateType]];

    setTemplateButtons(buttons);
  };

  const handleRemoveInteractiveTemplate = (index: number) => {
    const buttons = [...templateButtons];
    const result = buttons.filter((row, idx: number) => idx !== index);
    setTemplateButtons(result);
  };

  const handleAddListItem = (rowNo: number, oldOptions: Array<any>) => {
    const buttons = [...templateButtons];
    const newOptions = [...oldOptions, { title: '', description: '' }];

    const result = buttons.map((row: any, idx: number) =>
      rowNo === idx ? { ...row, options: newOptions } : row
    );

    setTemplateButtons(result);
  };

  const handleRemoveListItem = (rowIdx: number, idx: number) => {
    const buttons = [...templateButtons];
    const result = buttons.map((row: any, index: number) => {
      if (index === rowIdx) {
        const newOptions = row.options.filter((r: any, itemIdx: number) => itemIdx !== idx);
        return { ...row, options: newOptions };
      }
      return row;
    });

    setTemplateButtons(result);
  };

  const handleInputChange = (type: string, index: number, value: string, payload: any) => {
    const { key, itemIndex, isOption } = payload;
    const buttons = [...templateButtons];
    let result = [];
    if (type === QUICK_REPLY) {
      result = buttons.map((row: any, idx: number) => {
        if (idx === index) {
          const newRow = { ...row };
          newRow[key] = value;
          return newRow;
        }
        return row;
      });
    }

    if (type === LIST) {
      result = buttons.map((row: any, idx: number) => {
        const { options }: { options: Array<any> } = row;
        if (idx === index) {
          // for options
          if (isOption) {
            const updatedOptions = options.map((option: any, optionIdx: number) => {
              if (optionIdx === itemIndex) {
                const newOption = { ...option };
                newOption[key] = value;
                return newOption;
              }
              return option;
            });

            const updatedRowWithOptions = { ...row, options: updatedOptions };
            return updatedRowWithOptions;
          }

          // for title
          const newRow = { ...row };
          newRow[key] = value;
          return newRow;
        }

        return row;
      });
    }

    setTemplateButtons(result);
  };

  useEffect(() => {
    if (templateType) {
      handleAddInteractiveTemplate(false);
    }
  }, [templateType]);

  const dialogMessage = t("You won't be able to use this flow again.");

  const formFields = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      placeholder: t('Title*'),
    },
    {
      component: EmojiInput,
      name: 'body',
      placeholder: t('Message*'),
      rows: 5,
      convertToWhatsApp: true,
      textArea: true,
      helperText: 'You can also use variables in message enter @ to see the available list',
    },
    {
      component: InteractiveOptions,
      isAddButtonChecked: true,
      templateType,
      inputFields: templateButtons,
      disabled: false,
      onAddClick: handleAddInteractiveTemplate,
      onRemoveClick: handleRemoveInteractiveTemplate,
      onInputChange: handleInputChange,
      onListItemAddClick: handleAddListItem,
      onListItemRemoveClick: handleRemoveListItem,
      onTemplateTypeChange: (value: string) => {
        setTemplateType(value);
      },
    },
  ];

  const setPayload = (payload: any) => {
    let formattedKeywords;
    if (payload.keywords) {
      // remove white spaces
      const inputKeywords = payload.keywords.replace(/[\s]+/g, '');
      // convert to array
      formattedKeywords = inputKeywords.split(',');
    }

    // return modified payload
    return {
      ...payload,
      keywords: formattedKeywords,
    };
  };

  return (
    <FormLayout
      {...queries}
      match={match}
      states={states}
      setStates={setStates}
      setPayload={setPayload}
      validationSchema={FormSchema}
      listItemName="interactive msg"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink="flow"
      cancelLink="flow"
      linkParameter="uuid"
      listItem="flow"
      icon={interactiveMessageIcon}
      languageSupport={false}
    />
  );
};

export default InteractiveMessage;
