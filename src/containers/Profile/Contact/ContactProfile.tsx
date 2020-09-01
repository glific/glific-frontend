import React, { useState } from 'react';
import styles from './ContactProfile.module.css';
import { Profile } from '../Profile';
import { ContactDescription } from './ContactDescription/ContactDescription';
import { useQuery } from '@apollo/client';
import { GET_CONTACT_DETAILS } from '../../../graphql/queries/Contact';
import { AutoComplete } from '../../../components/UI/Form/AutoComplete/AutoComplete';
import { GET_TAGS } from '../../../graphql/queries/Tag';

export interface ContactProfileProps {
  match: any;
}

export const ContactProfile: React.SFC<ContactProfileProps> = (props) => {
  const { data } = useQuery(GET_CONTACT_DETAILS, { variables: { id: props.match.params.id } });
  const { data: tagsData } = useQuery(GET_TAGS);

  const [tags, setTags] = useState([]);
  let tagsOptions: Array<any> = [];

  if (tagsData) {
    tagsOptions = tagsData.tags;
  }

  const assignTags = {
    component: AutoComplete,
    name: 'tags',
    // additionalState: 'users',
    options: tagsOptions,
    optionLabel: 'label',
    textFieldProps: {
      // required: true,
      label: 'Assign tags',
      variant: 'outlined',
    },
  };

  let phoneNo = '';
  let groups = [];
  let lastMessage = '';
  let fields = {};
  if (data) {
    const contact = data.contact.contact;
    phoneNo = contact.phone;
    groups = contact.groups;
    lastMessage = contact.lastMessageAt;
    fields = contact.fields;
  }

  const additonalStates = { name: 'tags', state: tags, setState: setTags };
  return (
    <div className={styles.ContactProfile}>
      <div className={styles.ContactForm} data-testid="ContactProfile">
        <Profile
          {...props}
          additionalStates={additonalStates}
          additionalField={assignTags}
          profileType="Contact"
          redirectionLink={`chat/${props.match.params.id}`}
        />
      </div>
      <div className={styles.ContactDescription}>
        <ContactDescription
          phoneNo={phoneNo}
          fields={fields}
          groups={groups}
          lastMessage={lastMessage}
        ></ContactDescription>
      </div>
    </div>
  );
};
