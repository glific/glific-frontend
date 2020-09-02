import React, { useState } from 'react';
import styles from './ContactProfile.module.css';
import { Profile } from '../Profile';
import { ContactDescription } from './ContactDescription/ContactDescription';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CONTACT_DETAILS } from '../../../graphql/queries/Contact';
import { AutoComplete } from '../../../components/UI/Form/AutoComplete/AutoComplete';
import { GET_TAGS } from '../../../graphql/queries/Tag';
import { UPDATE_CONTACT_TAGS } from '../../../graphql/mutations/Contact';

export interface ContactProfileProps {
  match: any;
}

export const ContactProfile: React.SFC<ContactProfileProps> = (props) => {
  const { data } = useQuery(GET_CONTACT_DETAILS, { variables: { id: props.match.params.id } });
  const { data: tagsData } = useQuery(GET_TAGS);
  const [updateContactTags] = useMutation(UPDATE_CONTACT_TAGS);
  const [tags, setTags] = useState([]);
  const [selected, setSelected] = useState([]);
  let tagsOptions: Array<any> = [];

  if (tagsData) {
    tagsOptions = tagsData.tags;
  }

  const updateTags = (contactId: any) => {
    const initialSelectedTags = tags.map((tag: any) => tag.id);
    const finalSelectedTags = selected.map((tag: any) => tag.id);
    const selectedTags = finalSelectedTags.filter(
      (user: any) => !initialSelectedTags.includes(user)
    );
    const removedTags = initialSelectedTags.filter(
      (contact: any) => !finalSelectedTags.includes(contact)
    );

    if (selectedTags.length > 0 || removedTags.length > 0) {
      updateContactTags({
        variables: {
          input: {
            addTagIds: selectedTags,
            contactId: contactId,
            deleteTagIds: removedTags,
          },
        },
      });
    }
  };

  const assignTags = {
    component: AutoComplete,
    name: 'tags',
    options: tagsOptions,
    additionalState: 'tags',
    skipPayload: true,
    optionLabel: 'label',
    textFieldProps: {
      label: 'Assign tags',
      variant: 'outlined',
      multiline: true,
      rows: 3,
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

  const setSelectedTags = (tags: any) => {
    setSelected(tags);
  };
  return (
    <div className={styles.ContactProfile}>
      <div className={styles.ContactForm} data-testid="ContactProfile">
        <Profile
          {...props}
          additionalStates={additonalStates}
          additionalField={assignTags}
          additionalState={setSelectedTags}
          additionalQuery={updateTags}
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
