import React from 'react';

import Button from '@material-ui/core/Button';
import styles from './LanguageBar.module.css';

export interface LanguageBarProps {
  options: Array<string>;
  form: any;
  selectedLangauge: string | null;
  onLanguageChange: Function;
  onSubmit?: Function;
}

export const LanguageBar = ({
  options,
  selectedLangauge,
  onLanguageChange,
  onSubmit = () => {},
  form,
}: LanguageBarProps) => {
  const isSelected = (option: string) => selectedLangauge && selectedLangauge === option;

  return (
    <div className={styles.LanguageWrapper}>
      {options.map((option: string) => (
        <Button
          key={option}
          color="primary"
          onClick={() => {
            onLanguageChange(option, form);
            onSubmit();
          }}
          className={`${isSelected(option) && styles.Selected} `}
        >
          {option}
        </Button>
      ))}
    </div>
  );
};
