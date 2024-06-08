import Button from '@mui/material/Button';
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
            console.log((form?.errors))
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
