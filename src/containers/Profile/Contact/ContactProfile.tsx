import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import moment from 'moment';
import { getOrganizationServices } from 'services/AuthService';
import { FormControl, FormControlLabel, Radio, RadioGroup } from '@material-ui/core';
// import { useTranslation } from 'react-i18next';

import { DATE_TIME_FORMAT } from 'common/constants';
import { GET_CONTACT_DETAILS, GET_CONTACT_PROFILES } from 'graphql/queries/Contact';
import Loading from 'components/UI/Layout/Loading/Loading';
import { ContactDescription } from './ContactDescription/ContactDescription';
import styles from './ContactProfile.module.css';
import { Profile } from '../Profile';
import { ContactHistory } from './ContactHistory/ContactHistory';
// import { FILTER_TAGS_NAME } from 'graphql/queries/Tag';
// import { UPDATE_CONTACT_TAGS } from 'graphql/mutations/Contact';
// import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
// import { setVariables } from 'common/constants';

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
export interface ContactProfileProps {
  match: any;
}

export const ContactProfile: React.SFC<ContactProfileProps> = (props) => {
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const { match } = props;

  const isContactProfileEnabled = getOrganizationServices('contactProfileEnabled');

  const { loading, data } = useQuery(GET_CONTACT_DETAILS, { variables: { id: match.params.id } });

  const { loading: profileLoading, data: profileData } = useQuery(GET_CONTACT_PROFILES, {
    variables: { filter: { contactId: match.params.id } },
    skip: !isContactProfileEnabled,
  });

  useEffect(() => {
    if (data) {
      setSelectedProfileId(data.contact.contact.activeProfile?.id);
    }
  }, [data]);
  // const { data: tagsData } = useQuery(FILTER_TAGS_NAME, {
  //   variables: setVariables(),
  // });
  // const [updateContactTags] = useMutation(UPDATE_CONTACT_TAGS);
  // const [tags, setTags] = useState([]);
  // const [selected, setSelected] = useState([]);
  // const { t } = useTranslation();

  // let tagsOptions: Array<any> = [];

  // if (tagsData) {
  //   tagsOptions = tagsData.tags;
  // }

  // const updateTags = (contactId: any) => {
  //   const initialSelectedTags = tags.map((tag: any) => tag.id);
  //   const finalSelectedTags = selected.map((tag: any) => tag.id);
  //   const selectedTags = finalSelectedTags.filter(
  //     (user: any) => !initialSelectedTags.includes(user)
  //   );
  //   const removedTags = initialSelectedTags.filter(
  //     (contact: any) => !finalSelectedTags.includes(contact)
  //   );

  //   if (selectedTags.length > 0 || removedTags.length > 0) {
  //     updateContactTags({
  //       variables: {
  //         input: {
  //           addTagIds: selectedTags,
  //           contactId,
  //           deleteTagIds: removedTags,
  //         },
  //       },
  //     });
  //   }
  // };

  // const assignTags = {
  //   component: AutoComplete,
  //   name: 'tags',
  //   options: tagsOptions,
  //   additionalState: 'tags',
  //   skipPayload: true,
  //   optionLabel: 'label',
  //   textFieldProps: {
  //     label: t('Assign tags'),
  //     variant: 'outlined',
  //   },
  // };

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

  // const additonalStates = { name: 'tags', state: tags, setState: setTags };
  // const setSelectedTags = (selectedTags: any) => {
  //   setSelected(selectedTags);
  // };

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
          {...props}
          // additionalProfileStates={additonalStates}
          additionalField={switchProfile}
          // additionalState={setSelectedTags}
          // additionalQuery={updateTags}
          profileType="Contact"
          redirectionLink={`chat/${match.params.id}`}
          afterDelete={{ link: '/chat' }}
          removePhoneField
        />
        <ContactHistory contactId={match.params.id} profileId={selectedProfileId} />
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
