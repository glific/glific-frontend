import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import { getOrganizationServices } from 'services/AuthService';
import { FormControl, FormControlLabel, Radio, RadioGroup } from '@material-ui/core';

import { DATE_TIME_FORMAT } from 'common/constants';
import { GET_CONTACT_DETAILS, GET_CONTACT_PROFILES } from 'graphql/queries/Contact';
import Loading from 'components/UI/Layout/Loading/Loading';
import { ContactDescription } from './ContactDescription/ContactDescription';
import styles from './ContactProfile.module.css';
import { Profile } from '../Profile';
import { ContactHistory } from './ContactHistory/ContactHistory';

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

export const ContactProfile = () => {
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

  if (isContactProfileEnabled && profileData && profileData.profiles.length > 1) {
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

  return (
    <div className={styles.ContactProfile}>
      <div className={styles.ContactForm} data-testid="ContactProfile">
        <Profile
          multiProfileAttributes={switchProfile}
          profileType="Contact"
          redirectionLink={`chat/${params.id}`}
          afterDelete={{ link: selectedProfile ? `/contact-profile/${params.id}` : '/chat' }}
          removePhoneField
        />
        <ContactHistory contactId={params.id} profileId={selectedProfileId} />
      </div>

      <div className={styles.ContactDescription}>
        <ContactDescription
          statusMessage={statusMessage}
          phone={phone}
          maskedPhone={maskedPhone}
          fields={fields}
          settings={settings}
          collections={groups}
          lastMessage={lastMessage}
        />
      </div>
    </div>
  );
};

export default ContactProfile;
