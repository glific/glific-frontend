import React, { useState } from 'react';
import * as Yup from 'yup';
import { Input } from '../../components/UI/Form/Input/Input';
import { GET_GROUP, GET_GROUPS } from '../../graphql/queries/Group';
import { UPDATE_GROUP, CREATE_GROUP, DELETE_GROUP } from '../../graphql/mutations/Group';

import { ListItem } from '../List/ListItem/ListItem';
import { ReactComponent as TagIcon } from '../../assets/images/icons/Tags/Selected.svg';
import styles from './Group.module.css';
import { Dropdown } from '../../components/UI/Form/Dropdown/Dropdown';
import { useQuery } from '@apollo/client';

export interface TagProps {
  match: any;
}

const FormSchema = Yup.object().shape({
  label: Yup.string().required('Title is required.').max(50, 'Title is too long.'),
  description: Yup.string().required('Description is required.'),
});

const dialogMessage = "You won't be able to use this for tagging messages.";

const formFields = (options: any) => {
  return [
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
      component: Dropdown,
      name: 'groups',
      placeholder: 'Assigned to group',
      options: options,
      helperText:
        'People from the assigned group will be responsible to chat with users in this group',
    },
  ];
};

const tagIcon = <TagIcon className={styles.TagIcon} />;

const queries = {
  getItemQuery: GET_GROUP,
  createItemQuery: CREATE_GROUP,
  updateItemQuery: UPDATE_GROUP,
  deleteItemQuery: DELETE_GROUP,
};

export const Group: React.SFC<TagProps> = ({ match }) => {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');

  const groups = useQuery(GET_GROUPS);
  let options = [];
  if (groups.data) {
    options = groups.data.groups;
  }

  const states = { label, description };
  const setStates = ({ label, description }: any) => {
    setLabel(label);
    setDescription(description);
  };

  return (
    <ListItem
      {...queries}
      match={match}
      states={states}
      languageSupport={false}
      setStates={setStates}
      validationSchema={FormSchema}
      listItemName="group"
      dialogMessage={dialogMessage}
      formFields={formFields(options)}
      redirectionLink="group"
      listItem="group"
      icon={tagIcon}
    />
  );
};
