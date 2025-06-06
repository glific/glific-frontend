import { useState } from 'react';
import { IconButton, Typography } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useTranslation } from 'react-i18next';

import { Timer } from 'components/UI/Timer/Timer';
import { Tooltip } from 'components/UI/Tooltip/Tooltip';
import styles from './ContactDescription.module.css';

export interface ContactDescriptionProps {
  fields: any;
  settings?: any;
  phone?: string;
  maskedPhone?: string;
  collections: any;
  lastMessage?: string;
  statusMessage?: string;
  groups?: boolean;
  customStyles?: string;
}

export const ContactDescription = ({
  phone,
  maskedPhone,
  collections,
  lastMessage,
  statusMessage,
  fields,
  settings,
  groups = false,
  customStyles,
}: ContactDescriptionProps) => {
  const [showPlainPhone, setShowPlainPhone] = useState(false);
  const { t } = useTranslation();

  // list of collections that the contact is assigned
  let assignedToCollection: any = Array.from(
    new Set([].concat(...collections.map((collection: any) => collection.users.map((user: any) => user.name))))
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

  let collectionDetails = [{ label: t('Collections'), value: collectionList || t('None') }];
  if (!groups) {
    collectionDetails = [
      ...collectionDetails,
      {
        label: t('Assigned to'),
        value: assignedToCollection || t('None'),
      },
    ];
  }

  let settingsValue: any = '';
  if (settings && typeof settings === 'string') {
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
        <VisibilityIcon classes={{ root: styles.Visibility }} />
      </Tooltip>
    );
    if (showPlainPhone) {
      phoneDisplayValue = phone;
      visibilityElement = (
        <Tooltip title={t('Hide number')} placement="right">
          <VisibilityOffIcon classes={{ root: styles.Visibility }} />
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

  const numberBlock = (
    <>
      {!groups && (
        <>
          <div className={styles.DetailBlock}>
            <Typography data-testid="formLabel" variant="h5" className={styles.FieldLabel}>
              Number
            </Typography>
            <div className={styles.Description}>
              {phoneDisplay}
              <div className={styles.SessionTimer}>
                <span>{t('Session Timer')}</span>
                <Timer time={lastMessage} variant="secondary" />
              </div>
            </div>
          </div>
          <div className={styles.Divider} />
        </>
      )}
    </>
  );

  const collectionBlock = (
    <>
      <div className={styles.DetailBlock}>
        {collectionDetails.map((collectionItem: any) => (
          <div key={collectionItem.label}>
            <div className={styles.FieldLabel}>{collectionItem.label}</div>
            <div className={styles.DescriptionItemValue} data-testid="collections">
              {collectionItem.value}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.Divider} />
    </>
  );

  const settingsBlock = (
    <>
      {settingsValue &&
        !groups &&
        typeof settingsValue === 'object' &&
        Object.keys(settingsValue).map((key) => (
          <div key={key}>
            <div className={styles.FieldLabel}>{key}</div>
            <div className={styles.DescriptionItemValue}>
              {Object.keys(settingsValue[key])
                .filter((settingKey) => settingsValue[key][settingKey] === true)
                .join(', ')}
            </div>
            <div className={styles.Divider} />
          </div>
        ))}
    </>
  );

  const statusBlock = (
    <>
      {!groups && (
        <div className={styles.DetailBlock}>
          <div>
            <div className={styles.FieldLabel}>Status</div>
            <div className={styles.DescriptionItemValue}>{statusMessage}</div>
          </div>
          <div className={styles.Divider} />
        </div>
      )}
    </>
  );

  const fieldsBlock = (
    <div className={styles.DetailBlock}>
      {fieldsValue &&
        typeof fieldsValue === 'object' &&
        Object.keys(fieldsValue).map((key) => (
          <div key={key}>
            <div className={styles.FieldLabel}>
              {fieldsValue[key].label ? fieldsValue[key].label : key.replace('_', ' ')}
            </div>
            <div className={styles.DescriptionItemValue}>{fieldsValue[key].value}</div>
            <div className={styles.Divider} />
          </div>
        ))}
    </div>
  );

  return (
    <div className={`${styles.DescriptionContainer} ${customStyles}`} data-testid="contactDescription">
      {numberBlock}
      {collectionBlock}
      {settingsBlock}
      {statusBlock}
      {fieldsBlock}
    </div>
  );
};
