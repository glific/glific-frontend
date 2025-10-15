import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import ProfileIcon from 'assets/images/icons/Contact/Profile.svg?react';
import { CONTACT_STATUS, PROVIDER_STATUS } from 'common/constants';
import { FormLayout } from 'containers/Form/FormLayout';
import { Input } from 'components/UI/Form/Input/Input';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { GET_CONTACT, GET_PROFILE } from 'graphql/queries/Contact';
import { CREATE_CONTACT, UPDATE_CONTACT, DELETE_CONTACT, DELETE_CONTACT_PROFILE } from 'graphql/mutations/Contact';
import { GET_CURRENT_USER } from 'graphql/queries/User';
import { getDisplayName, isSimulator } from 'common/utils';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { FILTER_USERS } from 'graphql/queries/User';

const profileIcon = <ProfileIcon />;

export interface ProfileProps {
  redirectionLink: string;
  afterDelete?: any;
  removePhoneField?: boolean;
  multiProfileAttributes?: any;
}

export const Profile = ({
  redirectionLink,
  afterDelete,
  removePhoneField = false,
  multiProfileAttributes,
}: ProfileProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState(null);
  const [bspStatus, setBspStatus] = useState(null);
  const [languageId, setLanguageId] = useState('');
  const [hideRemoveBtn, setHideRemoveBtn] = useState(false);
  const { t } = useTranslation();
  const hasMultipleProfiles = multiProfileAttributes?.selectedProfile;

  const queries = {
    getItemQuery: hasMultipleProfiles ? GET_PROFILE : GET_CONTACT,
    createItemQuery: CREATE_CONTACT,
    updateItemQuery: UPDATE_CONTACT,
    deleteItemQuery: hasMultipleProfiles ? DELETE_CONTACT_PROFILE : DELETE_CONTACT,
  };
  const { id: contactIdParam } = useParams();

  const params = useParams();
  console.log('params', params);

  const { data, loading } = useQuery(GET_CURRENT_USER);
  console.log('data', data);
  const contactId = contactIdParam || data?.currentUser?.user?.contact?.id;
  console.log('contactId', contactId);

  const { data: userCheckData, loading: userLoading } = useQuery(FILTER_USERS, {
    variables: {
      filter: { contactId: contactId },
    },
    skip: !contactId,
  });

  console.log('userCheckData', userCheckData?.users?.length > 0);
  const userExists = userCheckData?.users?.length > 0;

  const updateName = () => {
    if (!hasMultipleProfiles) {
      return;
    }
    const { selectedProfile, selectedProfileId } = multiProfileAttributes;

    if (selectedProfileId === multiProfileAttributes.activeProfileId) {
      setName(`${selectedProfile.name} (currently active)`);
    } else {
      setName(selectedProfile.name);
    }
  };

  useEffect(() => {
    if (hasMultipleProfiles) {
      const { selectedProfile } = multiProfileAttributes;
      setLanguageId(selectedProfile?.language?.id);
      updateName();
    }
  }, [multiProfileAttributes]);

  if (loading) return <Loading />;

  const { user } = data.currentUser;
  const loggedInUserContactId = user.contact.id;
  const currentUserPhone = user.phone;
  const organizationPhone = user.organization.contact.phone;

  let currentContactId = loggedInUserContactId;
  if (params.id) {
    currentContactId = params.id;
  }

  const states: any = { name, phone, status, bspStatus, languageId };

  const setStates = ({
    name: nameValue,
    phone: phoneValue,
    status: statusValue,
    bspStatus: bspStatusValue,
    language: languageIdValue,
    fields: fieldsValue,
    contact: contactDetails,
  }: any) => {
    updateName();
    let hideDeleteButton = false;
    let displayName = getDisplayName({
      name: nameValue,
      fields: fieldsValue,
      phone: phoneValue,
    });

    if (!displayName) {
      displayName = 'N/A';
    }

    if (phoneValue) {
      setPhone(phoneValue);
      hideDeleteButton = organizationPhone === phoneValue || isSimulator(phoneValue);
    } else {
      // contact api does not return the phone when role is staff, hence in this case we manually set the phone
      // for the current user
      setPhone(currentUserPhone);
      hideDeleteButton = organizationPhone === currentUserPhone;
    }

    if (hasMultipleProfiles) {
      setStatus(contactDetails?.status);
      setBspStatus(contactDetails?.bspStatus);
    } else {
      setStatus(statusValue);
      setBspStatus(bspStatusValue);
    }

    setName(displayName);
    setHideRemoveBtn(hideDeleteButton);
    setLanguageId(languageIdValue.id);
  };

  const FormSchema = Yup.object().shape({
    name: Yup.string().required(t('Name is required.')),
  });

  const formFields = [
    {
      component: Input,
      name: 'name',
      type: 'text',
      disabled: true,
      label: t('Name'),
      placeholder: t('Name'),
    },
    {
      component: Input,
      name: 'phone',
      placeholder: t('Phone Number'),
      label: t('Phone Number'),
      disabled: true,
      skip: removePhoneField,
      skipPayload: true,
    },
    {
      component: AutoComplete,
      name: 'status',
      placeholder: t('Status'),
      label: t('Status'),
      options: CONTACT_STATUS,
      optionLabel: 'label',
      disabled: true,
      skipPayload: true,
      handleCreateItem: () => {},
      multiple: false,
    },
    {
      component: AutoComplete,
      name: 'bspStatus',
      placeholder: t('Provider status'),
      label: t('Provider status'),
      options: PROVIDER_STATUS,
      optionLabel: 'label',
      disabled: true,
      skipPayload: true,
      handleCreateItem: () => {},
      multiple: false,
    },
  ];

  let type: any;
  const pageTitle = t('Contact Profile');
  console.log('useer', userExists);

  const isDefaultProfile = hasMultipleProfiles && multiProfileAttributes.selectedProfile?.is_default;

  console.log('hasMultupleprofile', hasMultipleProfiles);
  let dialogMessage;

  if (isDefaultProfile) {
    dialogMessage = t('Deleting default profile will delete the contact. This is irreversible.');
  } else if (userExists) {
    dialogMessage = t('Deleting this contact will also delete the corresponding user.');
  } else {
    dialogMessage = t("You won't be able to send messages to this contact.");
  }

  console.log(dialogMessage);

  return (
    <FormLayout
      {...queries}
      partialPage
      states={states}
      setStates={setStates}
      validationSchema={FormSchema}
      listItemName={hasMultipleProfiles ? 'Contact profile' : 'Contact'}
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink={redirectionLink}
      listItem={hasMultipleProfiles ? 'profile' : 'contact'}
      icon={profileIcon}
      afterDelete={afterDelete}
      type={type}
      languageAttributes={hasMultipleProfiles ? { disabled: true } : {}}
      title={pageTitle}
      entityId={hasMultipleProfiles ? multiProfileAttributes?.selectedProfileId : currentContactId}
      restrictDelete={hideRemoveBtn}
      noHeading
    />
  );
};
