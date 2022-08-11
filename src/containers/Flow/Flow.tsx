import React, { useState } from 'react';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import { FormLayout } from 'containers/Form/FormLayout';
import { Input } from 'components/UI/Form/Input/Input';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { ReactComponent as FlowIcon } from 'assets/images/icons/Flow/Selected.svg';
import { CREATE_FLOW, UPDATE_FLOW, DELETE_FLOW, CREATE_FLOW_COPY } from 'graphql/mutations/Flow';
import { GET_ORGANIZATION } from 'graphql/queries/Organization';
import { GET_FLOW } from 'graphql/queries/Flow';
import { setErrorMessage } from 'common/notification';
import Loading from 'components/UI/Layout/Loading/Loading';
import { getUserSession } from 'services/AuthService';
import { checkDynamicRole } from 'context/role';
import styles from './Flow.module.css';

export interface FlowProps {
  match: any;
}

const flowIcon = <FlowIcon className={styles.FlowIcon} />;

const queries = {
  getItemQuery: GET_FLOW,
  createItemQuery: CREATE_FLOW,
  updateItemQuery: UPDATE_FLOW,
  deleteItemQuery: DELETE_FLOW,
};

export const Flow: React.SFC<FlowProps> = ({ match }) => {
  const location = useLocation();
  const [name, setName] = useState('');
  const [isPinnedDisable, setIsPinnedDisable] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const [roles, setRoles] = useState<Array<any>>([]);
  const [isBackground, setIsBackground] = useState(false);
  const [ignoreKeywords, setIgnoreKeywords] = useState(false);
  const { t } = useTranslation();

  const { loading, data: orgData } = useQuery(GET_ORGANIZATION, {
    variables: {},
    fetchPolicy: 'network-only',
  });

  if (loading) return <Loading />;

  const states = { isActive, isPinned, isBackground, name, keywords, ignoreKeywords, roles };

  const setStates = ({
    name: nameValue,
    keywords: keywordsValue,
    isActive: isActiveValue,
    isPinned: isPinnedValue,
    isBackground: isBackgroundValue,
    ignoreKeywords: ignoreKeywordsValue,
    roles: rolesValue,
  }: any) => {
    // Override name & keywords when creating Flow Copy
    let fieldName = nameValue;
    let fieldKeywords = keywordsValue;
    if (location.state === 'copy') {
      fieldName = `Copy of ${nameValue}`;
      fieldKeywords = '';
    }

    const {
      organization: {
        organization: { newcontactFlowId },
      },
    } = orgData;
    const flowId: string = match?.params?.id;
    if (flowId === newcontactFlowId) {
      setIsPinnedDisable(true);
    }

    setName(fieldName);
    setIsActive(isActiveValue);
    setIsPinned(isPinnedValue);
    setIsBackground(isBackgroundValue);
    setRoles(rolesValue);

    // we are receiving keywords as an array object
    if (fieldKeywords.length > 0) {
      // lets display it comma separated
      setKeywords(fieldKeywords.join(','));
    }
    setIgnoreKeywords(ignoreKeywordsValue);
  };

  const regex =
    /^\s*[^-!$%^&*()+|~=`{}[\]:";'<>?,./]+\s*(,\s*[^-!$%^&*()+|~=`{}[\]:";'<>?,./]+\s*)*$/g;

  const FormSchema = Yup.object().shape({
    name: Yup.string().required(t('Name is required.')),
    keywords: Yup.string().matches(regex, t('Sorry, special characters are not allowed.')),
  });

  const dialogMessage = t("You won't be able to use this flow again.");

  const additionalAction = { label: t('Configure'), link: '/flow/configure' };

  const formFields = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      placeholder: t('Name'),
    },
    {
      component: Input,
      name: 'keywords',
      type: 'text',
      placeholder: t('Keywords'),
      helperText: t('Enter comma separated keywords that trigger this flow'),
    },
    {
      component: Checkbox,
      name: 'ignoreKeywords',
      title: t('Ignore Keywords'),
      info: {
        title: t(
          'If activated, users will not be able to change this flow by entering keyword for any other flow.'
        ),
      },
      darkCheckbox: true,
    },
    {
      component: Checkbox,
      name: 'isActive',
      title: t('Is active?'),
      darkCheckbox: true,
    },
    {
      component: Checkbox,
      name: 'isPinned',
      title: t('Is pinned?'),
      darkCheckbox: true,
      disabled: isPinnedDisable,
    },
    {
      component: Checkbox,
      name: 'isBackground',
      title: t('Run this flow in the background'),
      darkCheckbox: true,
    },
  ];

  const setPayload = (payload: any) => {
    let formattedKeywords;

    if (payload.keywords) {
      // remove white spaces
      const inputKeywords = payload.keywords.replace(/[\s]+/g, '');
      // convert to array
      formattedKeywords = inputKeywords.split(',');
    }

    const initialSelectedRoles = roles.map((role: any) => role.id);
    const payloadRoleIds = payload.roles.map((role: any) => role.id);

    let addRoleIds = payloadRoleIds.filter(
      (selectedRoles: any) => !initialSelectedRoles.includes(selectedRoles)
    );
    const deleteRoleIds = initialSelectedRoles.filter(
      (roleId: any) => !payloadRoleIds.includes(roleId)
    );

    if (checkDynamicRole()) {
      const userRoles = getUserSession('roles').map((role: any) => role.id);
      addRoleIds = [...addRoleIds, ...userRoles];
    }

    const { roles: userRoles, ...rest } = payload;

    // return modified payload
    return {
      ...rest,
      addRoleIds,
      deleteRoleIds,
      keywords: formattedKeywords,
    };
  };

  // alter header & update/copy queries
  let title;
  let type;
  if (location.state === 'copy') {
    queries.updateItemQuery = CREATE_FLOW_COPY;
    title = t('Copy flow');
    type = 'copy';
  } else {
    queries.updateItemQuery = UPDATE_FLOW;
  }

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
      match={match}
      states={states}
      roleAccessSupport
      setStates={setStates}
      setPayload={setPayload}
      validationSchema={FormSchema}
      listItemName="flow"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink="flow"
      cancelLink="flow"
      linkParameter="uuid"
      listItem="flow"
      icon={flowIcon}
      additionalAction={additionalAction}
      languageSupport={false}
      title={title}
      type={type}
      copyNotification={t('Copy of the flow has been created!')}
      customHandler={customHandler}
    />
  );
};

export default Flow;
