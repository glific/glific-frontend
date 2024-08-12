import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import ProfileIcon from 'assets/images/icons/Contact/Profile.svg?react';
import { CONTACT_STATUS, PROVIDER_STATUS } from 'common/constants';
import { FormLayout } from 'containers/Form/FormLayout';
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
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';

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
    fields: fieldsValue,
  }: any) => {
    updateName();
    let hideDeleteButton = false;
    let contactFields = JSON.parse(fieldsValue);
    let displayName = '';

    if (phoneValue) {
      setPhone(phoneValue);
      hideDeleteButton = organizationPhone === phoneValue || isSimulator(phoneValue);
    } else {
      // contact api does not return the phone when role is staff, hence in this case we manually set the phone
      // for the current user
      setPhone(currentUserPhone);
      hideDeleteButton = organizationPhone === currentUserPhone;
    }

    if (contactFields?.name?.value) {
      displayName = contactFields.name.value;
    } else if (nameValue) {
      displayName = nameValue;
    } else {
      displayName = 'N/A';
    }

    setName(displayName);
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

  const dialogMessage = hasMultipleProfiles
    ? t("You won't be able to send messages to this profile.")
    : t("You won't be able to send messages to this contact.");

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
      listItem="contact"
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
