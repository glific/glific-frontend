import { Typography } from '@mui/material';
import { Input } from 'components/UI/Form/Input/Input';
import { FormLayout } from 'containers/Form/FormLayout';
import { CREATE_COLLECTION, DELETE_COLLECTION, UPDATE_COLLECTION } from 'graphql/mutations/Collection';
import { GET_COLLECTION } from 'graphql/queries/Collection';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import PollsIcon from 'assets/images/Polls.svg?react';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import styles from './WaPolls.module.css';
import { WaPollOptions } from './WaPollOptions/WaPollOptions';
const queries = {
  getItemQuery: GET_COLLECTION,
  createItemQuery: CREATE_COLLECTION,
  updateItemQuery: UPDATE_COLLECTION,
  deleteItemQuery: DELETE_COLLECTION,
};
const pollsIcon = <PollsIcon />;

export const WaPolls = () => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultiple, setAllowMultiple] = useState<boolean>(false);

  const { t } = useTranslation();
  const states = {
    title,
    content,
    options,
    allowMultiple,
  };

  const setPayload = (payload: any) => {
    console.log(payload);
    return payload;
  };
  const setStates = (payload: any) => {};

  const FormSchema = Yup.object().shape({
    title: Yup.string().required(t('Title is required.')).max(50, t('Title is too long.')),
    content: Yup.string().required('Content is required.').max(150, 'Content is too long.'),
    options: Yup.array().of(Yup.string().required('Required')).min(2, 'At least two options are required'),
  });

  const dialogMessage = "You won't be able to use this poll again.";

  const formFields = [
    {
      component: Input,
      name: 'title',
      type: 'text',
      label: t('Title'),
    },

    {
      component: Input,
      name: 'content',
      type: 'text',
      label: 'Content',
      textArea: true,
      rows: 6,
    },
    {
      component: WaPollOptions,
      name: 'options',
    },
    {
      component: Checkbox,
      name: 'allowMultiple',
      title: (
        <Typography className={styles.AllowMultiple} variant="h6">
          Allow multiple options
        </Typography>
      ),
      darkCheckbox: true,
    },
  ];

  return (
    <FormLayout
      roleAccessSupport
      states={states}
      setPayload={setPayload}
      languageSupport={false}
      setStates={setStates}
      validationSchema={FormSchema}
      listItemName="collection"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink={'group/polls'}
      listItem="polls"
      icon={pollsIcon}
      backLinkButton={`/group/polls`}
      {...queries}
    />
  );
};

export default WaPolls;
