import React, { useState } from 'react';
import * as Yup from 'yup';
import { Input } from '../../components/UI/Form/Input/Input';
import { GET_TAG } from '../../graphql/queries/Tag';
import { UPDATE_TAG, CREATE_TAG } from '../../graphql/mutations/Tag';
import { DELETE_TAG } from '../../graphql/mutations/Tag';
import { FormLayout } from '../Form/FormLayout';
import { ReactComponent as TagIcon } from '../../assets/images/icons/Tags/Selected.svg';
import styles from './Tag.module.css';
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
  const [colorcode, setColorcode] = useState('');

  const states = { label, description, keywords, colorcode };
  const setStates = ({ label, description, keywords, colorcode }: any) => {
    setLabel(label);
    setDescription(description);
    setKeywords(keywords);
    setColorcode(colorcode);
  };

  const getColorCode = (code: string) => {
    setColorcode(code);
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
      component: Input,
      name: 'colorcode',
      type: 'text',
      placeholder: 'Select color',
    },
    { component: ColorPicker, colorCode: colorcode, handleChange: getColorCode },
  ];

  return (
    <FormLayout
      {...queries}
      match={match}
      states={states}
      setStates={setStates}
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
