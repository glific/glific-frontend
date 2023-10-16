import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import moment from 'moment';
import { useParams, useNavigate, useLocation, Route, Routes, Navigate } from 'react-router-dom';
import { getOrganizationServices } from 'services/AuthService';
import { Box, FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';

import { DATE_TIME_FORMAT } from 'common/constants';
import { GET_CONTACT_DETAILS, GET_CONTACT_PROFILES } from 'graphql/queries/Contact';
import Loading from 'components/UI/Layout/Loading/Loading';
import { ContactDescription } from './ContactDescription/ContactDescription';
import styles from './ContactProfile.module.css';
import { Profile } from '../Profile';
import { ContactHistory } from './ContactHistory/ContactHistory';
import { Heading } from 'containers/Form/FormLayout';

const ProfileChange = ({ selectedProfileId, setSelectedProfileId, profileData }: any) => (
  <FormControl fullWidth className={styles.FormControl}>
    <RadioGroup
      aria-label="action-radio-buttons"
      name="action-radio-buttons"
      row
      value={selectedProfileId}
      onChange={(event: any) => setSelectedProfileId(event?.target.value)}
      className={styles.RadioGroup}
    >
      {profileData.profiles.map((profile: any) => (
        <FormControlLabel
          key={profile.id}
          value={profile.id}
          control={<Radio color="primary" />}
          label={profile.name}
          classes={{ label: styles.RadioLabel }}
        />
      ))}
    </RadioGroup>
  </FormControl>
);

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
    optinMethod = `via ${contactData.optinMethod} on ${moment(contactData.optinTime).format(
      DATE_TIME_FORMAT
    )}`;
  }

  let optoutMethod = '';
  if (contactData.optoutMethod) {
    optoutMethod = `via ${contactData.optoutMethod} on ${moment(contactData.optoutTime).format(
      DATE_TIME_FORMAT
    )}`;
  }

  let statusMessage = 'No optin or optout';
  if (optout && status === 'INVALID') {
    statusMessage = `Optout ${optoutMethod}`;
  } else if (optin) {
    statusMessage = `Optin ${optinMethod}`;
  }

  const switchProfile = {
    component: ProfileChange,
    selectedProfileId,
    setSelectedProfileId,
    profileData,
    selectedProfile,
    activeProfileId: activeProfile?.id,
  };

  const drawer = (
    <div className={styles.Drawer}>
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
  );

  return (
    <>
      <Heading formTitle="Contact Profile" />
      <Box sx={{ display: 'flex' }}>
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
