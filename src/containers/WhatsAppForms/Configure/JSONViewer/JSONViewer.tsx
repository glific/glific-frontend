import { useState, useMemo } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Button, Tabs, Tab, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Screen } from '../FormBuilder/FormBuilder.types';
import { convertFormBuilderToFlowJSON } from '../FormBuilder/FormBuilder.utils';
import styles from './JSONViewer.module.css';

interface JSONViewerProps {
  screens: Screen[];
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

// Extract all variables from the JSON
const extractVariables = (screens: Screen[]): string[] => {
  const variables: Set<string> = new Set();

  screens.forEach((screen) => {
    screen.content.forEach((item) => {
      const { data, type } = item;

      // For input fields, extract the field name
      if (type === 'Text Answer' || type === 'Selection') {
        if (data.label) {
          const fieldName = data.label.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_');
          variables.add(fieldName);
        }
      }
    });
  });

  return Array.from(variables);
};

export const JSONViewer = ({ screens, onClose }: JSONViewerProps) => {
  const [tabValue, setTabValue] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);

  const flowJSON = useMemo(() => convertFormBuilderToFlowJSON(screens), [screens]);
  const variables = useMemo(() => extractVariables(screens), [screens]);

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(flowJSON, null, 2));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <div className={styles.dialogHeader}>
          <span>Form JSON</span>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="JSON View" />
            <Tab label={`Form Variables (${variables.length})`} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <div className={styles.jsonActions}>
            <Button
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyJSON}
              size="small"
            >
              {copySuccess ? 'Copied!' : 'Copy JSON'}
            </Button>
          </div>
          <pre className={styles.jsonCode}>{JSON.stringify(flowJSON, null, 2)}</pre>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <div className={styles.variablesContainer}>
            <div className={styles.variablesHeader}>
              <h3>Screen Names</h3>
            </div>
            <div className={styles.variablesList}>
              {screens.map((screen) => (
                <div key={screen.id} className={styles.variableItem}>
                  <div className={styles.variableName}>screen_{screen.id}</div>
                  <div className={styles.variableValue}>{screen.name}</div>
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
                    <div key={variable} className={styles.variableItem}>
                      <div className={styles.variableName}>{variable}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
};
