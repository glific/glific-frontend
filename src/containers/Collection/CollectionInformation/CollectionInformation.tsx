import { useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import { GET_COLLECTION_INFO } from 'graphql/queries/Collection';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import styles from './CollectionInformation.module.css';

export interface CollectionInformationProps {
  collectionId: any;
  staff?: boolean;
  displayPopup?: boolean;
  setDisplayPopup?: any;
  handleSendMessage?: any;
}

export const CollectionInformation = ({
  collectionId,
  staff = true,
  displayPopup,
  setDisplayPopup,
  handleSendMessage,
}: CollectionInformationProps) => {
  const { t } = useTranslation();
  const displayObj: any = { 'Session messages': 0, 'Only templates': 0, 'No messages': 0 };
  const [display, setDisplay] = useState(displayObj);

  const [getCollectionInfo, { data: collectionInfo }] = useLazyQuery(GET_COLLECTION_INFO);

  useEffect(() => {
    if (collectionId) {
      getCollectionInfo({ variables: { id: collectionId } });
      // reset to zero on collection change
      setDisplay({ 'Session messages': 0, 'Only templates': 0, 'No messages': 0 });
    }
  }, [collectionId]);

  useEffect(() => {
    if (collectionInfo) {
      const info = JSON.parse(collectionInfo.groupInfo);
      const displayCopy = { ...displayObj };
      Object.keys(info).forEach((key) => {
        if (key === 'session_and_hsm') {
          displayCopy['Session messages'] += info[key];
          displayCopy['Only templates'] += info[key];
        } else if (key === 'session') {
          displayCopy['Session messages'] += info[key];
        } else if (key === 'hsm') {
          displayCopy['Only templates'] += info[key];
        } else if (key === 'none') {
          displayCopy['No messages'] = info[key];
        }
      });
      setDisplay(displayCopy);
    }
  }, [collectionInfo]);

  // display collection contact status before sending message to a collection
  if (displayPopup) {
    const dialogBox = (
      <DialogBox
        title={t('Contact status')}
        handleOk={() => handleSendMessage()}
        handleCancel={() => setDisplayPopup()}
        buttonOk={t('Ok, Send')}
        alignButtons="center"
      >
        <div className={styles.DialogBox} data-testid="description">
          <div className={styles.Message}>
            {t('Custom messages will not be sent to the opted out/session expired contacts.')}
          </div>
          <div className={styles.Message}>
            {t('Only HSM template can be sent to the session expired contacts.')}{' '}
          </div>
          <div className={styles.Message}>
            {t('Total Contacts:')} {collectionInfo ? JSON.parse(collectionInfo.groupInfo).total : 0}
            <div>
              {t('Contacts qualified for')}-
              {Object.keys(display).map((data: any) => (
                <span key={data} className={styles.Count}>
                  {data}: <span> {display[data]}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </DialogBox>
    );
    return dialogBox;
  }

  return (
    <div className={styles.InfoWrapper}>
      <div className={styles.CollectionInformation} data-testid="CollectionInformation">
        <div className={styles.MessageInfo}>
          {Object.keys(display).map((data: any) => (
            <div key={data} className={styles.SessionInfo}>
              {data}:<span className={styles.SessionCount}> {display[data]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
