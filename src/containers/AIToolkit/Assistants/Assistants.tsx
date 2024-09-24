import { assistantsInfo } from 'common/HelpData';
import { Heading } from 'components/UI/Heading/Heading';
import styles from './Assistants.module.css';
import SearchBar from 'components/UI/SearchBar/SearchBar';
import { CreateAssistant } from '../CreateAssistant.tsx/CreateAssistant';

export const Assistants = () => {
  const assistants = [
    { title: 'Untitled assistant', id: 'asst_KsGPe1fAchlx6lAggIWfPEXN', inserted_at: '6:30 PM' },
    { title: 'Vyse module', id: 'asst_KsGPe1fAchlx6lAggIWfPEXN', inserted_at: '6:30 PM' },
    {
      title: 'Sova integration module',
      id: 'asst_KsGPe1fAchlx6lAggIWfPEXN',
      inserted_at: '6:30 PM',
    },
  ];

  return (
    <div className={styles.AssistantContainer}>
      <Heading
        formTitle="Assistants"
        helpData={assistantsInfo}
        headerHelp="Purpose-built AI that uses OpenAI's models and calls tools"
        button={{ show: true, label: 'Create Assistant', action: () => {} }}
      />
      <div className={styles.MainContainer}>
        <div className={styles.LeftContainer}>
          <div className={styles.Search}>
            <SearchBar
              className={styles.ChatSearchBar}
              handleChange={() => {}}
              onReset={() => ''}
              searchMode
              iconFront
            />
          </div>
          <div className={styles.AssistantList}>
            {[...assistants, ...assistants, ...assistants].map((assistant) => (
              <div className={styles.Assistant}>
                <div className={styles.AssistantHeader}>
                  <span className={styles.AssistantTitle}>{assistant.title}</span>
                  <span className={styles.AssistantDate}>{assistant.inserted_at}</span>
                </div>
                <span className={styles.AssistantId}>{assistant.id}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.RightContainer}>
          <CreateAssistant />
        </div>
      </div>
    </div>
  );
};

export default Assistants;
