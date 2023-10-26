import { useState } from 'react';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { FormLayout } from 'containers/Form/FormLayout';
import { Input } from 'components/UI/Form/Input/Input';
import FlowIcon from 'assets/images/icons/Flow/Selected.svg?react';
import { setErrorMessage } from 'common/notification';
import styles from './Tag.module.css';
import { GET_TAG } from 'graphql/queries/Tags';
import { CREATE_LABEL, DELETE_TAG, UPDATE_TAG } from 'graphql/mutations/Tags';

const tagIcon = <FlowIcon className={styles.FlowIcon} />;

const queries = {
  getItemQuery: GET_TAG,
  createItemQuery: CREATE_LABEL,
  updateItemQuery: UPDATE_TAG,
  deleteItemQuery: DELETE_TAG,
};

export const Tag = () => {
  const [label, setLabel] = useState('');
  const { t } = useTranslation();

  const states = { label };

  const setStates = ({ label: nameValue }: any) => {
    // Override label & keywords when creating Flow Copy
    let fieldName = nameValue;

    setLabel(fieldName);
  };

  const FormSchema = Yup.object().shape({
    label: Yup.string().required(t('Name is required.')),
  });

  const dialogMessage = t("You won't be able to use this tag.");

  const formFields = [
    {
      component: Input,
      name: 'label',
      type: 'text',
      placeholder: t('Name'),
      label: t('Name'),
    },
  ];

  const setPayload = (payload: any) => {
    payload = { ...payload, language_id: '1' };
    // return modified payload
    return payload;
  };

  const customHandler = (data: any) => {
    let dataCopy = data;
    if (data[0].key === 'keywords') {
      const error: { message: any }[] = [];
      const messages = dataCopy[0].message.split(',');
      messages.forEach((message: any) => {
        error.push({ message });
      });
      dataCopy = error;
    }
    setErrorMessage({ message: dataCopy }, t('Sorry! An error occurred!'));
  };

  return (
    <FormLayout
      {...queries}
      states={states}
      roleAccessSupport
      setStates={setStates}
      setPayload={setPayload}
      validationSchema={FormSchema}
      listItemName="tag"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink="tag"
      cancelLink="tag"
      listItem="tag"
      icon={tagIcon}
      languageSupport={false}
      customHandler={customHandler}
    />
  );
};

export default Tag;
