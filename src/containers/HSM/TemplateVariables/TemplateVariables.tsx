import { t } from 'i18next';
import { Button } from 'components/UI/Form/Button/Button';
import { SourceReferenceChip } from 'components/UI/SourceReferenceChip/SourceReferenceChip';
import AddIcon from 'assets/images/AddGreenIcon.svg?react';
import styles from './TemplateVariable.module.css';
import { FormHelperText, OutlinedInput } from '@mui/material';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getSelection, $isRangeSelection } from 'lexical';
import { setDefaultValue } from 'common/RichEditor';
import DeleteIcon from 'assets/images/icons/CrossIcon.svg?react';

export interface TemplateOptionsProps {
  form: { touched: any; errors: any; values: any; setFieldValue: any };
  message: any;
  variables: Array<any>;
  setVariables: any;
  getVariables: any;
  isEditing: boolean;
  attached?: boolean;

  variableReferences?: Array<{ id: number; text: string }>;
  referenceLanguage?: string;
}

export const TemplateVariables = ({
  form: { touched, errors },
  message,
  variables,
  setVariables,
  isEditing,
  attached,
  variableReferences,
  referenceLanguage,
}: TemplateOptionsProps) => {
  const [editor] = useLexicalComposerContext();

  const handleAddVariable = () => {
    const nextId = variables.length ? Math.max(...variables.map((variable) => variable.id)) + 1 : 1;
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertText(` {{${nextId}}}`);
      } else {
        const root = $getRoot();
        root.selectEnd();
        $getSelection()?.insertText(` {{${nextId}}}`);
      }
    });
    setVariables([...variables, { text: '', id: nextId }]);
    editor.focus();
  };

  const handleRemoveVariable = (id: number) => {
    const regex = new RegExp(`\\{\\{${id}\\}\\}`, 'g');

    const updatedMessage = message.replace(regex, '').trim();
    setDefaultValue(editor, updatedMessage);

    const newVariables = variables.filter((variable) => variable.id !== id);
    setVariables(newVariables);
  };

  return (
    <div className={attached ? styles.AddVariablesContainerAttached : styles.AddVariablesContainer}>
      <Button
        disabled={isEditing}
        className={styles.AddVariable}
        onClick={handleAddVariable}
        onMouseDown={(event: any) => event.preventDefault()}
        variant="outlined"
        color="primary"
      >
        <AddIcon className={styles.AddIcon} />
        <span> Add Variable</span>
      </Button>
      <div>
        <div className={styles.Variables}>
          {variables.length !== 0 && <h2>Set custom variable values for the message</h2>}
          {variables.map((variable: any, index: number) => {
            const reference = variableReferences?.find((item) => item.id === variable.id);
            return (
              <div data-testid="variable" key={variable.id} className={styles.VariableContainer}>
                <div className={styles.Variable} key={index}>
                  {reference?.text && (
                    <SourceReferenceChip
                      language={referenceLanguage || t('English')}
                      value={reference.text}
                      data-testid={`variable-source-reference-${variable.id}`}
                    />
                  )}
                  <OutlinedInput
                    sx={{
                      '& input': {
                        paddingLeft: '14px',
                      },
                    }}
                    startAdornment={<div className={styles.VariableNumber}>{`{{${variable.id}}}`}</div>}
                    fullWidth
                    label="Name"
                    placeholder={'Define value'}
                    notched={false}
                    disabled={isEditing}
                    value={variable.text || ''}
                    onChange={(event) => {
                      let currentVariable = variables.find((v) => v.id === variable.id);
                      currentVariable.text = event.target.value;
                      setVariables(variables.map((v) => (v.id === variable.id ? currentVariable : v)));
                    }}
                  />

                  {errors.variables && touched.variables && touched.variables[index] ? (
                    <FormHelperText className={styles.DangerText}>{errors.variables[index]?.text}</FormHelperText>
                  ) : null}
                </div>
                <DeleteIcon
                  className={styles.DeleteIcon}
                  onClick={() => handleRemoveVariable(variable.id)}
                  data-testid="delete-variable"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
