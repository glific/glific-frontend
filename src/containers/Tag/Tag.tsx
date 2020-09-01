import React, { useState } from 'react';
import * as Yup from 'yup';
import { useQuery } from '@apollo/client';
import { Input } from '../../components/UI/Form/Input/Input';
import { GET_TAG, GET_TAGS } from '../../graphql/queries/Tag';
import { UPDATE_TAG, CREATE_TAG } from '../../graphql/mutations/Tag';
import { DELETE_TAG } from '../../graphql/mutations/Tag';
import { FormLayout } from '../Form/FormLayout';
import { ReactComponent as TagIcon } from '../../assets/images/icons/Tags/Selected.svg';
import styles from './Tag.module.css';
import { AutoComplete } from '../../components/UI/Form/AutoComplete/AutoComplete';
import { Loading } from '../../components/UI/Layout/Loading/Loading';
import { ColorPicker } from '../../components/UI/ColorPicker/ColorPicker';

export interface TagProps {
  match: any;
}

const FormSchema = Yup.object().shape({
  label: Yup.string().required('Title is required.').max(50, 'Title is too long.'),
  description: Yup.string().required('Description is required.'),
});

const dialogMessage = "You won't be able to use this for tagging messages.";

const tagIcon = <TagIcon className={styles.TagIcon} />;

const queries = {
  getItemQuery: GET_TAG,
  createItemQuery: CREATE_TAG,
  updateItemQuery: UPDATE_TAG,
  deleteItemQuery: DELETE_TAG,
};

export const Tag: React.SFC<TagProps> = ({ match }) => {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [colorCode, setColorcode] = useState('#0C976D');
  const [parentId, setParentId] = useState<any>([]);

  const states = { label, description, keywords, colorCode, parentId };
  const setStates = ({ label, description, keywords, colorCode, parent }: any) => {
    setLabel(label);
    setDescription(description);
    setKeywords(keywords);
    setColorcode(colorCode);
    if (parent) {
      setParentId(getObject(data.tags, [parent.id])[0]);
    }
  };

  const { data } = useQuery(GET_TAGS);

  if (!data) return <Loading />;

  let tags = [];
  // remove the self tag from list
  if (data && match && match.params.id) {
    tags = data.tags.filter(function (tag: any) {
      return tag.id !== match.params.id;
    });
  }

  const getColorCode = (code: string) => {
    setColorcode(code);
  };

  const getObject = (arr: any, data: any) => {
    if (arr && data) {
      let result: any = [];
      arr.map((obj: any) => {
        data.map((ID: any) => {
          if (obj.id === ID) result.push(obj);
        });
      });
      return result;
    }
  };

  const formFields = [
    {
      component: Input,
      name: 'label',
      type: 'text',
      placeholder: 'Title',
    },
    {
      component: Input,
      name: 'description',
      type: 'text',
      placeholder: 'Description',
      rows: 3,
      textArea: true,
    },
    {
      component: Input,
      name: 'keywords',
      type: 'text',
      placeholder: 'Keywords',
      rows: 3,
      helperText: 'Use commas to separate the keywords',
      textArea: true,
    },
    {
      component: AutoComplete,
      name: 'parentId',
      placeholder: 'Parent tag',
      options: tags,
      optionLabel: 'label',
      multiple: false,
      textFieldProps: {
        label: 'Parent tag',
        variant: 'outlined',
      },
    },
    {
      component: ColorPicker,
      colorCode: colorCode,
      helperText: 'Tag color',
      handleChange: getColorCode,
    },
  ];

  const setPayload = (payload: any) => {
    if (payload.parentId) {
      payload.parentId = payload.parentId.id;
    }
    return payload;
  };

  return (
    <FormLayout
      {...queries}
      match={match}
      states={states}
      setStates={setStates}
      setPayload={setPayload}
      validationSchema={FormSchema}
      listItemName="tag"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink="tag"
      listItem="tag"
      icon={tagIcon}
    />
  );
};
