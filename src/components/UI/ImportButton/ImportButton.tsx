import { useRef } from 'react';
import { ReactComponent as ImportIcon } from 'assets/images/icons/Flow/Import.svg';
import { Button } from 'components/UI/Form/Button/Button';

export interface ImportButtonProps {
  title: string;
  onImport: any;
  afterImport: any;
}

export const ImportButton = ({ title, onImport, afterImport }: ImportButtonProps) => {
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
      />
      <Button
        onClick={() => {
          inputRef.current?.click();
        }}
        variant="contained"
        color="primary"
      >
        {title}
        <ImportIcon />
      </Button>
    </span>
  );
};
