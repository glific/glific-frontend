import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@mui/material';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { CREATE_EXTENSION, DELETE_EXTENSION, UPDATE_EXTENSION } from 'graphql/mutations/Extensions';
import { GET_ORGANIZATION_EXTENSION } from 'graphql/queries/Extensions';
import { Input } from 'components/UI/Form/Input/Input';
import ExtensionIcon from 'assets/images/icons/extension.svg?react';
import { FormLayout } from 'containers/Form/FormLayout';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import styles from './Extensions.module.css';

export interface ExtensionProps {
  openDialog: boolean;
}
const extensionIcon = <ExtensionIcon />;
const queries = {
  getItemQuery: GET_ORGANIZATION_EXTENSION,
  createItemQuery: CREATE_EXTENSION,
  updateItemQuery: UPDATE_EXTENSION,
  deleteItemQuery: DELETE_EXTENSION,
};
export const Extensions = ({ openDialog }: ExtensionProps) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isActive, setIsActive] = useState(false);
  const { t } = useTranslation();

  const params = useParams();

  const states = { name, code, isActive };
  const setStates = ({ name: nameValue, code: codeValue, isActive: isActiveValue }: any) => {
    setName(nameValue);
    setCode(codeValue);
    setIsActive(isActiveValue);
  };

  useEffect(() => {
    if (!openDialog) {
      setName('');
      setCode('');
      setIsActive(false);
    }
  });

  const FormSchema = Yup.object().shape({
    name: Yup.string().required(t('Title is required.')),
    code: Yup.string().required(t('Code is required.')),
  });

  const dialogMessage = t("You won't be able to use this extension again.");
  const formFields = [
    {
      component: Checkbox,
      name: 'isActive',
      title: t('Is active?'),
      handleChange: (value: any) => setIsActive(value),
    },
    {
      component: Input,
      name: 'name',
      type: 'text',
      label: t('Title'),
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
      label: t('Code snippet'),
      inputProp: {
        onChange: (event: any) => setCode(event.target.value),
      },
    },
  ];

  // title depends on if data is already present
  const title = name && code ? 'Edit extension code' : 'Add extension code';

  const setPayload = (payload: any) => {
    const data = { ...payload };
    if (params.id) {
      data.clientId = params.id;
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
          withDialog
          {...queries}
          states={states}
          setStates={setStates}
          validationSchema={FormSchema}
          listItemName="extension"
          dialogMessage={dialogMessage}
          formFields={formFields}
          setPayload={setPayload}
          redirectionLink="organizations"
          listItem="Extension"
          icon={extensionIcon}
          title={title}
          type="Extension"
          languageSupport={false}
          idType="clientId"
          customStyles={[styles.Form]}
          refetchQueries={[
            { query: GET_ORGANIZATION_EXTENSION, variables: { clientId: params.id } },
          ]}
        />
      </DialogContent>
    </Dialog>
  );
};

export default Extensions;
