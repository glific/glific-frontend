import React, { useState } from 'react';
import * as Yup from 'yup';
import { useQuery } from '@apollo/client';
import { Input } from '../../components/UI/Form/Input/Input';
import { FormLayout } from '../Form/FormLayout';
import { ReactComponent as Collectionicon } from '../../assets/images/icons/Collections/Selected.svg';
import { ReactComponent as TagIcon } from '../../assets/images/icons/Tags/Selected.svg';
import styles from './Collection.module.css';
import { GET_COLLECTION } from '../../graphql/queries/Collection';
import {
  CREATE_COLLECTION,
  UPDATE_COLLECTION,
  DELETE_COLLECTION,
} from '../../graphql/mutations/Collection';
import { GET_TAGS } from '../../graphql/queries/Tag';
import { GET_GROUPS } from '../../graphql/queries/Group';
import { AutoComplete } from '../../components/UI/Form/AutoComplete/AutoComplete';
import { Calendar } from '../../components/UI/Form/Calendar/Calendar';

export interface CollectionProps {
  match?: any;
}

const FormSchema = Yup.object().shape({
  shortcode: Yup.string().required('Title is required.'),
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
  const [shortcode, setShortcode] = useState('');
  const [label, setLabel] = useState('');
  const [tags, setTags] = useState([]);
  const [groups, setGroups] = useState([]);
  const [includeTags, setIncludeTags] = useState([]);
  const [includeGroups, setIncludeGroups] = useState([]);
  const [dateFrom, setdateFrom] = useState('');
  const [dateTo, setdateTo] = useState('');

  const states = { shortcode, label, includeTags, includeGroups, dateFrom, dateTo };

  const setStates = ({ shortcode, label, includeTags, includeGroups, dateFrom, dateTo }: any) => {
    setShortcode(shortcode);
    setLabel(label);
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
  useQuery(GET_GROUPS, {
    onCompleted: (data) => {
      setGroups(data.groups);
    },
  });

  const formFields = [
    {
      component: Input,
      name: 'shortcode',
      type: 'text',
      placeholder: 'Collection Title',
    },
    {
      component: Input,
      name: 'label',
      type: 'text',
      placeholder: 'Description',
      rows: 3,
      textArea: true,
    },
    {
      component: Input,
      name: 'term',
      type: 'text',
      placeholder: 'Enter name, tag, keyword',
    },
    {
      component: AutoComplete,
      name: 'includeTags',
      label: 'Includes tags',
      options: tags,
      optionLabel: 'label',
      textFieldProps: {
        label: 'Includes tags',
        // required: true,
        variant: 'outlined',
      },
      icon: <TagIcon className={styles.TagIcon} />,
    },
    {
      component: AutoComplete,
      name: 'includeGroups',
      placeholder: 'Includes groups',
      label: 'Includes groups',
      options: groups,
      optionLabel: 'label',
      textFieldProps: {
        label: 'Includes groups',
        variant: 'outlined',
      },
    },
    {
      component: Calendar,
      name: 'dateFrom',
      type: 'date',
      placeholder: 'Date from',
      label: 'Date range',
    },
    {
      component: Calendar,
      name: 'dateTo',
      type: 'date',
      placeholder: 'Date to',
    },
  ];

  return (
    <FormLayout
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
      languageSupport={false}
    />
  );
};
