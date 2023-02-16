import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { ReactComponent as ProfileIcon } from 'assets/images/icons/Contact/Profile.svg';
import { CONTACT_STATUS, PROVIDER_STATUS } from 'common/constants';
import { FormLayout } from 'containers/Form/FormLayout';
import { Dropdown } from 'components/UI/Form/Dropdown/Dropdown';
import { Input } from 'components/UI/Form/Input/Input';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { GET_CONTACT } from 'graphql/queries/Contact';
import {
  CREATE_CONTACT,
  UPDATE_CONTACT,
  DELETE_CONTACT,
  DELETE_CONTACT_PROFILE,
} from 'graphql/mutations/Contact';
import { GET_CURRENT_USER } from 'graphql/queries/User';
import { getOrganizationServices } from 'services/AuthService';
import { isSimulator } from 'common/utils';

const profileIcon = <ProfileIcon />;

export interface ProfileProps {
  profileType: string;
  redirectionLink: string;
  afterDelete?: any;
  removePhoneField?: boolean;
  multiProfileAttributes?: any;
}

export const Profile = ({
  profileType,
  redirectionLink,
  afterDelete,
  removePhoneField = false,
  multiProfileAttributes,
}: ProfileProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('');
  const [bspStatus, setBspStatus] = useState('');
  const [languageId, setLanguageId] = useState('');
  const [hideRemoveBtn, setHideRemoveBtn] = useState(false);
  const { t } = useTranslation();
  const isContactProfileEnabled = getOrganizationServices('contactProfileEnabled');
  const hasMultipleProfiles = multiProfileAttributes?.selectedProfile;

  const queries = {
    getItemQuery: GET_CONTACT,
    createItemQuery: CREATE_CONTACT,
    updateItemQuery: UPDATE_CONTACT,
    deleteItemQuery: hasMultipleProfiles ? DELETE_CONTACT_PROFILE : DELETE_CONTACT,
  };

  const params = useParams();

  const { data, loading } = useQuery(GET_CURRENT_USER);

  const updateName = () => {
    if (!isContactProfileEnabled || !hasMultipleProfiles) {
      return;
    }
    const { selectedProfile } = multiProfileAttributes;

    if (!selectedProfile) {
      return;
    }

    if (selectedProfile.id === multiProfileAttributes.activeProfileId) {
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
  }: any) => {
    setName(nameValue);
    updateName();
    let hideDeleteButton = false;

    if (phoneValue) {
      setPhone(phoneValue);
      hideDeleteButton = organizationPhone === phoneValue || isSimulator(phoneValue);
    } else {
      // contact api does not return the phone when role is staff, hence in this case we manually set the phone
      // for the current user
      setPhone(currentUserPhone);
      hideDeleteButton = organizationPhone === currentUserPhone;
    }

    setStatus(statusValue);
    setBspStatus(bspStatusValue);
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
      disabled: profileType === 'Contact',
      placeholder: t('Name'),
    },
    {
      component: Input,
      name: 'phone',
      placeholder: t('Phone Number'),
      disabled: true,
      skip: removePhoneField,
      skipPayload: true,
    },
    {
      component: Dropdown,
      name: 'status',
      placeholder: t('Status'),
      options: CONTACT_STATUS,
      disabled: true,
      skipPayload: true,
    },
    {
      component: Dropdown,
      name: 'bspStatus',
      placeholder: t('Provider status'),
      options: PROVIDER_STATUS,
      disabled: true,
      skipPayload: true,
    },
  ];

  if (isContactProfileEnabled && hasMultipleProfiles) {
    formFields.splice(0, 0, multiProfileAttributes);
  }

  let type: any;
  let pageTitle = t('Contact Profile');
  if (profileType === 'User' || loggedInUserContactId === currentContactId) {
    type = 'UserProfile';
    pageTitle = t('My Profile');
  }

  const dialogMessage = hasMultipleProfiles
    ? t("You won't be able to send messages to this profile.")
    : t("You won't be able to send messages to this contact.");

  return (
    <FormLayout
      {...queries}
      states={states}
      setStates={setStates}
      validationSchema={FormSchema}
      listItemName={hasMultipleProfiles ? 'Contact profile' : 'Contact'}
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink={redirectionLink}
      listItem="contact"
      icon={profileIcon}
      afterDelete={afterDelete}
      type={type}
      languageAttributes={hasMultipleProfiles ? { disabled: true } : {}}
      title={pageTitle}
      entityId={hasMultipleProfiles ? multiProfileAttributes?.selectedProfileId : currentContactId}
      restrictDelete={hideRemoveBtn}
    />
  );
};
