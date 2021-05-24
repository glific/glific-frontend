import React, { useState } from 'react';
import { Dialog, DialogContent } from '@material-ui/core';

import * as Yup from 'yup';

import { useTranslation } from 'react-i18next';

import {
  CREATE_EXTENSION,
  DELETE_EXTENSION,
  UPDATE_EXTENSION,
} from '../../graphql/mutations/Extensions';
import GET_EXTENSION from '../../graphql/queries/Exntesions';
import { Input } from '../../components/UI/Form/Input/Input';
import { ReactComponent as ConsultingIcon } from '../../assets/images/icons/icon-consulting.svg';

import { FormLayout } from '../Form/FormLayout';

import styles from './Extensions.module.css';

export interface ExtensionProps {
  match: any;
  openDialog: boolean;
}
const flowIcon = <ConsultingIcon />;
const queries = {
  getItemQuery: GET_EXTENSION,
  createItemQuery: CREATE_EXTENSION,
  updateItemQuery: UPDATE_EXTENSION,
  deleteItemQuery: DELETE_EXTENSION,
};
export const Extensions: React.SFC<ExtensionProps> = ({ match, openDialog }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const { t } = useTranslation();

  const states = { name, code };
  const setStates = ({ name: nameValue, code: codeValue }: any) => {
    setName(nameValue);
    setCode(codeValue);
  };
  const FormSchema = Yup.object().shape({
    name: Yup.string().required(t('Title is required.')),
    code: Yup.string().required(t('Code is required.')),
  });
  const dialogMessage = t("You won't be able to use this extension again.");
  const formFields = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      placeholder: t('Title'),
      inputProp: {
        onChange: (event: any) => setName(event.target.value),
      },
    },

    {
      component: Input,
      name: 'code',
      type: 'text',
      rows: 3,
      textArea: true,
      placeholder: t('Code snippet'),
      inputProp: {
        onChange: (event: any) => setCode(event.target.value),
      },
    },
  ];
  // check if data is already present
  const title = name && code ? 'Edit extension code' : 'Add extension code';

  const setPayload = (payload: any) => {
    const data = { ...payload };
    if (match.params.id) {
      data.clientId = match.params.id;
    }
    return data;
  };
  return (
    <Dialog
      open={!!openDialog}
      classes={{
        paper: styles.Dialogbox,
      }}
    >
      <DialogContent classes={{ root: styles.DialogContent }}>
        <FormLayout
          {...queries}
          match={match}
          states={states}
          setStates={setStates}
          validationSchema={FormSchema}
          listItemName="extension"
          dialogMessage={dialogMessage}
          formFields={formFields}
          setPayload={setPayload}
          redirectionLink="organizations"
          listItem="Extension"
          icon={flowIcon}
          title={title}
          type="Extension"
          languageSupport={false}
        />
      </DialogContent>
    </Dialog>
  );
};

export default Extensions;
