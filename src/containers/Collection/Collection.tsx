import React, { useState } from 'react';
import { Input } from '../../components/UI/Form/Input/Input';
import { ListItem } from '../List/ListItem/ListItem';
import { ReactComponent as Collectionicon } from '../../assets/images/icons/Collections/Selected.svg';
import { ReactComponent as TagIcon } from '../../assets/images/icons/Tags/Selected.svg';
import styles from './Collection.module.css';

import {
  CREATE_AUTOMATION,
  UPDATE_AUTOMATION,
  DELETE_AUTOMATION,
} from '../../graphql/mutations/Automation';

import {
  CREATE_COLLECTION,
  UPDATE_COLLECTION,
  DELETE_COLLECTION,
} from '../../graphql/mutations/Collection';

import { GET_AUTOMATION } from '../../graphql/queries/Automation';
import { SAVED_SEARCH_QUERY } from '../../graphql/queries/Search';
import { Dropdown } from '../../components/UI/Form/Dropdown/Dropdown';
import { GET_TAGS } from '../../graphql/queries/Tag';
import { useQuery } from '@apollo/client';
import { AutocompleteUI } from '../../components/UI/Form/AutocompleteUI/AutocompleteUI';

export interface CollectionProps {
  match: any;
}

const setValidation = (values: any) => {
  const errors: Partial<any> = {};
  if (!values.title) {
    errors.title = 'title is required';
  }

  return errors;
};

const dialogMessage = "You won't be able to use this automation again.";

const collectionIcon = <Collectionicon className={styles.Collectionicon} />;

const queries = {
  getItemQuery: SAVED_SEARCH_QUERY,
  createItemQuery: CREATE_COLLECTION,
  updateItemQuery: UPDATE_COLLECTION,
  deleteItemQuery: DELETE_COLLECTION,
};

export const Collection: React.SFC<CollectionProps> = ({ match }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);

  const states = { title, description };

  const setStates = ({ title, description }: any) => {
    setTitle(title);
    setDescription(description);
  };

  const additionalAction = { label: 'Configure', link: '/collection/configure' };

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
      component: AutocompleteUI,
      name: 'includeTags',
      placeholder: 'Include tags',
      label: 'Include tags',
      options: tags,
      optionLabel: 'label',
      icon: <TagIcon className={styles.TagIcon} />,
    },
    {
      component: AutocompleteUI,
      name: 'excludeTags',
      placeholder: 'Exclude tags',
      label: 'Exclude tags',
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
      name: 'excludeGroup',
      type: 'text',
      textArea: true,
      placeholder: 'Exclude group',
      label: 'Exclude group',
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
      setValidation={setValidation}
      listItemName="collection"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink="collection"
      cancelLink="collection"
      linkParameter="uuid"
      listItem="flow"
      icon={collectionIcon}
      // additionalAction={additionalAction}
      languageSupport={false}
    />
  );
};
