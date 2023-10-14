import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'components/UI/Form/Button/Button';
import { useMutation } from '@apollo/client';
import { SYNC_HSM_TEMPLATES } from 'graphql/mutations/Template';
import Loading from 'components/UI/Layout/Loading/Loading';
import { setNotification } from 'common/notification';
import TemplateIcon from 'assets/images/icons/Template/UnselectedDark.svg?react';
import styles from './HSMList.module.css';
import { Template } from '../Template';

export const HSMList = () => {
  const { t } = useTranslation();
  const [syncTemplateLoad, setSyncTemplateLoad] = useState(false);
  const templateIcon = <TemplateIcon className={styles.TemplateIcon} />;
  const [syncHsmTemplates] = useMutation(SYNC_HSM_TEMPLATES, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data.errors) {
        setNotification('Sorry, failed to sync HSM updates', 'warning');
      } else {
        setNotification('HSMs updated successfully', 'success');
      }
      setSyncTemplateLoad(false);
    },
    onError: () => {
      setNotification('Sorry, failed to sync HSM updates', 'warning');
      setSyncTemplateLoad(false);
    },
  });

  const handleHsmUpdates = () => {
    setSyncTemplateLoad(true);
    syncHsmTemplates();
  };

  if (syncTemplateLoad) {
    return <Loading />;
  }

  return (
    <>
      <Template
        title="Templates"
        listItem="sessionTemplates"
        listItemName="HSM Template"
        pageLink="template"
        listIcon={templateIcon}
        filters={{ isHsm: true }}
        isHSM
        buttonLabel={t('Create')}
      />
      <Button
        variant="outlined"
        color="primary"
        className={styles.HsmUpdates}
        data-testid="updateHsm"
        onClick={() => handleHsmUpdates()}
        aria-hidden="true"
      >
        SYNC HSM
      </Button>
    </>
  );
};

export default HSMList;
