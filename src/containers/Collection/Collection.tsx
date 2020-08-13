import React, { useState } from 'react';
import * as Yup from 'yup';
import { Input } from '../../components/UI/Form/Input/Input';
import { ListItem } from '../List/ListItem/ListItem';
import { ReactComponent as Collectionicon } from '../../assets/images/icons/Collections/Selected.svg';
import { ReactComponent as TagIcon } from '../../assets/images/icons/Tags/Selected.svg';
import styles from './Collection.module.css';
import { GET_COLLECTION } from '../../graphql/queries/Collection';
import {
  CREATE_COLLECTION,
  UPDATE_COLLECTION,
  DELETE_COLLECTION,
} from '../../graphql/mutations/Collection';

import { Dropdown } from '../../components/UI/Form/Dropdown/Dropdown';
import { GET_TAGS } from '../../graphql/queries/Tag';
import { useQuery } from '@apollo/client';
import { AutoComplete } from '../../components/UI/Form/AutoComplete/AutoComplete';

export interface CollectionProps {
  match?: any;
}

const FormSchema = Yup.object().shape({
  title: Yup.string().required('Title is required.'),
});

const dialogMessage = "You won't be able to use this automation again.";

const collectionIcon = <Collectionicon className={styles.Collectionicon} />;

const queries = {
  getItemQuery: GET_COLLECTION,
  createItemQuery: CREATE_COLLECTION,
  updateItemQuery: UPDATE_COLLECTION,
  deleteItemQuery: DELETE_COLLECTION,
};

export const Collection: React.SFC<CollectionProps> = ({ match }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [includeTags, setIncludeTags] = useState([]);
  const [includeGroups, setIncludeGroups] = useState([]);
  const [dateFrom, setdateFrom] = useState([]);
  const [dateTo, setdateTo] = useState([]);

  const states = { title, description, includeTags, includeGroups };

  const setStates = ({ title, description, includeTags, includeGroups, dateFrom, dateTo }: any) => {
    setTitle(title);
    setDescription(description);
    setIncludeTags(includeTags);
    setIncludeGroups(includeGroups);
    setdateFrom(dateFrom);
    setdateTo(dateTo);
  };

  useQuery(GET_TAGS, {
    onCompleted: (data) => {
      setTags(data.tags);
    },
  });

  const formFields = [
    {
      component: Input,
      name: 'title',
      type: 'text',
      placeholder: 'Collection Title',
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
      name: 'name',
      type: 'text',
      placeholder: 'Enter name, tag, keyword',
    },
    {
      component: Dropdown,
      name: 'staffGroup',
      type: 'text',
      placeholder: 'Select staff group',
      label: 'Assigned To',
    },
    {
      component: AutoComplete,
      name: 'includeTags',
      label: 'Include tags',
      options: tags,
      optionLabel: 'label',
      icon: <TagIcon className={styles.TagIcon} />,
    },
    {
      component: Input,
      name: 'includeGroup',
      type: 'text',
      textArea: true,
      placeholder: 'Include group',
      label: 'Include group',
    },
    {
      component: Input,
      name: 'dateFrom',
      type: 'date',
      placeholder: 'Date from',
      label: 'Date range',
    },
    {
      component: Input,
      name: 'dateTo',
      type: 'date',
      placeholder: 'Date to',
    },
  ];

  return (
    <ListItem
      {...queries}
      match={match}
      states={states}
      setStates={setStates}
      validationSchema={FormSchema}
      listItemName="collection"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink="collection"
      cancelLink="collection"
      linkParameter="id"
      listItem="savedSearch"
      icon={collectionIcon}
      // additionalAction={additionalAction}
      languageSupport={false}
    />
  );
};
