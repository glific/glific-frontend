import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Box, Collapse } from '@mui/material';
import { useTranslation } from 'react-i18next';

import CollapseIcon from '../../../assets/images/icons/Collapse.svg?react';
import ExpandIcon from '../../../assets/images/icons/Expand.svg?react';
import { STANDARD_DATE_TIME_FORMAT } from 'common/constants';
import { getDisplayName } from 'common/utils';
import { getOrganizationServices } from 'services/AuthService';
import { GET_CONTACT_DETAILS, GET_CONTACT_PROFILES } from 'graphql/queries/Contact';
import Loading from 'components/UI/Layout/Loading/Loading';
import { AvatarDisplay } from 'components/UI/AvatarDisplay/AvatarDisplay';
import { ContactDescription } from './ContactDescription/ContactDescription';
import { Profile } from '../Profile';
import { ContactHistory } from './ContactHistory/ContactHistory';
import { Heading } from 'containers/Form/FormLayout';
import styles from './ContactProfile.module.css';

export const ContactProfile = () => {
  const params = useParams();
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [showProfileSection, setShowProfileSection] = useState('profile');
  const { t } = useTranslation();

  const isContactProfileEnabled = getOrganizationServices('contactProfileEnabled');
  const { loading, data } = useQuery(GET_CONTACT_DETAILS, { variables: { id: params.id } });

  const { loading: profileLoading, data: profileData } = useQuery(GET_CONTACT_PROFILES, {
    variables: { filter: { contactId: params.id } },
    skip: !isContactProfileEnabled,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (data) {
      setSelectedProfileId(data.contact.contact.activeProfile?.id);
    }
  }, [data]);

  if (loading || profileLoading) {
    return <Loading />;
  }

  let optin = false;
  let optout = false;

  const { contact } = data;
  const contactData = contact.contact;
  const { phone, maskedPhone, status, groups, lastMessage, settings, activeProfile } = contactData;
  let { fields } = contactData;

  const contactDisplayName = getDisplayName(contact);

  let selectedProfile;

  if (isContactProfileEnabled && profileData && profileData.profiles.length > 0) {
    selectedProfile = profileData.profiles.filter(
      (profile: any) => profile.id === selectedProfileId
    );

    if (selectedProfile.length > 0) {
      [selectedProfile] = selectedProfile;
      fields = selectedProfile.fields;
    }
  }

  optin = typeof contactData.optinTime === 'string';
  optout = typeof contactData.optoutTime === 'string';

  let optinMethod = '';
  if (contactData.optinMethod) {
    optinMethod = `via ${contactData.optinMethod} on ${dayjs(contactData.optinTime).format(
      STANDARD_DATE_TIME_FORMAT
    )}`;
  }

  let optoutMethod = '';
  if (contactData.optoutMethod) {
    optoutMethod = `via ${contactData.optoutMethod} on ${dayjs(contactData.optoutTime).format(
      STANDARD_DATE_TIME_FORMAT
    )}`;
  }

  let statusMessage = 'No optin or optout';
  if (optout && status === 'INVALID') {
    statusMessage = `Optout ${optoutMethod}`;
  } else if (optin) {
    statusMessage = `Optin ${optinMethod}`;
  }

  const switchProfile = {
    selectedProfileId,
    setSelectedProfileId,
    profileData,
    selectedProfile,
    activeProfileId: activeProfile?.id,
  };

  let profileHeaders: Array<{ id: string | undefined; name: string }> = [];
  if (profileData && profileData.profiles.length > 0) {
    profileHeaders = profileData.profiles;
  } else {
    profileHeaders = [{ id: 'noProfile', name: contactDisplayName }];
  }

  const list = [
    {
      name: t('Profile'),
      section: 'profile',
    },
    {
      name: t('Details'),
      section: 'details',
    },
    {
      name: t('History'),
      section: 'history',
    },
  ];

  const drawer = (
    <div className={styles.Drawer}>
      {profileHeaders.map(({ id, name }) => {
        return (
          <div className={styles.ProfileHeaderContainer} key={id}>
            <div
              className={styles.ProfileHeader}
              onClick={() => {
                setSelectedProfileId(`${id}`);
                setShowProfileSection('profile');
              }}
            >
              <div
                className={
                  id === selectedProfileId
                    ? `${styles.ProfileHeaderTitle} ${styles.SelectedProfile}`
                    : styles.ProfileHeaderTitle
                }
              >
                <AvatarDisplay name={name} />
                {name}
              </div>
              {id === selectedProfileId ? <ExpandIcon /> : <CollapseIcon />}
            </div>
            <Collapse in={id === selectedProfileId || id === 'noProfile'}>
              <div className={styles.ProfileHeaderElements}>
                {list.map((data: any, index: number) => {
                  return (
                    <div
                      key={index}
                      onClick={() => setShowProfileSection(data.section)}
                      className={`${styles.Tab} ${
                        showProfileSection === data.section ? styles.ActiveTab : ''
                      }`}
                    >
                      {data.name}
                    </div>
                  );
                })}
              </div>
            </Collapse>
          </div>
        );
      })}
    </div>
  );

  let profileBodyContent;
  if (showProfileSection === 'profile') {
    profileBodyContent = (
      <Profile
        multiProfileAttributes={switchProfile}
        profileType="Contact"
        removePhoneField
        redirectionLink={`chat/${params.id}`}
      />
    );
  } else if (showProfileSection === 'details') {
    profileBodyContent = (
      <ContactDescription
        statusMessage={statusMessage}
        phone={phone}
        maskedPhone={maskedPhone}
        fields={fields}
        settings={settings}
        collections={groups}
        lastMessage={lastMessage}
      />
    );
  } else if (showProfileSection === 'history') {
    if (selectedProfileId === 'noProfile') {
      profileBodyContent = <ContactHistory contactId={params.id} />;
    } else {
      profileBodyContent = <ContactHistory contactId={params.id} profileId={selectedProfileId} />;
    }
  }

  return (
    <>
      <Heading formTitle="Contact Profile" showHeaderHelp={false} />
      <Box className={styles.ContactProfile}>
        {drawer}
        <Box className={styles.ProfileBody}>{profileBodyContent}</Box>
      </Box>
    </>
  );
};

export default ContactProfile;
