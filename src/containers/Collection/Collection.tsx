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
import { DATE_FORMAT } from '../../common/constants';
import moment from 'moment';

export interface CollectionProps {
  match?: any;
}

const FormSchema = Yup.object().shape({
  shortcode: Yup.string().required('Title is required.'),
  label: Yup.string().required('Description is required.'),
});

const dialogMessage = "You won't be able to use this collection again.";

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
  const [term, setTerm] = useState('');
  const [tags, setTags] = useState([]);
  const [groups, setGroups] = useState([]);
  const [includeTags, setIncludeTags] = useState([]);
  const [includeGroups, setIncludeGroups] = useState([]);
  const [dateFrom, setdateFrom] = useState(null);
  const [dateTo, setdateTo] = useState(null);

  const states = { shortcode, label, term, includeTags, includeGroups, dateFrom, dateTo };
  const setStates = ({ shortcode, label, args }: any) => {
    setShortcode(shortcode);
    setLabel(label);
    setArgs(args);
  };

  const setArgs = (args: any) => {
    let filters = JSON.parse(args);
    Object.keys(filters.filter).map((key) => {
      switch (key) {
        case 'includeTags':
          if (filters.filter.hasOwnProperty('includeTags'))
            setIncludeTags(getObject(tags, filters.filter['includeTags']));
          break;
        case 'includeGroups':
          if (filters.filter.hasOwnProperty('includeGroups'))
            setIncludeGroups(getObject(tags, filters.filter['includeGroups']));
          break;
        case 'dateRange':
          if (filters.filter.hasOwnProperty('dateRange')) {
            setdateFrom(filters.filter.dateRange.from);
            setdateTo(filters.filter.dateRange.to);
          }
          break;
        case 'term':
          setTerm(filters.filter.term);
          break;
        default:
          break;
      }
    });
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

  const setPayload = (payload: any) => {
    return {
      label: payload.label,
      shortcode: payload.shortcode,
      args: JSON.stringify({
        messageOpts: {
          offset: 0,
          limit: 10,
        },
        filter: {
          term: payload.term,
          includeTags: payload.includeTags.map((option: any) => option.id),
          includeGroups: payload.includeGroups.map((option: any) => option.id),
          dateRange: {
            to: moment(payload.dateTo).format(DATE_FORMAT),
            from: moment(payload.dateFrom).format(DATE_FORMAT),
          },
        },
        contactOpts: {
          offset: 0,
          limit: 20,
        },
      }),
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
