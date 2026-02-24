import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import { IconButton, TextField } from '@mui/material';
import Tooltip from 'components/UI/Tooltip/Tooltip';
import { useMemo, useState } from 'react';
import { Screen } from '../FormBuilder/FormBuilder.types';
import { computeFieldNames, sanitizeName } from '../FormBuilder/FormBuilder.utils';
import styles from './Variables.module.css';

interface VariablesProps {
  screens: Screen[];
  onUpdateFieldLabel: (screenId: string, contentId: string, newLabel: string) => void;
  isViewOnly: boolean;
}

interface VariableItem {
  screenId: string;
  screenName: string;
  contentId: string;
  label: string;
  variableName: string;
  fieldName: string;
  type: string;
}

const extractVariablesWithContext = (screens: Screen[]): VariableItem[] => {
  const variables: VariableItem[] = [];
  const fieldNameMap = computeFieldNames(screens);

  screens.forEach((screen) => {
    screen.content.forEach((item) => {
      const { data, type } = item;

      if (type === 'Text Answer' || type === 'Selection') {
        if (data.label) {
          const fieldName = fieldNameMap.get(item.id) || 'field';

          variables.push({
            screenId: screen.id,
            screenName: screen.name,
            contentId: item.id,
            label: data.label,
            variableName: data.variableName || '',
            fieldName,
            type: item.name,
          });
        }
      }
    });
  });

  return variables;
};

export const Variables = ({ screens, onUpdateFieldLabel, isViewOnly }: VariablesProps) => {
  const [editingVariableId, setEditingVariableId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [duplicateErrorId, setDuplicateErrorId] = useState<string | null>(null);

  const variables = useMemo(() => extractVariablesWithContext(screens), [screens]);

  const handleEditVariable = (contentId: string, currentVariableName: string) => {
    setEditingVariableId(contentId);
    setEditValue(currentVariableName);
    setDuplicateErrorId(null);
  };

  const isDuplicateVariable = (newName: string): boolean => {
    const sanitized = sanitizeName(newName);
    return !!sanitized && variables.some((v) => v.contentId !== editingVariableId && v.fieldName === sanitized);
  };

  const handleSaveVariable = (screenId: string, contentId: string) => {
    if (editValue.trim()) {
      if (isDuplicateVariable(editValue)) {
        setDuplicateErrorId(contentId);
        return;
      }
      onUpdateFieldLabel(screenId, contentId, editValue.trim());
    }
    setEditingVariableId(null);
    setEditValue('');
    setDuplicateErrorId(null);
  };

  return (
    <div className={styles.VariablesContainer}>
      {variables.length > 0 ? (
        <>
          <div className={styles.VariablesHeader}>
            <h3>Field Names</h3>
            <Tooltip
              placement="top"
              title="The field names also serve as the header under which responses are captured. To refer to a specific response of this form in the Glific flow, use the ‘Wait for Response’ node to save the flow result(e.g. flow result named: result_1). Then, use @results.result_1.field_name, replacing 'field_name' with the relevant header from here."
            >
              <InfoOutlineIcon fontSize="small" />
            </Tooltip>
          </div>
          <div className={styles.VariablesList}>
            {variables.map((variable) => (
              <div key={`${variable.screenId}-${variable.contentId}`} className={styles.variableItem}>
                <div className={styles.VariableContent}>
                  <div className={styles.VariableInfo}>
                    <div className={styles.VariableLabel}>
                      {variable.screenName} · {variable.type} · {variable.label}
                    </div>
                    {editingVariableId === variable.contentId ? (
                      <TextField
                        value={editValue}
                        onChange={(e) => {
                          setEditValue(e.target.value);
                          if (duplicateErrorId === variable.contentId) {
                            setDuplicateErrorId(null);
                          }
                        }}
                        size="small"
                        variant="outlined"
                        fullWidth
                        autoFocus
                        label="Variable Name"
                        error={duplicateErrorId === variable.contentId}
                        helperText={
                          duplicateErrorId === variable.contentId ? 'Variable name must be unique' : undefined
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveVariable(variable.screenId, variable.contentId);
                          }
                        }}
                        slotProps={{
                          htmlInput: {
                            'data-testid': 'variable-name-input',
                          },
                        }}
                      />
                    ) : (
                      <div className={styles.VariableName}>{variable.fieldName}</div>
                    )}
                  </div>
                </div>
                {!isViewOnly && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (editingVariableId === variable.contentId) {
                        handleSaveVariable(variable.screenId, variable.contentId);
                      } else {
                        handleEditVariable(variable.contentId, variable.variableName || variable.fieldName);
                      }
                    }}
                  >
                    {editingVariableId === variable.contentId ? (
                      <CheckIcon data-testid="save-icon" fontSize="small" />
                    ) : (
                      <EditIcon data-testid="edit-icon" fontSize="small" />
                    )}
                  </IconButton>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>No Variables </p>
      )}
    </div>
  );
};
