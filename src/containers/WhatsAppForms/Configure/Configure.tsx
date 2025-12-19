import { useState } from 'react';
import { Heading } from 'components/UI/Heading/Heading';
import styles from './Configure.module.css';
import { FormBuilder } from './FormBuilder/FormBuilder';
import { Preview } from './Preview/Preview';
import { JSONViewer } from './JSONViewer/JSONViewer';
import { Variables } from './Variables/Variables';
import { Screen } from './FormBuilder/FormBuilder.types';
import { convertFlowJSONToFormBuilder } from './FormBuilder/FormBuilder.utils';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import { useQuery } from '@apollo/client';
import { useParams } from 'react-router';
import { GET_WHATSAPP_FORM } from 'graphql/queries/WhatsAppForm';

export const Configure = () => {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [showJSON, setShowJSON] = useState(false);
  const [view, setView] = useState<'preview' | 'variables'>('preview');
  const params = useParams();

  const handleViewJSON = () => {
    setShowJSON(true);
  };

  const handleUpdateScreenName = (screenId: string, newName: string) => {
    setScreens((prevScreens) =>
      prevScreens.map((screen) => (screen.id === screenId ? { ...screen, name: newName } : screen))
    );
  };

  const handleUpdateFieldLabel = (screenId: string, contentId: string, newLabel: string) => {
    setScreens((prevScreens) =>
      prevScreens.map((screen) => {
        if (screen.id === screenId) {
          return {
            ...screen,
            content: screen.content.map((item) =>
              item.id === contentId ? { ...item, data: { ...item.data, label: newLabel } } : item
            ),
          };
        }
        return screen;
      })
    );
  };

  useQuery(GET_WHATSAPP_FORM, {
    skip: !params.id,
    variables: { id: params.id },
    onCompleted: ({ whatsappForm }) => {
      console.log(whatsappForm?.whatsappForm?.definition);
      if (whatsappForm?.whatsappForm?.definition) {
        try {
          // Parse the definition if it's a string, otherwise use it directly
          const flowJSON =
            typeof whatsappForm?.whatsappForm?.definition === 'string'
              ? JSON.parse(whatsappForm?.whatsappForm?.definition)
              : whatsappForm?.whatsappForm?.definition;

          console.log(flowJSON);
          const convertedScreens = convertFlowJSONToFormBuilder(flowJSON);
          setScreens(convertedScreens);
        } catch (error) {
          console.error('Error parsing WhatsApp form definition:', error);
        }
      }
    },
  });

  return (
    <>
      <Heading
        formTitle="Configure WhatsApp Form"
        backLink="/whatsapp-forms"
        button={{
          show: true,
          label: 'View JSON',
          action: handleViewJSON,
        }}
      />
      <div className={styles.configureContainer}>
        <div className={styles.flowBuilder}>
          <FormBuilder screens={screens} onScreensChange={setScreens} />
        </div>

        <div className={styles.preview}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(event, value) => {
              setView(value);
            }}
            aria-label="view toggle"
            size="small"
          >
            <ToggleButton value="preview" aria-label="preview">
              Preview
            </ToggleButton>
            <ToggleButton value="variables" aria-label="variables">
              Variables
            </ToggleButton>
          </ToggleButtonGroup>

          {view === 'variables' ? (
            <Variables
              screens={screens}
              onUpdateScreenName={handleUpdateScreenName}
              onUpdateFieldLabel={handleUpdateFieldLabel}
            />
          ) : (
            <Preview />
          )}
        </div>
      </div>

      {showJSON && <JSONViewer screens={screens} onClose={() => setShowJSON(false)} />}
    </>
  );
};

export default Configure;
