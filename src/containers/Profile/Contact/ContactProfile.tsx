import React from 'react';
import { useQuery } from '@apollo/client';
import moment from 'moment';
// import { useTranslation } from 'react-i18next';

import { DATE_TIME_FORMAT } from 'common/constants';
import { GET_CONTACT_DETAILS } from 'graphql/queries/Contact';
import Loading from 'components/UI/Layout/Loading/Loading';
import { ContactDescription } from './ContactDescription/ContactDescription';
import styles from './ContactProfile.module.css';
import { Profile } from '../Profile';
import { ContactHistory } from './ContactHistory/ContactHistory';
// import { FILTER_TAGS_NAME } from 'graphql/queries/Tag';
// import { UPDATE_CONTACT_TAGS } from 'graphql/mutations/Contact';
// import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
// import { setVariables } from 'common/constants';

export interface ContactProfileProps {
  match: any;
}

export const ContactProfile = ({ match }: ContactProfileProps) => {
  const { loading, data } = useQuery(GET_CONTACT_DETAILS, { variables: { id: match.params.id } });
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

  if (loading) {
    return <Loading />;
  }

  let optin = false;
  let optout = false;

  const { contact } = data;
  const contactData = contact.contact;
  const { phone, maskedPhone, status, groups, lastMessage, fields, settings } = contactData;
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

  return (
    <div className={styles.ContactProfile}>
      <div className={styles.ContactForm} data-testid="ContactProfile">
        <Profile
          match
          // additionalProfileStates={additonalStates}
          // additionalField={assignTags}
          // additionalState={setSelectedTags}
          // additionalQuery={updateTags}
          profileType="Contact"
          redirectionLink={`chat/${match.params.id}`}
          afterDelete={{ link: '/chat' }}
          removePhoneField
        />
        <ContactHistory contactId={match.params.id} />
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
