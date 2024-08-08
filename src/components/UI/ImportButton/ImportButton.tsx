import { useRef } from 'react';
import ImportIcon from 'assets/images/icons/Flow/Import.svg?react';
import { Button } from 'components/UI/Form/Button/Button';
import styles from './ImportButton.module.css';

export interface ImportButtonProps {
  title: string;
  onImport: any;
  afterImport: any;
  id?: string;
}

export const ImportButton = ({ title, onImport, afterImport, id }: ImportButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const changeHandler = (event: any) => {
    const media = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.onload = function setImport() {
      afterImport(fileReader.result, media);
    };
    onImport();
    fileReader.readAsText(media);
  };
  return (
    <span>
      <input
        type="file"
        ref={inputRef}
        hidden
        name="file"
        onChange={changeHandler}
        data-testid="import"
        id={id}
      />
      <Button
        onClick={() => {
          inputRef.current?.click();
        }}
        variant="outlined"
        color="primary"
      >
        <ImportIcon data-testid="import-icon" className={styles.ImportIcon} />
        {title}
      </Button>
    </span>
  );
};
