import { useState } from 'react';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { FormLayout } from 'containers/Form/FormLayout';
import { Input } from 'components/UI/Form/Input/Input';
import { ReactComponent as FlowIcon } from 'assets/images/icons/Flow/Selected.svg';
import { setErrorMessage } from 'common/notification';
import styles from './Tag.module.css';
import { GET_TAG } from 'graphql/queries/Tags';
import { CREATE_LABEL, DELETE_TAG, UPDATE_TAG } from 'graphql/mutations/Tags';

const flowIcon = <FlowIcon className={styles.FlowIcon} />;

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

  const dialogMessage = '';

  const formFields = [
    {
      component: Input,
      name: 'label',
      type: 'text',
      placeholder: t('Name'),
    },
  ];

  const setPayload = (payload: any) => {
    console.log('payload', payload);
    payload = { ...payload, Language_id: '1' };
    // return modified payload
    return payload;
  };

  // alter header & update/copy queries
  let title;
  let type;

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
      linkParameter="uuid"
      listItem="tag"
      icon={flowIcon}
      languageSupport={false}
      title={title}
      type={type}
      customHandler={customHandler}
    />
  );
};

export default Tag;
