import { useState } from 'react';
import { SearchBar } from 'components/UI/SearchBar/SearchBar';
import { GoldenQAList } from 'containers/AIEvals/GoldenQAList/GoldenQAList';
import styles from './AIEvalsPage.module.css';

type ActiveTab = 'ai-evaluations' | 'golden-qa';

const TABS: { id: ActiveTab; label: string }[] = [
  { id: 'ai-evaluations', label: 'AI Evaluations' },
  { id: 'golden-qa', label: 'Golden QA' },
];

export default function AIEvalsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('ai-evaluations');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setSearchMode(false);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSearchMode(e.target.value.length > 0);
  };

  const handleSearchReset = () => {
    setSearchQuery('');
    setSearchMode(false);
  };

  return (
    <div className={styles.Page}>
      <div className={styles.Header}>
        <div>
          <h1 className={styles.Title}>AI Evaluations</h1>
          <p className={styles.Subtitle}>Run evaluations against a golden set of questions and answers</p>
        </div>
      </div>

      <div className={styles.TabBar}>
        <div className={styles.Tabs}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.Tab} ${activeTab === tab.id ? styles.ActiveTab : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <SearchBar
          searchMode={searchMode}
          searchVal={searchQuery}
          handleSubmit={handleSearch}
          handleChange={handleSearchChange}
          onReset={handleSearchReset}
          className={styles.SearchBar}
        />
      </div>

      <div className={styles.Content}>
        {activeTab === 'golden-qa' && <GoldenQAList searchQuery={searchQuery} />}
        {activeTab === 'ai-evaluations' && (
          <div className={styles.EmptyState}>AI Evaluations list coming soon</div>
        )}
      </div>
    </div>
  );
}
