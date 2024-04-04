import { useState, useEffect } from 'react';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { Input } from 'components/UI/Form/Input/Input';
import { FormLayout } from 'containers/Form/FormLayout';
import { GET_COLLECTION, GET_COLLECTION_USERS, GET_COLLECTIONS } from 'graphql/queries/Collection';
import { GET_USERS } from 'graphql/queries/User';
import {
  UPDATE_COLLECTION,
  CREATE_COLLECTION,
  DELETE_COLLECTION,
  UPDATE_COLLECTION_USERS,
} from 'graphql/mutations/Collection';
import { getAddOrRemoveRoleIds } from 'common/utils';
import { SEARCH_QUERY } from 'graphql/queries/Search';
import CollectionIcon from 'assets/images/icons/StaffManagement/Active.svg?react';
import ContactIcon from 'assets/images/icons/Contact/View.svg?react';
import {
  COLLECTION_SEARCH_QUERY_VARIABLES,
  CONTACTS_COLLECTION,
  GROUP_COLLECTION_SEARCH_QUERY_VARIABLES,
  WA_GROUPS_COLLECTION,
  setVariables,
} from 'common/constants';
import styles from './Collection.module.css';
import { collectionInfo } from 'common/HelpData';
import { GROUP_SEARCH_QUERY } from 'graphql/queries/WaGroups';
import { Loading } from 'components/UI/Layout/Loading/Loading';

export const Collection = () => {
  const [selectedUsers, { data: collectionUsers }] = useLazyQuery(GET_COLLECTION_USERS, {
    fetchPolicy: 'cache-and-network',
  });
  const params = useParams();
  const collectionId = params.id ? params.id : null;
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selected, setSelected] = useState([]);
  const { t } = useTranslation();
  const location = useLocation();
  const groups: boolean = location.pathname.includes('group');
  const redirectLink = groups ? 'group/collection' : 'collection';
  const groupType = groups ? WA_GROUPS_COLLECTION : CONTACTS_COLLECTION;
  const searchQuery = groups ? GROUP_SEARCH_QUERY : SEARCH_QUERY;
  const searchVariables = groups
    ? GROUP_COLLECTION_SEARCH_QUERY_VARIABLES
    : COLLECTION_SEARCH_QUERY_VARIABLES;

  const [updateCollectionUsers] = useMutation(UPDATE_COLLECTION_USERS);

  const updateUsers = (collectionIdValue: any) => {
    const initialSelectedUsers = users.map((user: any) => user.id);
    const finalSelectedUsers = selected.map((user: any) => user.id);
    const selectedUsersData = finalSelectedUsers.filter(
      (user: any) => !initialSelectedUsers.includes(user)
    );
    const removedUsers = initialSelectedUsers.filter(
      (contact: any) => !finalSelectedUsers.includes(contact)
    );

    if (selectedUsersData.length > 0 || removedUsers.length > 0) {
      updateCollectionUsers({
        variables: {
          input: {
            addUserIds: selectedUsersData,
            groupId: collectionIdValue,
            deleteUserIds: removedUsers,
          },
        },
      });
    }
  };

  const { data } = useQuery(GET_USERS, {
    variables: setVariables(),
  });

  const { data: collectionList, loading } = useQuery(GET_COLLECTIONS);

  useEffect(() => {
    if (collectionId) {
      selectedUsers({ variables: { id: collectionId } });
    }
  }, [selectedUsers, collectionId]);

  useEffect(() => {
    if (collectionUsers) setUsers(collectionUsers.group.group.users);
  }, [collectionUsers]);

  const states = { label, description, users, roles };

  const setStates = ({
    label: labelValue,
    description: descriptionValue,
    roles: rolesValue,
  }: any) => {
    setLabel(labelValue);
    setDescription(descriptionValue);
    setRoles(rolesValue);
  };

  const additionalState = (user: any) => {
    setSelected(user);
  };

  const refetchQueries = [
    {
      query: GET_COLLECTIONS,
      variables: setVariables({ groupType }),
    },
    {
      query: searchQuery,
      variables: searchVariables,
    },
  ];

  const validateTitle = (value: any) => {
    let error;
    if (value) {
      let found = [];

      if (collectionList) {
        found = collectionList.groups.filter((search: any) => search.label === value);
        if (collectionId && found.length > 0) {
          found = found.filter((search: any) => search.id !== collectionId);
        }
      }
      if (found.length > 0) {
        error = t('Title already exists.');
      }
    }
    return error;
  };

  const FormSchema = Yup.object().shape({
    label: Yup.string().required(t('Title is required.')).max(50, t('Title is too long.')),
  });

  const dialogMessage = t("You won't be able to use this collection again.");

  const formFields = [
    {
      component: Input,
      name: 'label',
      type: 'text',
      label: t('Title'),
      validate: validateTitle,
    },
    {
      component: Input,
      name: 'description',
      type: 'text',
      label: t('Description'),
      rows: 3,
      textArea: true,
    },
    {
      component: AutoComplete,
      name: 'users',
      additionalState: 'users',
      options: data ? data.users : [],
      optionLabel: 'name',
      label: t('Assign staff to collection'),
      skipPayload: true,
      icon: <ContactIcon className={styles.ContactIcon} />,
      helperText: t(
        'Assigned staff members will be responsible to chat with contacts in this collection'
      ),
    },
  ];

  const collectionIcon = <CollectionIcon className={styles.CollectionIcon} />;

  const queries = {
    getItemQuery: GET_COLLECTION,
    createItemQuery: CREATE_COLLECTION,
    updateItemQuery: UPDATE_COLLECTION,
    deleteItemQuery: DELETE_COLLECTION,
  };

  const setPayload = (payload: any) => {
    let payloadWithRoleIdsAndType = getAddOrRemoveRoleIds(roles, payload);
    payloadWithRoleIdsAndType = {
      ...payloadWithRoleIdsAndType,
      groupType: groups ? WA_GROUPS_COLLECTION : CONTACTS_COLLECTION,
    };
    return payloadWithRoleIdsAndType;
  };

  if (loading) return <Loading />;

  return (
    <FormLayout
      refetchQueries={refetchQueries}
      additionalQuery={updateUsers}
      roleAccessSupport
      {...queries}
      states={states}
      setPayload={setPayload}
      additionalState={additionalState}
      languageSupport={false}
      setStates={setStates}
      validationSchema={FormSchema}
      listItemName="collection"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink={redirectLink}
      listItem="group"
      icon={collectionIcon}
      helpData={collectionInfo}
      backLinkButton={`/${redirectLink}`}
    />
  );
};

export default Collection;
