import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useQuery, useLazyQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import { FILTER_TAGS_NAME, GET_TAG, GET_TAGS } from 'graphql/queries/Tag';
import { UPDATE_TAG, CREATE_TAG, DELETE_TAG } from 'graphql/mutations/Tag';
import { ReactComponent as TagIcon } from 'assets/images/icons/Tags/Selected.svg';
import { FormLayout } from 'containers/Form/FormLayout';
import { Input } from 'components/UI/Form/Input/Input';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { ColorPicker } from 'components/UI/ColorPicker/ColorPicker';
import { setVariables } from 'common/constants';
import { getObject } from 'common/utils';
import styles from './Tag.module.css';

export interface TagProps {
  match: any;
}

export const Tag = ({ match }: TagProps) => {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [colorCode, setColorCode] = useState('#0C976D');
  const [parentId, setParentId] = useState<any>(null);
  const [filterLabel, setFilterLabel] = useState('');
  const [languageId, setLanguageId] = useState<any>(null);
  const { t } = useTranslation();

  const states = { label, description, keywords, colorCode, parentId };

  const { data } = useQuery(GET_TAGS, {
    variables: setVariables(),
  });

  const [getTags, { data: dataTag }] = useLazyQuery<any>(GET_TAGS, {
    variables: {
      filter: { label: filterLabel, languageId: parseInt(languageId, 10) },
    },
  });

  const setStates = ({
    label: labelValue,
    description: descriptionValue,
    keywords: keywordsValue,
    colorCode: colorCodeValue,
    parent: parentValue,
  }: any) => {
    setLabel(labelValue);
    setDescription(descriptionValue);
    setKeywords(keywordsValue);
    setColorCode(colorCodeValue);
    if (parentValue) {
      setParentId(getObject(data.tags, [parentValue.id])[0]);
    }
  };

  useEffect(() => {
    if (filterLabel && languageId) getTags();
  }, [filterLabel, languageId, getTags]);

  if (!data) return <Loading />;

  let tags = [];
  tags = data.tags;
  // remove the self tag from list
  if (match && match.params.id) {
    tags = data.tags.filter((tag: any) => tag.id !== match.params.id);
  }

  const validateTitle = (value: any) => {
    let error;
    if (value) {
      setFilterLabel(value);
      let found = [];
      if (dataTag) {
        // need to check exact title
        found = dataTag.tags.filter((search: any) => search.label === value);
        if (match.params.id && found.length > 0) {
          found = found.filter((search: any) => search.id !== match.params.id);
        }
      }
      if (found.length > 0) {
        error = t('Title already exists.');
      }
    }
    return error;
  };

  const getLanguageId = (value: any) => {
    setLanguageId(value);
  };

  const setPayload = (payload: any) => {
    const payloadCopy = payload;
    if (payloadCopy.parentId) {
      payloadCopy.parentId = payloadCopy.parentId.id;
    }
    return payloadCopy;
  };

  const FormSchema = Yup.object().shape({
    label: Yup.string().required(t('Title is required.')).max(50, t('Title is too long.')),
    description: Yup.string().required(t('Description is required.')),
  });

  const dialogMessage = t("You won't be able to use this for tagging messages.");

  const tagIcon = <TagIcon className={styles.TagIcon} />;

  const queries = {
    getItemQuery: GET_TAG,
    createItemQuery: CREATE_TAG,
    updateItemQuery: UPDATE_TAG,
    deleteItemQuery: DELETE_TAG,
  };

  const formFields = (validateTitleCallback: any, tagsList: any, colorCodeValue: string) => [
    {
      component: Input,
      name: 'label',
      type: 'text',
      placeholder: t('Title'),
      validate: validateTitleCallback,
    },
    {
      component: Input,
      name: 'description',
      type: 'text',
      placeholder: t('Description'),
      rows: 3,
      textArea: true,
    },
    {
      component: Input,
      name: 'keywords',
      type: 'text',
      placeholder: t('Keywords'),
      rows: 3,
      helperText: t('Use commas to separate the keywords'),
      textArea: true,
    },
    {
      component: AutoComplete,
      name: 'parentId',
      placeholder: t('Parent tag'),
      options: tagsList,
      optionLabel: 'label',
      multiple: false,
      textFieldProps: {
        label: t('Parent tag'),
        variant: 'outlined',
      },
    },
    {
      component: ColorPicker,
      name: 'colorCode',
      colorCode: colorCodeValue,
      helperText: t('Tag color'),
    },
  ];

  return (
    <FormLayout
      {...queries}
      match={match}
      refetchQueries={[
        {
          query: FILTER_TAGS_NAME,
          variables: setVariables(),
        },
      ]}
      states={states}
      setStates={setStates}
      setPayload={setPayload}
      validationSchema={FormSchema}
      listItemName="tag"
      dialogMessage={dialogMessage}
      formFields={formFields(validateTitle, tags, colorCode)}
      redirectionLink="tag"
      listItem="tag"
      icon={tagIcon}
      getLanguageId={getLanguageId}
    />
  );
};

export default Tag;
