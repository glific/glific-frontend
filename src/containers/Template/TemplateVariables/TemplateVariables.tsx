import { Button } from 'components/UI/Form/Button/Button';
import AddIcon from 'assets/images/AddGreenIcon.svg?react';
import { useState } from 'react';
// import { Input } from 'components/UI/Form/Input/Input';
import styles from './TemplateVariable.module.css';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OutlinedInput } from '@mui/material';

export interface TemplateOptionsProps {
  inputFields: Array<any>;
  form: { touched: any; errors: any; values: any; setFieldValue: any };
  editorValue: any;
  variables: Array<any>;
  setVariables: any;
}

export const TemplateVariables = ({
  form,
  editorValue,
  variables,
  setVariables,
}: TemplateOptionsProps) => {
  const handleAddVariable = () => {
    setVariables([...variables, { text: '', id: variables.length + 1 }]);
    form.setFieldValue('body', `${editorValue} {{${variables.length + 1}}}`);
  };

  return (
    <div className={styles.AddVariablesContainer}>
      <Button
        className={styles.AddVariable}
        onClick={handleAddVariable}
        variant="outlined"
        color="primary"
      >
        <AddIcon className={styles.AddIcon} />
        <span> Add Variable</span>
      </Button>
      <div>
        <div className={styles.Variables}>
          {variables.length !== 0 && <h2>Set custom variable values for the message</h2>}
          {variables.map((variable: any, index: number) => (
            <div className={styles.Variable} key={index}>
              <OutlinedInput
                sx={{
                  '& input': {
                    paddingLeft: '14px',
                  },
                }}
                startAdornment={<div className={styles.VariableNumber}>{`{{${index + 1}}}`}</div>}
                fullWidth
                label="Name"
                placeholder={'Define value '}
                notched={false}
                onChange={(event) => {
                  let updatedVariables = variables;
                  updatedVariables[index].text = event.target.value;
                  setVariables(updatedVariables);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
