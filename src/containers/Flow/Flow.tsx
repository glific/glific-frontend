import { useState } from 'react';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';

import { FormLayout } from 'containers/Form/FormLayout';
import { Input } from 'components/UI/Form/Input/Input';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import FlowIcon from 'assets/images/icons/Flow/Selected.svg?react';
import { CREATE_FLOW, UPDATE_FLOW, DELETE_FLOW, CREATE_FLOW_COPY } from 'graphql/mutations/Flow';
import { GET_ORGANIZATION } from 'graphql/queries/Organization';
import { GET_FLOW } from 'graphql/queries/Flow';
import { getAddOrRemoveRoleIds } from 'common/utils';
import { setErrorMessage } from 'common/notification';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import styles from './Flow.module.css';
import { GET_TAGS } from 'graphql/queries/Tags';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { CREATE_LABEL } from 'graphql/mutations/Tags';
import { flowInfo } from 'common/HelpData';

const flowIcon = <FlowIcon className={styles.FlowIcon} />;

const queries = {
  getItemQuery: GET_FLOW,
  createItemQuery: CREATE_FLOW,
  updateItemQuery: UPDATE_FLOW,
  deleteItemQuery: DELETE_FLOW,
};

export const Flow = () => {
  const location = useLocation();
  const params = useParams();
  const [name, setName] = useState('');
  const [isPinnedDisable, setIsPinnedDisable] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [description, setDescription] = useState('');
  const [tagId, setTagId] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const [roles, setRoles] = useState<Array<any>>([]);
  const [isBackground, setIsBackground] = useState(false);
  const [ignoreKeywords, setIgnoreKeywords] = useState(false);
  const { t } = useTranslation();

  const { data: tag } = useQuery(GET_TAGS, {
    variables: {},
    fetchPolicy: 'network-only',
  });
  const [createTag] = useMutation(CREATE_LABEL);

  const handleCreateLabel = async (value: string) => {
    return createTag({
      variables: {
        input: {
          label: value,
          languageId: '1',
        },
      },
    }).then((value) => value.data.createTag.tag);
  };

  const { loading, data: orgData } = useQuery(GET_ORGANIZATION, {
    variables: {},
    fetchPolicy: 'network-only',
  });

  if (loading) return <Loading />;

  const states = {
    isActive,
    isPinned,
    isBackground,
    name,
    keywords,
    description,
    tagId,
    ignoreKeywords,
    roles,
  };

  const setStates = ({
    name: nameValue,
    keywords: keywordsValue,
    description: descriptionValue,
    tag: tagValue,
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

    if (params.id === newcontactFlowId) {
      setIsPinnedDisable(true);
    }

    setName(fieldName);
    setIsActive(isActiveValue);
    setIsPinned(isPinnedValue);
    setIsBackground(isBackgroundValue);
    setRoles(rolesValue);
    setDescription(descriptionValue);

    // we are receiving keywords as an array object
    if (fieldKeywords.length > 0) {
      // lets display it comma separated
      setKeywords(fieldKeywords.join(','));
    }
    setIgnoreKeywords(ignoreKeywordsValue);
    const getTagId = tag && tag.tags.filter((tags: any) => tags.id === tagValue?.id);
    if (getTagId.length > 0) {
      setTagId(getTagId[0]);
    }
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
      label: t('Name'),
    },
    {
      component: Input,
      name: 'keywords',
      type: 'text',
      label: t('Keywords'),
      helperText: t('Enter comma separated keywords that trigger this flow.'),
    },
    {
      component: Input,
      name: 'description',
      type: 'text',
      textArea: true,
      rows: 2,
      label: t('Description'),
    },
    {
      component: AutoComplete,
      name: 'tagId',
      options: tag ? tag.tags : [],
      optionLabel: 'label',
      disabled: false,
      handleCreateItem: handleCreateLabel,
      hasCreateOption: true,
      multiple: false,
      label: t('Tag'),
      helperText: t('Use this to categorize your flows.'),
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
      className: styles.Checkbox,
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
      darkCheckbox: !isPinnedDisable,
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
    let formattedKeywords = [];

    if (payload.keywords) {
      // remove white spaces
      const inputKeywords = payload.keywords.replace(/[\s]+/g, '');
      // convert to array
      formattedKeywords = inputKeywords.split(',');
    }

    const payloadWithRoleIds = getAddOrRemoveRoleIds(roles, payload);

    let updatedPayload = {
      ...payloadWithRoleIds,
      keywords: formattedKeywords,
    };
    if (payload.tagId?.id) {
      updatedPayload = {
        ...updatedPayload,
        tag_id: payload.tagId.id,
      };
    }
    delete updatedPayload.tagId;
    // return modified payload
    return updatedPayload;
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
      helpData={flowInfo}
      backLinkButton="/flow"
    />
  );
};

export default Flow;
