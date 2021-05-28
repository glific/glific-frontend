import React, { useState } from 'react';
import { Dialog, DialogContent } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import styles from './Extensions.module.css';
import {
  CREATE_EXTENSION,
  DELETE_EXTENSION,
  UPDATE_EXTENSION,
} from '../../graphql/mutations/Extensions';
import { GET_ORGANIZATION_EXTENSION } from '../../graphql/queries/Exntesions';
import { Input } from '../../components/UI/Form/Input/Input';
import { OrganizationList } from '../OrganizationList/OrganizationList';
import { ReactComponent as ConsultingIcon } from '../../assets/images/icons/icon-consulting.svg';
import { FormLayout } from '../Form/FormLayout';
import { Checkbox } from '../../components/UI/Form/Checkbox/Checkbox';

export interface ExtensionProps {
  match: any;
  openDialog: boolean;
}
const flowIcon = <ConsultingIcon />;
const queries = {
  getItemQuery: GET_ORGANIZATION_EXTENSION,
  createItemQuery: CREATE_EXTENSION,
  updateItemQuery: UPDATE_EXTENSION,
  deleteItemQuery: DELETE_EXTENSION,
};
export const Extensions: React.SFC<ExtensionProps> = ({ match, openDialog }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isActive, setIsActive] = useState(false);
  const { t } = useTranslation();

  const states = { name, code, isActive };
  const setStates = ({ name: nameValue, code: codeValue, isActive: isActiveValue }: any) => {
    setName(nameValue);
    setCode(codeValue);
    setIsActive(isActiveValue);
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
    {
      component: Checkbox,
      name: 'isActive',
      title: (
        <Typography variant="body2" style={{ color: '#93A29B' }}>
          {t('Is active?')}
        </Typography>
      ),
      onchange: (event: any) => setIsActive(event.target.value),
    },
  ];

  // title depends on if data is already present
  const title = name && code ? 'Edit extension code' : 'Add extension code';

  const setPayload = (payload: any) => {
    const data = { ...payload };
    if (match.params.id) {
      data.clientId = match.params.id;
    }
    return data;
  };
  return (
    <>
      <OrganizationList />
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
            idType="clientId"
            customStyles={[styles.Form]}
            refetchQueries={[
              { query: GET_ORGANIZATION_EXTENSION, variables: { clientId: match.params.id } },
            ]}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Extensions;
