import { Button } from 'components/UI/Form/Button/Button';
import AddIcon from 'assets/images/AddGreenIcon.svg?react';
import styles from './TemplateVariable.module.css';
import { FormHelperText, OutlinedInput } from '@mui/material';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { setLexicalState } from 'common/RichEditor';
import DeleteIcon from 'assets/images/icons/Delete/Red.svg?react';
import { useEffect } from 'react';

export interface TemplateOptionsProps {
  inputFields: Array<any>;
  form: { touched: any; errors: any; values: any; setFieldValue: any };
  editorValue: any;
  variables: Array<any>;
  setVariables: any;
  field: { name: string; value: any };
  getVariables: any;
  isEditing: boolean;
}

export const TemplateVariables = ({
  form,
  editorValue,
  variables,
  setVariables,
  getVariables,
  isEditing = false,
}: TemplateOptionsProps) => {
  const [editor] = useLexicalComposerContext();

  const handleAddVariable = () => {
    setVariables([...variables, { text: '', id: variables.length + 1 }]);
    setLexicalState(editor, `${editorValue?.trim(' ')} {{${variables.length + 1}}}`);
    editor.focus();
  };

  const handleRemoveVariable = (id: number) => {
    // Remove variable from editorValue
    const regex = new RegExp(`\\{\\{${id}\\}\\}`, 'g');

    // Replace the matched pattern with an empty string
    const newEditorValue = editorValue.replace(regex, '').trim();
    setLexicalState(editor, newEditorValue);

    // Remove variable from variables array
    const newVariables = variables.filter((variable) => variable.id !== id);
    setVariables(newVariables);
  };

  useEffect(() => {
    setVariables(getVariables(editorValue));
  }, [editorValue]);

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
            <div key={variable.id} className={styles.VariableContainer}>
              <div className={styles.Variable} key={index}>
                <OutlinedInput
                  sx={{
                    '& input': {
                      paddingLeft: '14px',
                    },
                  }}
                  startAdornment={
                    <div className={styles.VariableNumber}>{`{{${variable.id}}}`}</div>
                  }
                  fullWidth
                  label="Name"
                  placeholder={'Define value '}
                  notched={false}
                  disabled={isEditing}
                  defaultValue={isEditing ? variable.text : ''}
                  onChange={(event) => {
                    let currentVariable = variables.find((v) => v.id === variable.id);
                    currentVariable.text = event.target.value;
                    setVariables(
                      variables.map((v) => (v.id === variable.id ? currentVariable : v))
                    );
                  }}
                />
                <FormHelperText className={styles.DangerText}>
                  {form &&
                    form.errors.variables &&
                    form.touched.variables &&
                    form.touched.variables[index]?.text &&
                    form.errors.variables[index]?.text}
                </FormHelperText>
              </div>
              <DeleteIcon
                onClick={() => handleRemoveVariable(variable.id)}
                data-testid="delete-icon"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
