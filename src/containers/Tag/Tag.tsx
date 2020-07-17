import React, { useState } from 'react';
import { Input } from '../../components/UI/Form/Input/Input';
import { GET_TAG } from '../../graphql/queries/Tag';
import { UPDATE_TAG, CREATE_TAG } from '../../graphql/mutations/Tag';
import { DELETE_TAG } from '../../graphql/mutations/Tag';
import { ListItem } from '../List/ListItem/ListItem';
import { ReactComponent as TagIcon } from '../../assets/images/icons/Tags/Selected.svg';
import styles from './Tag.module.css';

export interface TagProps {
  match: any;
}

const setValidation = (values: any) => {
  const errors: Partial<any> = {};
  if (!values.label) {
    errors.label = 'Tag title is required';
  } else if (values.label.length > 50) {
    errors.label = 'Title length too long';
  }
  if (!values.description) {
    errors.description = 'Tag description is required';
  }
  return errors;
};

const dialogMessage = "You won't be able to use this for tagging messages.";

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
];

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

  const states = { label, description, keywords };
  const setStates = ({ label, description, keywords }: any) => {
    setLabel(label);
    setDescription(description);
    setKeywords(keywords);
  };

  return (
    <ListItem
      {...queries}
      match={match}
      states={states}
      setStates={setStates}
      setValidation={setValidation}
      listItemName="tag"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink="tag"
      listItem="tag"
      icon={tagIcon}
    />
  );
};
