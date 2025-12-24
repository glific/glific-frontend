import { useState, useMemo } from 'react';
import { TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import { Screen } from '../FormBuilder/FormBuilder.types';
import styles from './Variables.module.css';

interface VariablesProps {
  screens: Screen[];
  onUpdateScreenName: (screenId: string, newName: string) => void;
  onUpdateFieldLabel: (screenId: string, contentId: string, newLabel: string) => void;
}

interface VariableItem {
  screenId: string;
  screenName: string;
  contentId: string;
  label: string;
  type: string;
}

const extractVariablesWithContext = (screens: Screen[]): VariableItem[] => {
  const variables: VariableItem[] = [];

  screens.forEach((screen) => {
    screen.content.forEach((item) => {
      const { data, type } = item;

      if (type === 'Text Answer' || type === 'Selection') {
        if (data.label) {
          variables.push({
            screenId: screen.id,
            screenName: screen.name,
            contentId: item.id,
            label: data.label,
            type: item.name,
          });
        }
      }
    });
  });

  return variables;
};

export const Variables = ({ screens, onUpdateScreenName, onUpdateFieldLabel }: VariablesProps) => {
  const [editingScreenId, setEditingScreenId] = useState<string | null>(null);
  const [editingVariableId, setEditingVariableId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const variables = useMemo(() => extractVariablesWithContext(screens), [screens]);

  const handleEditScreen = (screenId: string, currentName: string) => {
    setEditingScreenId(screenId);
    setEditValue(currentName);
  };

  const handleSaveScreenName = (screenId: string) => {
    if (editValue.trim()) {
      onUpdateScreenName(screenId, editValue.trim());
    }
    setEditingScreenId(null);
    setEditValue('');
  };

  const handleEditVariable = (contentId: string, currentLabel: string) => {
    setEditingVariableId(contentId);
    setEditValue(currentLabel);
  };

  const handleSaveVariable = (screenId: string, contentId: string) => {
    if (editValue.trim()) {
      onUpdateFieldLabel(screenId, contentId, editValue.trim());
    }
    setEditingVariableId(null);
    setEditValue('');
  };

  return (
    <div className={styles.variablesContainer}>
      <div className={styles.variablesHeader}>
        <h3>Screen Names</h3>
      </div>
      <div className={styles.variablesList}>
        {screens.map((screen) => (
          <div key={screen.id} className={styles.variableItem}>
            <div className={styles.variableContent}>
              <div className={styles.variableLabel}>Screen ID:</div>
              {editingScreenId === screen.id ? (
                <TextField
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  size="small"
                  variant="outlined"
                  fullWidth
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveScreenName(screen.id);
                    }
                  }}
                />
              ) : (
                <div className={styles.variableValue}>{screen.name}</div>
              )}
            </div>
            <IconButton
              size="small"
              onClick={() => {
                if (editingScreenId === screen.id) {
                  handleSaveScreenName(screen.id);
                } else {
                  handleEditScreen(screen.id, screen.name);
                }
              }}
            >
              {editingScreenId === screen.id ? <CheckIcon fontSize="small" /> : <EditIcon fontSize="small" />}
            </IconButton>
          </div>
        ))}
      </div>

      {variables.length > 0 && (
        <>
          <div className={styles.variablesHeader}>
            <h3>Form Variables</h3>
          </div>
          <div className={styles.variablesList}>
            {variables.map((variable) => (
              <div key={`${variable.screenId}-${variable.contentId}`} className={styles.variableItem}>
                <div className={styles.variableContent}>
                  <div className={styles.variableInfo}>
                    <div className={styles.variableLabel}>
                      {variable.screenName} · {variable.type}
                    </div>
                    {editingVariableId === variable.contentId ? (
                      <TextField
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        size="small"
                        variant="outlined"
                        fullWidth
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveVariable(variable.screenId, variable.contentId);
                          }
                        }}
                      />
                    ) : (
                      <div className={styles.variableName}>{variable.label}</div>
                    )}
                  </div>
                </div>
                <IconButton
                  size="small"
                  onClick={() => {
                    if (editingVariableId === variable.contentId) {
                      handleSaveVariable(variable.screenId, variable.contentId);
                    } else {
                      handleEditVariable(variable.contentId, variable.label);
                    }
                  }}
                >
                  {editingVariableId === variable.contentId ? (
                    <CheckIcon fontSize="small" />
                  ) : (
                    <EditIcon fontSize="small" />
                  )}
                </IconButton>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
