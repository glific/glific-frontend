import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, TextField } from '@mui/material';
import { useMemo, useState } from 'react';
import { Screen } from '../FormBuilder/FormBuilder.types';
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
  payloadKey: string;
  type: string;
}

const extractVariablesWithContext = (screens: Screen[]): VariableItem[] => {
  const variables: VariableItem[] = [];

  screens.forEach((screen, screenIndex) => {
    let fieldCounter = 0;
    screen.content.forEach((item) => {
      const { data, type } = item;

      if (type === 'Text Answer' || type === 'Selection') {
        if (data.label) {
          let displayName: string;

          if (data.variableName && data.variableName.trim()) {
            displayName = data.variableName.replace(/\s+/g, '_').replace(/[^a-z0-9_]/gi, '');
          } else {
            const baseName = data.label.replace(/\s+/g, '_').replace(/[^a-z0-9_]/gi, '');
            displayName = `screen_${screenIndex}_${baseName}_${fieldCounter}`;
          }

          variables.push({
            screenId: screen.id,
            screenName: screen.name,
            contentId: item.id,
            label: data.label,
            variableName: data.variableName || '',
            payloadKey: displayName,
            type: item.name,
          });
          fieldCounter++;
        }
      }
    });
  });

  return variables;
};

export const Variables = ({ screens, onUpdateFieldLabel, isViewOnly }: VariablesProps) => {
  const [editingVariableId, setEditingVariableId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const variables = useMemo(() => extractVariablesWithContext(screens), [screens]);

  const handleEditVariable = (contentId: string, currentVariableName: string) => {
    setEditingVariableId(contentId);
    setEditValue(currentVariableName);
  };

  const handleSaveVariable = (screenId: string, contentId: string) => {
    if (editValue.trim()) {
      onUpdateFieldLabel(screenId, contentId, editValue.trim());
    }
    setEditingVariableId(null);
    setEditValue('');
  };

  return (
    <div className={styles.VariablesContainer}>
      {variables.length > 0 ? (
        <>
          <div className={styles.VariablesHeader}>
            <h3>Form Variables</h3>
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
                        onChange={(e) => setEditValue(e.target.value)}
                        size="small"
                        variant="outlined"
                        fullWidth
                        autoFocus
                        label="Variable Name"
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
                      <div className={styles.VariableName}>{variable.payloadKey}</div>
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
                        const editableVariableName = variable.variableName || variable.payloadKey;
                        handleEditVariable(variable.contentId, editableVariableName);
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
