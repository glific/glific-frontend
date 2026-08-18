import { useTranslation } from 'react-i18next';
import type { resources } from 'i18n/config';
import styles from './TabBar.module.css';

type TranslationKey = keyof (typeof resources)['en']['translation'];

export type TabKey = 'persona' | 'knowledgeBase' | 'guardrails' | 'evaluation' | 'tryItOut';

export const TABS: { key: TabKey; label: TranslationKey; badge?: TranslationKey }[] = [
  { key: 'persona', label: 'Persona & Prompt' },
  { key: 'knowledgeBase', label: 'Knowledge Base' },
  { key: 'guardrails', label: 'Guardrails' },
  { key: 'evaluation', label: 'Golden Q&A Evaluation' },
  { key: 'tryItOut', label: 'Try It Out', badge: 'SANDBOX' },
];

export interface TabBarProps {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
  dirtyTabs?: Partial<Record<TabKey, boolean>>;
}

export const TabBar = ({ activeTab, onChange, dirtyTabs = {} }: TabBarProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.Tabs} role="tablist">
      {TABS.map((tab) => (
        <button
          type="button"
          role="tab"
          key={tab.key}
          aria-selected={activeTab === tab.key}
          className={`${styles.Tab} ${activeTab === tab.key ? styles.ActiveTab : ''}`}
          onClick={() => onChange(tab.key)}
          data-testid={`tab-${tab.key}`}
        >
          {t(tab.label)}
          {tab.badge && <span className={styles.SandboxBadge}>{t(tab.badge)}</span>}
          {dirtyTabs[tab.key] && (
            <span
              className={styles.TabDirtyDot}
              aria-label={t('This tab has unsaved changes')}
              data-testid={`tabDirtyDot-${tab.key}`}
            />
          )}
        </button>
      ))}
    </div>
  );
};
