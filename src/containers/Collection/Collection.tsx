import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useQuery } from '@apollo/client';
import { Input } from '../../components/UI/Form/Input/Input';
import { FormLayout } from '../Form/FormLayout';
import { ReactComponent as Collectionicon } from '../../assets/images/icons/Collections/Selected.svg';
import { ReactComponent as TagIcon } from '../../assets/images/icons/Tags/Selected.svg';
import styles from './Collection.module.css';
import { GET_COLLECTION, COLLECTION_QUERY } from '../../graphql/queries/Collection';
import {
  CREATE_COLLECTION,
  UPDATE_COLLECTION,
  DELETE_COLLECTION,
} from '../../graphql/mutations/Collection';
import { GET_TAGS } from '../../graphql/queries/Tag';
import { GET_GROUPS } from '../../graphql/queries/Group';
import { GET_USERS } from '../../graphql/queries/User';
import { AutoComplete } from '../../components/UI/Form/AutoComplete/AutoComplete';
import { Calendar } from '../../components/UI/Form/Calendar/Calendar';
import moment from 'moment';
import Loading from '../../components/UI/Layout/Loading/Loading';
import { Typography } from '@material-ui/core';
import { setVariables } from '../../common/constants';

export interface CollectionProps {
  match?: any;
  type?: string;
  search?: any;
  handleCancel?: any;
  handleSave?: any;
  searchParam?: any;
  setState?: any;
}

const validation = {
  shortcode: Yup.string().required('Title is required.').max(20, 'Title is too long.'),
  label: Yup.string().required('Description is required.'),
};
let FormSchema = Yup.object().shape({});

const dialogMessage = "You won't be able to use this collection again.";

const collectionIcon = <Collectionicon className={styles.Collectionicon} />;

const queries = {
  getItemQuery: GET_COLLECTION,
  createItemQuery: CREATE_COLLECTION,
  updateItemQuery: UPDATE_COLLECTION,
  deleteItemQuery: DELETE_COLLECTION,
};

export const Collection: React.SFC<CollectionProps> = ({ match, type, search, ...props }) => {
  const [shortcode, setShortcode] = useState('');
  const [label, setLabel] = useState('');
  const [term, setTerm] = useState('');
  const [includeTags, setIncludeTags] = useState([]);
  const [includeGroups, setIncludeGroups] = useState([]);
  const [includeUsers, setIncludeUsers] = useState([]);
  const [dateFrom, setdateFrom] = useState(null);
  const [dateTo, setdateTo] = useState(null);
  const [formFields, setFormFields] = useState<any>([]);
  const [button, setButton] = useState<string>('Save');

  const states = {
    shortcode,
    label,
    term,
    includeTags,
    includeGroups,
    includeUsers,
    dateFrom,
    dateTo,
  };
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
        case 'includeUsers':
          if (filters.filter.hasOwnProperty('includeUsers'))
            setIncludeUsers(getObject(dataUser.users, filters.filter['includeUsers']));
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
      return null;
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

  const restoreSearch = () => {
    let args = {
      messageOpts: {
        offset: 0,
        limit: 10,
      },
      filter: {
        term: props.searchParam.term,
        includeTags: props.searchParam.includeTags
          ? props.searchParam.includeTags.map((option: any) => option.id)
          : [],
        includeGroups: props.searchParam.includeGroups
          ? props.searchParam.includeGroups.map((option: any) => option.id)
          : [],
        includeUsers: props.searchParam.includeUsers
          ? props.searchParam.includeUsers.map((option: any) => option.id)
          : [],
      },
      contactOpts: {
        offset: 0,
        limit: 20,
      },
    };

    if (props.searchParam.dateFrom && props.searchParam.dateFrom !== 'Invalid date') {
      let dateRange = {
        dateRange: {
          to: moment(props.searchParam.dateTo).format('yyyy-MM-DD'),
          from: moment(props.searchParam.dateFrom).format('yyyy-MM-DD'),
        },
      };
      args.filter = Object.assign(args.filter, dateRange);
    }
    // For create new collection then label & shortcode should be empty
    // For update collection match.params.id should not empty
    setStates({
      label: match.params.id ? props.searchParam.label : '',
      shortcode: match.params.id ? props.searchParam.shortcode : '',
      args: JSON.stringify(args),
    });
  };

  useEffect(() => {
    // Chat collection:restore collection search
    if (props.searchParam && Object.keys(props.searchParam).length !== 0) {
      restoreSearch();
    }
  }, [props.searchParam]);

  const { data: dataT } = useQuery(GET_TAGS, {
    variables: setVariables(),
  });
  const { data } = useQuery(GET_GROUPS, {
    variables: setVariables(),
  });
  const { data: dataUser } = useQuery(GET_USERS, {
    variables: setVariables(),
  });
  const { data: collections } = useQuery(COLLECTION_QUERY, {
    variables: setVariables({}, 100, 0, 'ASC'),
  });

  if (!data || !dataT || !dataUser) return <Loading />;

  const validateTitle = (value: any) => {
    if (value) {
      let found = [];
      let error;
      if (collections) {
        found = collections.savedSearches.filter((search: any) => search.shortcode === value);
        if (match.params.id && found.length > 0) {
          found = found.filter((search: any) => search.id !== match.params.id);
        }
      }
      if (found.length > 0) {
        error = 'Title already exists.';
      }
      return error;
    }
  };

  const DataFields = [
    {
      component: Input,
      name: 'shortcode',
      type: 'text',
      placeholder: 'Collection Title',
      validate: validateTitle,
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

  let searchFields = [
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
        variant: 'outlined',
      },
    },
    {
      component: AutoComplete,
      name: 'includeUsers',
      placeholder: 'Includes staff',
      label: 'Includes staff',
      options: dataUser.users,
      optionLabel: 'name',
      textFieldProps: {
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
    if (search) search(payload);

    let args = {
      messageOpts: {
        offset: 0,
        limit: 10,
      },
      filter: {
        term: payload.term,
        includeTags: payload.includeTags ? payload.includeTags.map((option: any) => option.id) : [],
        includeGroups: payload.includeGroups
          ? payload.includeGroups.map((option: any) => option.id)
          : [],
        includeUsers: payload.includeUsers
          ? payload.includeUsers.map((option: any) => option.id)
          : [],
      },
      contactOpts: {
        offset: 0,
        limit: 20,
      },
    };

    if (payload.dateFrom && payload.dateFrom !== 'Invalid date') {
      let dateRange = {
        dateRange: {
          to: moment(payload.dateTo).format('yyyy-MM-DD'),
          from: moment(payload.dateFrom).format('yyyy-MM-DD'),
        },
      };
      args.filter = Object.assign(args.filter, dateRange);
    }

    return {
      label: payload.label,
      shortcode: payload.shortcode,
      args: JSON.stringify(args),
    };
  };

  const advanceSearch = (data: any) => {
    // close dialogbox
    if (data === 'cancel') props.handleCancel();

    let heading;
    if (type === 'search') {
      heading = (
        <React.Fragment>
          <Typography variant="h5" className={styles.Title}>
            Search conversations
          </Typography>
          <Typography variant="subtitle1" className={styles.Subtext}>
            Apply more parameters to search for conversations.
          </Typography>
        </React.Fragment>
      );

      FormSchema = Yup.object().shape({});
    }

    if (type === 'saveSearch') {
      heading = (
        <React.Fragment>
          <Typography variant="h5" className={styles.Title}>
            Save search to collections
          </Typography>
        </React.Fragment>
      );
      addFieldsValidation(validation);
    }

    if (formFields.length === 0) {
      if (type === 'search') {
        setFormFields([...searchFields]);
        setButton('Search');
      }
      if (type === 'saveSearch') setFormFields(DataFields);
    }
    return {
      heading,
    };
  };

  const addFieldsValidation = (object: object) => {
    FormSchema = Yup.object().shape(object);
  };

  const getFields = () => {
    addFieldsValidation(validation);
    return [...DataFields, ...searchFields];
  };

  const saveHandler = (data: any) => {
    if (props.handleSave && data.updateSavedSearch) props.handleSave(data.updateSavedSearch);
  };

  return (
    <FormLayout
      {...queries}
      match={match}
      states={states}
      setStates={setStates}
      setPayload={setPayload}
      validationSchema={FormSchema}
      listItemName="Collection"
      dialogMessage={dialogMessage}
      formFields={formFields.length > 0 ? formFields : getFields()}
      redirectionLink="collection"
      cancelLink="collection"
      linkParameter="id"
      listItem="savedSearch"
      icon={collectionIcon}
      languageSupport={false}
      advanceSearch={advanceSearch}
      button={button}
      type={type}
      afterSave={saveHandler}
    />
  );
};
