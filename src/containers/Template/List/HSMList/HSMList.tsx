import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'components/UI/Form/Button/Button';
import { useLazyQuery } from '@apollo/client';
import { SYNC_HSM_TEMPLATES } from 'graphql/queries/Template';
import Loading from 'components/UI/Layout/Loading/Loading';
import { setNotification } from 'common/notification';
import { ReactComponent as TemplateIcon } from 'assets/images/icons/Template/UnselectedDark.svg';
import styles from './HSMList.module.css';
import { Template } from '../Template';

export interface HSMListProps {}

export const HSMList: React.SFC<HSMListProps> = () => {
  const { t } = useTranslation();
  const [syncTemplateLoad, setSyncTemplateLoad] = useState(false);
  const templateIcon = <TemplateIcon className={styles.TemplateIcon} />;
  const [resetFlowCountMethod] = useLazyQuery(SYNC_HSM_TEMPLATES, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data.errors) {
        setNotification('Sorry, failed to get HSM updates', 'warning');
      } else {
        setNotification('HSMs updated successfully', 'success');
      }
      setSyncTemplateLoad(false);
    },
    onError: () => {
      setNotification('Sorry, failed to get HSM updates', 'warning');
      setSyncTemplateLoad(false);
    },
  });

  const handleHsmUpdates = () => {
    setSyncTemplateLoad(true);
    resetFlowCountMethod();
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
        buttonLabel={t('+ Create HSM Template')}
      />
      <Button
        variant="outlined"
        color="primary"
        className={styles.HsmUpdates}
        data-testid="updateHsm"
        onClick={() => handleHsmUpdates()}
        aria-hidden="true"
      >
        GET HSM UPDATES
      </Button>
    </>
  );
};

export default HSMList;
