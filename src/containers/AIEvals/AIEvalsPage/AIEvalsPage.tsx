import { useQuery } from '@apollo/client';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';

import { Heading } from 'components/UI/Heading/Heading';
import { SearchBar } from 'components/UI/SearchBar/SearchBar';
import { AIEvaluationList } from 'containers/AIEvals/AIEvaluationList/AIEvaluationList';
import { GoldenQAList } from 'containers/AIEvals/GoldenQAList/GoldenQAList';
import { GET_ORG_EVAL_ACCESS_REQUEST } from 'graphql/queries/AIEvaluations';
import styles from './AIEvalsPage.module.css';

type ActiveTab = 'ai-evaluations' | 'golden-qa';

const TABS: { id: ActiveTab; label: string }[] = [
  { id: 'ai-evaluations', label: 'AI Evaluations' },
  { id: 'golden-qa', label: 'Golden QA' },
];

export default function AIEvalsPage() {
  const navigate = useNavigate();
  const { data: accessData, loading: accessLoading } = useQuery(GET_ORG_EVAL_ACCESS_REQUEST);
  const [activeTab, setActiveTab] = useState<ActiveTab>('ai-evaluations');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);

  if (!accessLoading && accessData?.orgEvalAccessRequest?.status !== 'APPROVED') {
    return <Navigate to="/ai-evaluations/intro" replace />;
  }

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
    <>
      <Heading
        formTitle="AI Evaluations"
        headerHelp="Run evaluations against a golden set of questions and answers"
        button={{
          show: activeTab === 'ai-evaluations',
          label: 'Create AI Evaluation',
          action: () => navigate('/ai-evaluations/create'),
        }}
      />
      <div className={styles.PageContainer}>
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
          {activeTab === 'ai-evaluations' && <AIEvaluationList searchQuery={searchQuery} />}
        </div>
      </div>
    </>
  );
}
