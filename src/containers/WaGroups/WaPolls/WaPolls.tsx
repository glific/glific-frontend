import { Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router';
import * as Yup from 'yup';

import PollsIcon from 'assets/images/Polls.svg?react';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { Input } from 'components/UI/Form/Input/Input';
import { FormLayout } from 'containers/Form/FormLayout';
import { COPY_POLL, CREATE_POLL, DELETE_POLL } from 'graphql/mutations/WaPolls';
import { GET_POLL } from 'graphql/queries/WaPolls';

import { WaPollOptions } from './WaPollOptions/WaPollOptions';
import styles from './WaPolls.module.css';

const queries = {
  getItemQuery: GET_POLL,
  createItemQuery: CREATE_POLL,
  deleteItemQuery: DELETE_POLL,
  updateItemQuery: COPY_POLL,
};
const pollsIcon = <PollsIcon />;

export const WaPolls = () => {
  const [label, setLabel] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [options, setOptions] = useState([
    { id: 0, name: '' },
    { id: 1, name: '' },
  ]);
  const [allowMultiple, setAllowMultiple] = useState<boolean>(false);
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();

  let isEditing = false;
  let isCopyState = false;
  if (params.id) {
    isEditing = true;
  }
  if (location.state === 'copy') {
    console.log('copy state');
    isCopyState = true;
    isEditing = false;
  }

  const states = {
    label,
    content,
    options,
    allowMultiple,
  };

  const setPayload = (payload: any) => {
    let payloadCopy = { ...payload };
    const poll_content = JSON.stringify({
      options: payload.options,
      text: payload.content,
    });
    payloadCopy = {
      ...payloadCopy,
      poll_content,
      allow_multiple_answer: payload.allowMultiple,
    };
    delete payloadCopy.options;
    delete payloadCopy.content;
    delete payloadCopy.allowMultiple;

    return payloadCopy;
  };
  const setStates = (states: any) => {
    const { label, pollContent, allowMultipleAnswer } = states;
    const { text, options } = JSON.parse(pollContent);
    let labelValue = label;
    if (isCopyState) {
      labelValue = `Copy of ${label}`;
    }

    setLabel(labelValue);
    setAllowMultiple(allowMultipleAnswer);
    setContent(text);
    setOptions(options);
  };

  const FormSchema = Yup.object().shape({
    label: Yup.string().required(t('Title is required.')).max(50, t('Title is too long.')),
    content: Yup.string().required('Content is required.').max(150, 'Content is too long.'),
    options: Yup.array()
      .of(Yup.object().shape({ name: Yup.string().required('Option is required.') }))
      .test('unique-values', 'Values must be unique', (array: any) => {
        const values = array.map((item: any) => item.name);
        return new Set(values).size === values.length;
      }),
  });

  const dialogMessage = "You won't be able to use this poll again.";

  const formFields = [
    {
      component: Input,
      name: 'label',
      type: 'text',
      label: t('Title'),
      disabled: isEditing,
    },

    {
      component: Input,
      name: 'content',
      type: 'text',
      label: 'Content',
      textArea: true,
      rows: 6,
      disabled: isEditing,
    },
    {
      component: WaPollOptions,
      name: 'options',
      isEditing,
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
      disabled: isEditing,
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
      listItemName="Poll"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink={'group/polls'}
      listItem="waPoll"
      icon={pollsIcon}
      backLinkButton={`/group/polls`}
      entityId={params.id}
      {...queries}
    />
  );
};

export default WaPolls;
