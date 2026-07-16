import { t } from 'i18next';

import { Button } from 'components/UI/Form/Button/Button';
import { STATUS_TABS, StatusTab } from '../HSMV2.helper';
import { languageCode, categoryLabel } from '../../HSMListV2/HSMListV2.helper';
import styles from './LanguageVersionsCard.module.css';

export interface LanguageVersionsCardProps {
  variantsByTab: Record<StatusTab, any[]>;
  activeTab: StatusTab;
  onTabChange: (tab: StatusTab) => void;
  showAddLanguage: boolean;
  showDelete: boolean;
  onView: (variantId: string) => void;
  onAddLanguage: () => void;
  onDelete: (variantId: string) => void;
}

export const LanguageVersionsCard = ({
  variantsByTab,
  activeTab,
  onTabChange,
  showAddLanguage,
  showDelete,
  onView,
  onAddLanguage,
  onDelete,
}: LanguageVersionsCardProps) => (
  <div className={styles.TemplateDetailsCard}>
    {/* the form below already has its own "Element name" field (locked
        to the same shortcode) — showing it here too was a duplicate. */}
    <p className={styles.LanguageVersionsTitle}>{t('Language versions')}</p>
    <div className={styles.LanguageVersionsContainer}>
      <div className={styles.StatusTabsRow} data-testid="status-tabs">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`${styles.StatusTab} ${activeTab === tab ? styles.StatusTabActive : ''}`}
            onClick={() => onTabChange(tab)}
            data-testid={`status-tab-${tab}`}
          >
            <span className={`${styles.StatusDot} ${styles[`StatusDot${tab.replace(' ', '')}`]}`} />
            {t(tab)}
            <span className={styles.StatusTabCount}>{variantsByTab[tab].length}</span>
          </button>
        ))}
      </div>
      <div className={styles.LanguageVersionsList} data-testid="language-versions-list">
        {variantsByTab[activeTab].length === 0 ? (
          <p className={styles.EmptyTabText}>{t('No languages in this status.')}</p>
        ) : (
          variantsByTab[activeTab].map((variant: any) => (
            <div key={variant.id} className={styles.LanguageVersionRow} data-testid="language-version-row">
              <span className={styles.LangName}>
                {variant.language?.label}
                <span className={styles.LangCode}>{languageCode(variant.language?.locale)}</span>
              </span>
              <span className={styles.CategoryChip}>{categoryLabel(variant.category)}</span>
              <span className={styles.RowSpacer} />
              <Button
                variant="text"
                className={styles.ViewLink}
                onClick={() => onView(variant.id)}
                data-testid={`view-language-${variant.id}`}
              >
                {t('View')}
              </Button>
              {showDelete && (
                <Button
                  variant="text"
                  className={styles.DeleteLink}
                  onClick={() => onDelete(variant.id)}
                  data-testid={`delete-language-${variant.id}`}
                >
                  {t('Delete')}
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
    {showAddLanguage && (
      <Button variant="text" className={styles.AddLanguageLink} onClick={onAddLanguage} data-testid="add-language-link">
        + {t('Add new language')}
      </Button>
    )}
  </div>
);

export default LanguageVersionsCard;
