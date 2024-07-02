import { Button } from 'components/UI/Form/Button/Button';
import AddIcon from 'assets/images/AddGreenIcon.svg?react';
import styles from './TemplateVariable.module.css';
import { FormHelperText, OutlinedInput } from '@mui/material';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { setDefaultValue } from 'common/RichEditor';
import DeleteIcon from 'assets/images/icons/CrossIcon.svg?react';
import { useEffect } from 'react';

export interface TemplateOptionsProps {
  form: { touched: any; errors: any; values: any; setFieldValue: any };
  message: any;
  variables: Array<any>;
  setVariables: any;
  getVariables: any;
  isEditing: boolean;
}

export const TemplateVariables = ({
  form: { touched, errors },
  message,
  variables,
  setVariables,
  getVariables,
  isEditing,
}: TemplateOptionsProps) => {
  const [editor] = useLexicalComposerContext();

  const handleAddVariable = () => {
    setVariables([...variables, { text: '', id: variables.length + 1 }]);
    setDefaultValue(editor, `${message?.trim(' ')} {{${variables.length + 1}}}`);
    editor.focus();
  };

  const handleRemoveVariable = (id: number) => {
    const regex = new RegExp(`\\{\\{${id}\\}\\}`, 'g');

    const updatedMessage = message.replace(regex, '').trim();
    setDefaultValue(editor, updatedMessage);

    const newVariables = variables.filter((variable) => variable.id !== id);
    setVariables(newVariables);
  };

  useEffect(() => {
    setVariables(getVariables(message));
  }, [message]);

  return (
    <div className={styles.AddVariablesContainer}>
      <Button
        disabled={isEditing}
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

                {errors.variables && touched.variables && touched.variables[index] ? (
                  <FormHelperText className={styles.DangerText}>
                    {errors.variables[index]?.text}
                  </FormHelperText>
                ) : null}
              </div>
              <DeleteIcon
                className={styles.DeleteIcon}
                onClick={() => handleRemoveVariable(variable.id)}
                data-testid="delete-variable"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
