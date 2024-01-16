import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useParams, useNavigate, useLocation, Route, Routes, Navigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { getOrganizationServices } from 'services/AuthService';
import { Box, Collapse } from '@mui/material';

import CollapseIcon from '../../../assets/images/icons/Collapse.svg?react';
import ExpandIcon from '../../../assets/images/icons/Expand.svg?react';
import { STANDARD_DATE_TIME_FORMAT } from 'common/constants';
import { GET_CONTACT_DETAILS, GET_CONTACT_PROFILES } from 'graphql/queries/Contact';
import Loading from 'components/UI/Layout/Loading/Loading';
import { ContactDescription } from './ContactDescription/ContactDescription';
import styles from './ContactProfile.module.css';
import { Profile } from '../Profile';
import { ContactHistory } from './ContactHistory/ContactHistory';
import { Heading } from 'containers/Form/FormLayout';

const list = [
  {
    name: 'Profile',
    shortcode: 'profile',
  },
  {
    name: 'Details',
    shortcode: 'details',
  },
  {
    name: 'Contact History',
    shortcode: 'history',
  },
];

export const ContactProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [selectedProfileId, setSelectedProfileId] = useState('');

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
  if (profileData.profiles.length > 0) {
    profileHeaders = profileData.profiles;
  }

  const drawer = (
    <div className={styles.Drawer}>
      {profileHeaders.map(({ id, name }) => {
        return (
          <div className={styles.ProfileHeaderContainer} key={id}>
            <div
              className={styles.ProfileHeader}
              onClick={() => {
                setSelectedProfileId(`${id}`);
              }}
            >
              <div className={styles.ProfileHeaderTitle}>{name}</div>
              {id === selectedProfileId ? <ExpandIcon /> : <CollapseIcon />}
            </div>
            <div className={styles.ProfileHeaderElements}>
              {list.map((data: any, index: number) => {
                const active = location.pathname.endsWith(data.shortcode);
                return (
                  <div
                    key={index}
                    onClick={() => navigate(`/contact-profile/${params.id}/${data.shortcode}`)}
                    className={`${styles.Tab} ${active ? styles.ActiveTab : ''}`}
                  >
                    {data.name}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <Heading formTitle="Contact Profile" showHeaderHelp={false} />
      <Box className={styles.ContactProfile}>
        {drawer}
        <Box className={styles.ProfileBody}>
          <Routes>
            <Route
              path="profile"
              element={
                <Profile
                  multiProfileAttributes={switchProfile}
                  profileType="Contact"
                  redirectionLink={`chat/${params.id}`}
                  afterDelete={{
                    link: selectedProfile ? `/contact-profile/${params.id}` : '/chat',
                  }}
                  removePhoneField
                />
              }
            />
            <Route
              path="details"
              element={
                <ContactDescription
                  statusMessage={statusMessage}
                  phone={phone}
                  maskedPhone={maskedPhone}
                  fields={fields}
                  settings={settings}
                  collections={groups}
                  lastMessage={lastMessage}
                />
              }
            />
            <Route
              path="history"
              element={<ContactHistory contactId={params.id} profileId={selectedProfileId} />}
            />

            <Route path="*" element={<Navigate to="profile" />} />
          </Routes>
        </Box>
      </Box>
    </>
  );
};

export default ContactProfile;
