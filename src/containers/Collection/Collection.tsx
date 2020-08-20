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
import Loading from '../../components/UI/Layout/Loading/Loading';
import { Typography } from '@material-ui/core';

export interface CollectionProps {
  match?: any;
  type?: string;
  search?: any;
  handleCancel?: any;
}

let FormSchema = Yup.object().shape({
  // shortcode: Yup.string().required('Title is required.'),
  // label: Yup.string().required('Description is required.'),
});

const dialogMessage = "You won't be able to use this collection again.";

const collectionIcon = <Collectionicon className={styles.Collectionicon} />;

const queries = {
  getItemQuery: GET_COLLECTION,
  createItemQuery: CREATE_COLLECTION,
  updateItemQuery: UPDATE_COLLECTION,
  deleteItemQuery: DELETE_COLLECTION,
};

export const Collection: React.SFC<CollectionProps> = ({
  match,
  type = 'save',
  search,
  ...props
}) => {
  const [shortcode, setShortcode] = useState('');
  const [label, setLabel] = useState('');
  const [term, setTerm] = useState('');
  const [includeTags, setIncludeTags] = useState([]);
  const [includeGroups, setIncludeGroups] = useState([]);
  const [dateFrom, setdateFrom] = useState(null);
  const [dateTo, setdateTo] = useState(null);
  const [formFields, setFormFields] = useState<any>([]);
  const [button, setButton] = useState<string>('Save');

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
            setIncludeTags(getObject(dataT.tags, filters.filter['includeTags']));
          break;
        case 'includeGroups':
          if (filters.filter.hasOwnProperty('includeGroups'))
            setIncludeGroups(getObject(data.groups, filters.filter['includeGroups']));
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

  const { data: dataT } = useQuery(GET_TAGS);
  const { data } = useQuery(GET_GROUPS);

  if (!data || !dataT) return <Loading />;

  const DataFields = [
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
  ];

  const searchFields = [
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
      options: dataT.tags,
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
      options: data.groups,
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
    search(payload);
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

  const advanceSearch = (data: any) => {
    console.log('Adv', data);
    // close dialogbox
    if (data === 'cancel') props.handleCancel();
    let heading;
    if (type === 'search')
      heading = (
        <React.Fragment>
          <Typography variant="h5" className={styles.Title}>
            Search conversations
          </Typography>
          <Typography variant="subtitle1" className={styles.Title}>
            Apply more parameters to search for conversations.
          </Typography>
        </React.Fragment>
      );
    if (formFields.length === 0 && type === 'search') {
      // setFormFields([]);
      setFormFields(searchFields);
      setButton('Search');
      let FormSchema = Yup.object().shape({
        term: Yup.string().required('Term is required.'),
      });
      FormSchema = FormSchema;
    }
    return {
      heading,
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
      formFields={formFields.length > 0 ? formFields : [...DataFields, ...searchFields]}
      redirectionLink="collection"
      cancelLink="collection"
      linkParameter="id"
      listItem="savedSearch"
      icon={collectionIcon}
      languageSupport={false}
      advanceSearch={advanceSearch}
      button={button}
      type={type}
    />
  );
};
