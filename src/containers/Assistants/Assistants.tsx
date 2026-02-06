import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { assistantsInfo } from 'common/HelpData';

import { Heading } from 'components/UI/Heading/Heading';

import { GET_ASSISTANTS } from 'graphql/queries/Assistant';

import { CreateAssistant } from './CreateAssistant/CreateAssistant';
import { List } from './ListItems/List';
import styles from './Assistants.module.css';
import { useLocation, useNavigate, useParams } from 'react-router';

export const Assistants = () => {
  const params = useParams();
  const location = useLocation();
  const [updateList, setUpdateList] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isAddRoute = location.pathname.endsWith('/add');
  const showForm = isAddRoute || params.assistantId;

  const handleCreateAssistant = () => {
    navigate('/assistants/add');
  };

  return (
    <div className={styles.AssistantContainer}>
      <Heading
        formTitle={t('AI Assistants')}
        helpData={assistantsInfo}
        headerHelp={t("Purpose-built AI that uses OpenAI's models and calls tools")}
        button={{
          show: true,
          label: t('Create Assistant'),
          action: handleCreateAssistant,
        }}
      />
      <div className={styles.MainContainer}>
        <div className={styles.LeftContainer}>
          <List getItemsQuery={GET_ASSISTANTS} listItemName="assistants" refreshList={updateList} />
        </div>
        <div className={styles.RightContainer}>
          {showForm ? (
            <CreateAssistant key={params.assistantId ?? 'new'} setUpdateList={setUpdateList} updateList={updateList} />
          ) : (
            <p className={styles.EmptyText}>Please select or create an assistant</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assistants;
