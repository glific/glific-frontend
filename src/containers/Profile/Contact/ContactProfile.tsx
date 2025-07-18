import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useParams } from 'react-router';
import { Box, Collapse } from '@mui/material';
import { useTranslation } from 'react-i18next';

import CollapseIcon from '../../../assets/images/icons/Collapse.svg?react';
import ExpandIcon from '../../../assets/images/icons/Expand.svg?react';
import { getContactStatus, getDisplayName } from 'common/utils';
import { GET_CONTACT_DETAILS, GET_CONTACT_PROFILES } from 'graphql/queries/Contact';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { AvatarDisplay } from 'components/UI/AvatarDisplay/AvatarDisplay';
import { Heading } from 'components/UI/Heading/Heading';
import { ContactDescription } from './ContactDescription/ContactDescription';
import { Profile } from '../Profile';
import { ContactHistory } from './ContactHistory/ContactHistory';
import styles from './ContactProfile.module.css';

export const ContactProfile = () => {
  const params = useParams();
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [showProfileSection, setShowProfileSection] = useState('profile');
  const { t } = useTranslation();

  const { loading, data } = useQuery(GET_CONTACT_DETAILS, { variables: { id: params.id } });

  const { loading: profileLoading, data: profileData } = useQuery(GET_CONTACT_PROFILES, {
    variables: {
      filter: {
        contactId: params.id,
        is_active: true,
      },
    },
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
  const { phone, maskedPhone, groups, lastMessage, settings, activeProfile } = contactData;
  let { fields } = contactData;

  const contactDisplayName = getDisplayName(contactData);

  let selectedProfile;

  if (profileData && profileData.profiles.length > 0) {
    selectedProfile = profileData.profiles.filter((profile: any) => profile.id === selectedProfileId);

    if (selectedProfile.length > 0) {
      [selectedProfile] = selectedProfile;
      fields = selectedProfile.fields;
    } else {
      selectedProfile = null;
    }
  }

  const statusMessage = getContactStatus(contactData);

  const switchProfile = {
    selectedProfileId,
    setSelectedProfileId,
    profileData,
    selectedProfile,
    activeProfileId: activeProfile?.id,
  };

  let profileHeaders: Array<{ id: string | undefined; name: string; is_default?: boolean }> = [];
  if (profileData && profileData.profiles.length > 0 && activeProfile?.id) {
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
      {profileHeaders.map(({ id, is_default, name }) => {
        const showProfileSelected = id === selectedProfileId || id === 'noProfile';

        return (
          <React.Fragment key={id}>
            <div
              data-testid="profileHeader"
              className={styles.ProfileHeader}
              onClick={() => {
                setSelectedProfileId(`${id}`);
                setShowProfileSection('profile');
              }}
            >
              <div
                className={
                  showProfileSelected
                    ? `${styles.ProfileHeaderTitle} ${styles.SelectedProfile}`
                    : styles.ProfileHeaderTitle
                }
              >
                <AvatarDisplay name={name} />
                <div className={styles.NameWithTags}>
                  <div>{name.length > 18 ? `${name.slice(0, 18)}...` : name}</div>
                  <div className={styles.ProfileTagsContainer}>
                    {is_default && <span className={`${styles.ProfileTag} ${styles.Default}`}>DEFAULT</span>}
                    {activeProfile?.id === id && (
                      <span className={`${styles.ProfileTag} ${styles.Active}`}>CURRENT</span>
                    )}
                  </div>
                </div>
              </div>
              {showProfileSelected ? <ExpandIcon /> : <CollapseIcon />}
            </div>
            <Collapse in={showProfileSelected}>
              <div className={styles.ProfileHeaderElements}>
                {list.map((data: any, index: number) => (
                  <div
                    key={index}
                    onClick={() => setShowProfileSection(data.section)}
                    className={`${styles.Tab} ${showProfileSection === data.section ? styles.ActiveTab : ''}`}
                  >
                    {data.name}
                  </div>
                ))}
              </div>
            </Collapse>
          </React.Fragment>
        );
      })}
    </div>
  );

  let profileBodyContent;
  if (showProfileSection === 'profile') {
    profileBodyContent = (
      <Profile multiProfileAttributes={switchProfile} removePhoneField redirectionLink={`chat/${params.id}`} />
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
      <Heading formTitle={t('Contact Profile')} showHeaderHelp={false} backLink={`/chat/${params.id}`} />
      <Box className={styles.ContactProfile}>
        {drawer}
        <Box className={styles.ProfileBody}>{profileBodyContent}</Box>
      </Box>
    </>
  );
};

export default ContactProfile;
