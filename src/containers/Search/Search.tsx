import { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useQuery } from '@apollo/client';
import dayjs from 'dayjs';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import SearchIcon from 'assets/images/icons/Search/SelectedEdit.svg?react';
import LabelIcon from 'assets/images/icons/Label/Selected.svg?react';
import { GET_SEARCH } from 'graphql/queries/Search';
import { CREATE_SEARCH, UPDATE_SEARCH, DELETE_SEARCH } from 'graphql/mutations/Search';
import { GET_COLLECTIONS } from 'graphql/queries/Collection';
import { GET_USERS } from 'graphql/queries/User';
import { GET_ALL_FLOW_LABELS } from 'graphql/queries/FlowLabel';
import { FormLayout } from 'containers/Form/FormLayout';
import { Input } from 'components/UI/Form/Input/Input';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Calendar } from 'components/UI/Form/Calendar/Calendar';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import Loading from 'components/UI/Layout/Loading/Loading';
import { DEFAULT_CONTACT_LIMIT, DEFAULT_MESSAGE_LIMIT, setVariables } from 'common/constants';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { getObject } from 'common/utils';
import styles from './Search.module.css';

export interface SearchProps {
  type?: string;
  search?: any;
  handleCancel?: any;
  handleSave?: any;
  searchParam?: any;
  setState?: any;
  searchId?: string | null;
}

const getPayload = (payload: any) => {
  const {
    label,
    shortcode,
    term,
    includeGroups,
    includeUsers,
    includeLabels,
    dateFrom,
    dateTo,
    dateToExpression,
    dateFromExpression,
    useExpression,
  } = payload;

  const args = {
    contactOpts: {
      offset: 0,
      limit: DEFAULT_CONTACT_LIMIT,
    },
    filter: {
      term,
      includeGroups: includeGroups ? includeGroups.map((option: any) => option.id) : [],
      includeUsers: includeUsers ? includeUsers.map((option: any) => option.id) : [],
      includeLabels: includeLabels ? includeLabels.map((option: any) => option.id) : [],
    },
    messageOpts: {
      offset: 0,
      limit: DEFAULT_MESSAGE_LIMIT,
    },
  };

  if (!useExpression && dateFrom && dateFrom !== 'Invalid date') {
    const dateRange = {
      dateRange: {
        to: dayjs(dateTo).format('yyyy-MM-DD'),
        from: dayjs(dateFrom).format('yyyy-MM-DD'),
      },
    };
    args.filter = Object.assign(args.filter, dateRange);
  }

  if (useExpression && dateFromExpression) {
    const dateExpression = {
      dateExpression: {
        toExpression: dateToExpression,
        fromExpression: dateFromExpression,
      },
    };
    args.filter = Object.assign(args.filter, dateExpression);
  }

  return {
    label,
    shortcode,
    args: JSON.stringify(args),
  };
};

let FormSchema = Yup.object().shape({});

const searchIcon = <SearchIcon className={styles.SearchIcon} />;

const queries = {
  getItemQuery: GET_SEARCH,
  createItemQuery: CREATE_SEARCH,
  updateItemQuery: UPDATE_SEARCH,
  deleteItemQuery: DELETE_SEARCH,
};

export const Search = ({ type, search, searchId, ...props }: SearchProps) => {
  const { searchParam } = props;
  const [shortcode, setShortcode] = useState('');
  const [label, setLabel] = useState('');
  const [term, setTerm] = useState('');
  const [includeGroups, setIncludeGroups] = useState([]);
  const [infoDialog, setInfoDialog] = useState(false);
  const [includeUsers, setIncludeUsers] = useState([]);
  const [includeLabels, setIncludeLabels] = useState([]);
  const [dateFrom, setdateFrom] = useState<any>(null);
  const [dateTo, setdateTo] = useState<any>(null);
  const [useExpression, setUseExpression] = useState(false);
  const [dateFromExpression, setdateFromExpression] = useState(null);
  const [dateToExpression, setdateToExpression] = useState(null);
  const [formFields, setFormFields] = useState<any>([]);
  const [button, setButton] = useState<string>('Save');
  const { t } = useTranslation();

  const validation = {
    shortcode: Yup.string().required(t('Title is required.')).max(20, t('Title is too long.')),
    label: Yup.string().required(t('Description is required.')),
  };

  const dialogMessage = t("You won't be able to use this search again.");

  const states = {
    shortcode,
    label,
    useExpression,
    term,
    includeGroups,
    includeUsers,
    includeLabels,
    dateFrom,
    dateTo,
    dateFromExpression,
    dateToExpression,
  };

  const { data } = useQuery(GET_COLLECTIONS, {
    variables: setVariables(),
  });

  const { data: dataUser } = useQuery(GET_USERS, {
    variables: setVariables(),
  });

  const { data: dataLabels } = useQuery(GET_ALL_FLOW_LABELS, {
    variables: setVariables(),
  });

  /* istanbul ignore next */
  const setArgs = (args: any) => {
    const filters = JSON.parse(args);
    Object.keys(filters.filter).map((key) => {
      switch (key) {
        case 'includeGroups':
          if (Object.prototype.hasOwnProperty.call(filters.filter, 'includeGroups'))
            if (data) {
              setIncludeGroups(getObject(data.groups, filters.filter.includeGroups));
            }
          break;
        case 'includeUsers':
          if (Object.prototype.hasOwnProperty.call(filters.filter, 'includeUsers'))
            if (dataUser) {
              setIncludeUsers(getObject(dataUser.users, filters.filter.includeUsers));
            }
          break;
        case 'dateRange':
          if (Object.prototype.hasOwnProperty.call(filters.filter, 'dateRange')) {
            setdateFrom(new Date(filters.filter.dateRange.from));
            setdateTo(new Date(filters.filter.dateRange.to));
            setdateFromExpression(filters.filter.dateRange.from);
            setdateToExpression(filters.filter.dateRange.to);
          }
          break;

        case 'dateExpression':
          if (Object.prototype.hasOwnProperty.call(filters.filter, 'dateExpression')) {
            setdateFromExpression(filters.filter.dateExpression.fromExpression);
            setdateToExpression(filters.filter.dateExpression.toExpression);
            setUseExpression(true);
          }
          break;
        case 'term':
          setTerm(filters.filter.term);
          break;
        case 'includeLabels':
          if (Object.prototype.hasOwnProperty.call(filters.filter, 'includeLabels'))
            if (dataLabels) {
              setIncludeLabels(getObject(dataLabels.flowLabels, filters.filter.includeLabels));
            }
          break;
        default:
          break;
      }
      return null;
    });
  };

  const setStates = ({ shortcode: shortcodeValue, label: labelValue, args: argsValue }: any) => {
    setShortcode(shortcodeValue);
    setLabel(labelValue);
    setArgs(argsValue);
  };

  const restoreSearch = () => {
    const args = {
      contactOpts: {
        offset: 0,
        limit: DEFAULT_CONTACT_LIMIT,
      },
      filter: {
        term: props.searchParam.term,
        includeGroups: props.searchParam.includeGroups
          ? props.searchParam.includeGroups.map((option: any) => option.id)
          : [],
        includeUsers: props.searchParam.includeUsers
          ? props.searchParam.includeUsers.map((option: any) => option.id)
          : [],
        includeLabels: props.searchParam.includeLabels
          ? props.searchParam.includeLabels.map((option: any) => option.id)
          : [],
      },
      messageOpts: {
        offset: 0,
        limit: DEFAULT_MESSAGE_LIMIT,
      },
    };

    if (props.searchParam.dateFrom && props.searchParam.dateFrom !== 'Invalid date') {
      const dateRange = {
        dateRange: {
          to: dayjs(props.searchParam.dateTo).format('yyyy-MM-DD'),
          from: dayjs(props.searchParam.dateFrom).format('yyyy-MM-DD'),
        },
      };
      args.filter = Object.assign(args.filter, dateRange);
    }

    if (props.searchParam.dateFromExpression) {
      const dateExpression = {
        dateExpression: {
          toExpression: props.searchParam.dateToExpression,
          fromExpression: props.searchParam.dateFromExpression,
        },
      };
      args.filter = Object.assign(args.filter, dateExpression);
    }
    // For create new search then label & shortcode should be empty
    // For update use existing label should not empty
    setStates({
      label: searchId ? props.searchParam.label : '',
      shortcode: searchId ? props.searchParam.shortcode : '',
      args: JSON.stringify(args),
    });
  };

  useEffect(() => {
    // Chat search:restore search's search
    if (searchParam && Object.keys(searchParam).length !== 0) {
      restoreSearch();
    }
  }, [searchParam]);

  if (!data || !dataUser || !dataLabels) return <Loading />;

  const DataFields = [
    {
      component: Input,
      name: 'shortcode',
      type: 'text',
      placeholder: t('Search Title'),
      inputProp: {
        onChange: (event: any) => {
          setShortcode(event.target.value);
        },
      },
    },
    {
      component: Input,
      name: 'label',
      type: 'text',
      placeholder: t('Description'),
      rows: 3,
      textArea: true,
      inputProp: {
        onChange: (event: any) => {
          setLabel(event.target.value);
        },
      },
    },
  ];

  const searchFields = [
    {
      component: Input,
      name: 'term',
      type: 'text',
      placeholder: t('Enter name, label, keyword'),
      inputProp: {
        onChange: (event: any) => {
          setTerm(event.target.value);
        },
      },
    },
    {
      component: AutoComplete,
      name: 'includeLabels',
      label: t('Includes labels'),
      options: dataLabels.flowLabels,
      optionLabel: 'name',
      textFieldProps: {
        variant: 'outlined',
      },
      icon: <LabelIcon stroke="#073f24" />,
      onChange: (val: any) => setIncludeLabels(val),
    },
    {
      component: AutoComplete,
      name: 'includeGroups',
      placeholder: t('Includes collections'),
      label: t('Includes collections'),
      options: data.groups,
      optionLabel: 'label',
      noOptionsText: t('No collections available'),
      textFieldProps: {
        variant: 'outlined',
      },
      onChange: (val: any) => setIncludeGroups(val),
    },
    {
      component: AutoComplete,
      name: 'includeUsers',
      placeholder: t('Includes staff'),
      label: t('Includes staff'),
      options: dataUser.users,
      optionLabel: 'name',
      textFieldProps: {
        variant: 'outlined',
      },
      onChange: (val: any) => setIncludeUsers(val),
    },
  ];

  const formWithCheckbox =
    type === 'search'
      ? searchFields
      : [
          ...searchFields,
          {
            component: Checkbox,
            name: 'useExpression',
            title: t('Use expression'),
            info: true,
            addLabelStyle: false,
            infoType: 'dialog',
            handleInfoClick: () => setInfoDialog(true),
            handleChange: (value: any) => setUseExpression(value),
            label: <span className={styles.DateRangeLabel}> {t('Date range')}</span>,
          },
        ];

  const formWithDate = [
    ...formWithCheckbox,
    {
      component: Calendar,
      name: 'dateFrom',
      type: 'date',
      placeholder: t('Date from'),
      disabled: useExpression,
      label: type === 'search' ? t('Date range') : null,
    },
    {
      component: Calendar,
      name: 'dateTo',
      type: 'date',
      disabled: useExpression,
      placeholder: t('Date to'),
    },
  ];

  const formWithExpression = [
    ...formWithCheckbox,
    {
      component: Input,
      name: 'dateFromExpression',
      placeholder: t('Date from expression'),
      type: 'text',
      disabled: !useExpression,
    },
    {
      component: Input,
      type: 'text',
      name: 'dateToExpression',
      placeholder: t('Date to expression'),
      disabled: !useExpression,
    },
  ];

  const finalSearchFields = useExpression ? formWithExpression : formWithDate;

  const setPayload = (payload: any) => {
    if (search) search(payload);
    return getPayload(payload);
  };

  const addFieldsValidation = (object: any) => {
    FormSchema = Yup.object().shape(object);
  };

  const advanceSearch = (dataType: any) => {
    // close dialogbox
    if (dataType === 'cancel') props.handleCancel();

    let heading;
    if (type === 'search') {
      heading = (
        <>
          <Typography variant="h5" className={styles.Title}>
            {t('Search conversations')}
          </Typography>
          <Typography variant="subtitle1" className={styles.Subtext}>
            {t('Apply more parameters to search for conversations.')}
          </Typography>
        </>
      );

      FormSchema = Yup.object().shape({});
    }

    if (type === 'saveSearch') {
      heading = (
        <Typography variant="h5" className={styles.Title}>
          {t('Save Search')}
        </Typography>
      );
      addFieldsValidation(validation);
    }

    if (formFields.length === 0) {
      if (type === 'search') {
        setFormFields([...finalSearchFields]);
        setButton('Search');
      }
      if (type === 'saveSearch') setFormFields(DataFields);
    }
    return {
      heading,
    };
  };

  const getFields = () => {
    addFieldsValidation(validation);
    return [...DataFields, ...finalSearchFields];
  };

  const saveHandler = (saveData: any) => {
    if (props.handleSave && saveData.updateSavedSearch)
      props.handleSave(saveData.updateSavedSearch);
  };
  let dialog;

  if (infoDialog) {
    dialog = (
      <DialogBox
        titleAlign="left"
        title={t('Use date expression')}
        skipCancel
        buttonOk={t('Close')}
        handleOk={() => setInfoDialog(false)}
      >
        <div className={styles.DialogContent}>
          You can use date expression for dynamic dates like ‘Last 2 days’ instead two days between
          two fixed dates. To get search results for ‘Last 2 days’ you need to use this function:
          <br />
          <br />
          <div className={styles.DialogTitleText}>Date from expression:</div>
          {`<%= Timex.shift(Timex.today() , days: -2) %>`}
          <div className={styles.DialogTitleText}>Date to expression:</div>
          {` <%= Timex.today() %>`}
          <br />
          <br />
          For ‘Last 3 days’ change ‘-2’ to ‘-3’ in Date from expression.
          <br />
          <br />
        </div>
      </DialogBox>
    );
  }

  const customStyles = type ? [styles.FormSearch] : [styles.Form];

  return (
    <>
      {dialog}
      <FormLayout
        {...queries}
        states={states}
        setStates={setStates}
        setPayload={setPayload}
        validationSchema={FormSchema}
        listItemName="Search"
        dialogMessage={dialogMessage}
        formFields={formFields.length > 0 ? formFields : getFields()}
        redirectionLink="search"
        cancelLink="search"
        linkParameter="id"
        listItem="savedSearch"
        icon={searchIcon}
        languageSupport={false}
        advanceSearch={advanceSearch}
        button={button}
        customStyles={customStyles}
        type={type}
        afterSave={saveHandler}
      />
    </>
  );
};

export default Search;
