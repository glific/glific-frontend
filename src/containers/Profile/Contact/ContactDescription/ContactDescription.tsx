import { useState } from 'react';
import { IconButton } from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';

import { Timer } from 'components/UI/Timer/Timer';
import { Tooltip } from 'components/UI/Tooltip/Tooltip';
import styles from './ContactDescription.module.css';

export interface ContactDescriptionProps {
  fields: any;
  settings: any;
  phone: string;
  maskedPhone: string;
  collections: any;
  lastMessage: string;
  statusMessage: string;
}

export const ContactDescription = ({
  phone,
  maskedPhone,
  collections,
  lastMessage,
  statusMessage,
  fields,
  settings,
}: ContactDescriptionProps) => {
  const [showPlainPhone, setShowPlainPhone] = useState(false);
  const { t } = useTranslation();

  // list of collections that the contact is assigned
  let assignedToCollection: any = Array.from(
    new Set(
      [].concat(
        ...collections.map((collection: any) => collection.users.map((user: any) => user.name))
      )
    )
  );

  if (assignedToCollection.length > 2) {
    assignedToCollection = `${assignedToCollection.slice(0, 2).join(', ')} +${(
      assignedToCollection.length - 2
    ).toString()}`;
  } else {
    assignedToCollection = assignedToCollection.join(', ');
  }

  // list of collections that the contact belongs
  const collectionList = collections.map((collection: any) => collection.label).join(', ');

  const collectionDetails = [
    { label: t('Collections'), value: collectionList || t('None') },
    {
      label: t('Assigned to'),
      value: assignedToCollection || t('None'),
    },
  ];

  let settingsValue: any = '';
  if (typeof settings === 'string') {
    settingsValue = JSON.parse(settings);
  }

  let fieldsValue: any = '';
  if (typeof fields === 'string') {
    fieldsValue = JSON.parse(fields);
  }

  const handlePhoneDisplay = () => {
    setShowPlainPhone(!showPlainPhone);
  };

  let phoneDisplay = (
    <div data-testid="phone" className={styles.PhoneField}>
      +{maskedPhone}
    </div>
  );

  if (phone) {
    let phoneDisplayValue = maskedPhone;
    let visibilityElement = (
      <Tooltip title={t('Show number')} placement="right">
        <Visibility classes={{ root: styles.Visibility }} />
      </Tooltip>
    );
    if (showPlainPhone) {
      phoneDisplayValue = phone;
      visibilityElement = (
        <Tooltip title={t('Hide number')} placement="right">
          <VisibilityOff classes={{ root: styles.Visibility }} />
        </Tooltip>
      );
    }

    phoneDisplay = (
      <div className={styles.PhoneSection}>
        <div data-testid="phone" className={styles.PhoneField}>
          +{phoneDisplayValue}
        </div>
        <IconButton
          aria-label="toggle phone visibility"
          data-testid="phoneToggle"
          onClick={handlePhoneDisplay}
          edge="end"
        >
          {visibilityElement}
        </IconButton>
      </div>
    );
  }

  return (
    <div className={styles.DescriptionContainer} data-testid="contactDescription">
      <h2 className={styles.Title}>{t('Details')}</h2>
      <div className={styles.Description}>
        {phoneDisplay}
        <div className={styles.SessionTimer}>
          <span>{t('Session Timer')}</span>
          <Timer time={lastMessage} />
        </div>
      </div>

      <div className={styles.DetailBlock}>
        {collectionDetails.map((collectionItem: any) => (
          <div key={collectionItem.label}>
            <div className={styles.DescriptionItem}>{collectionItem.label}</div>
            <div className={styles.DescriptionItemValue} data-testid="collections">
              {collectionItem.value}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.DetailBlock}>
        <div>
          <div className={styles.DescriptionItem}>Status</div>
          <div className={styles.DescriptionItemValue}>{statusMessage}</div>
        </div>
        {settingsValue &&
          typeof settingsValue === 'object' &&
          Object.keys(settingsValue).map((key) => (
            <div key={key}>
              <div className={styles.DescriptionItem}>{key}</div>
              <div className={styles.DescriptionItemValue}>
                {Object.keys(settingsValue[key])
                  .filter((settingKey) => settingsValue[key][settingKey] === true)
                  .join(', ')}
              </div>
            </div>
          ))}
        {fieldsValue &&
          typeof fieldsValue === 'object' &&
          Object.keys(fieldsValue).map((key) => (
            <div key={key}>
              <div className={styles.DescriptionItem}>
                {fieldsValue[key].label ? fieldsValue[key].label : key.replace('_', ' ')}
              </div>
              <div className={styles.DescriptionItemValue}>{fieldsValue[key].value}</div>
            </div>
          ))}
      </div>
    </div>
  );
};
