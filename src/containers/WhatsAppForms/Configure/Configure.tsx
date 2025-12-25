import { useState, useEffect, useRef } from 'react';
import { Heading } from 'components/UI/Heading/Heading';
import styles from './Configure.module.css';
import { FormBuilder } from './FormBuilder/FormBuilder';
import { Preview } from './Preview/Preview';
import { JSONViewer } from './JSONViewer/JSONViewer';
import { Variables } from './Variables/Variables';
import { Screen } from './FormBuilder/FormBuilder.types';
import { convertFlowJSONToFormBuilder, convertFormBuilderToFlowJSON } from './FormBuilder/FormBuilder.utils';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import { useQuery, useMutation } from '@apollo/client';
import { useParams } from 'react-router';
import { GET_LATEST_WHATSAPP_FORM_REVISION } from 'graphql/queries/WhatsAppForm';
import { SAVE_WHATSAPP_FORM_REVISION } from 'graphql/mutations/WhatsAppForm';
import setLogs from 'config/logs';
import { setNotification } from 'common/notification';

export const Configure = () => {
  const [flowName, setFlowName] = useState('');
  const [screens, setScreens] = useState<Screen[]>([]);
  const [expandedScreenId, setExpandedScreenId] = useState<string | null>('1');
  const [expandedContentId, setExpandedContentId] = useState<string | null>(null);

  const [showJSON, setShowJSON] = useState(false);
  const [view, setView] = useState<'preview' | 'variables'>('preview');
  const params = useParams();
  const isInitialMount = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [saveWhatsappFormRevision] = useMutation(SAVE_WHATSAPP_FORM_REVISION, {
    onError: (error) => {
      setNotification('Error saving form revision', 'warning');
      setLogs(error, 'error');
    },
  });

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

  useQuery(GET_LATEST_WHATSAPP_FORM_REVISION, {
    skip: !params.id,
    variables: { id: params.id },
    onCompleted: ({ whatsappForm }) => {
      if (whatsappForm?.whatsappForm?.revision) {
        setFlowName(whatsappForm?.whatsappForm?.name || '');
        try {
          const flowJSON = JSON.parse(whatsappForm?.whatsappForm?.revision?.definition);
          if (!flowJSON) return;

          const convertedScreens = convertFlowJSONToFormBuilder(flowJSON);
          setScreens(convertedScreens);
        } catch (error) {
          setLogs(error, 'error');
        }
      }
    },
  });

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!params.id || screens.length === 0) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const flowJSON = convertFormBuilderToFlowJSON(screens);

      saveWhatsappFormRevision({
        variables: {
          input: {
            whatsappFormId: params.id,
            definition: JSON.stringify(flowJSON),
          },
        },
      });
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [screens, params.id, saveWhatsappFormRevision]);

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

      <div className={styles.ConfigureContainer}>
        <div className={styles.FlowBuilder}>
          <FormBuilder
            screens={screens}
            onScreensChange={setScreens}
            expandedScreenId={expandedScreenId}
            setExpandedScreenId={setExpandedScreenId}
            expandedContentId={expandedContentId}
            setExpandedContentId={setExpandedContentId}
          />
        </div>
        <div className={styles.Preview}>
          <div className={styles.Toggle}>
            <ToggleButtonGroup
              value={view}
              exclusive
              onChange={(_, value) => {
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
          </div>
          {view === 'variables' ? (
            <Variables
              screens={screens}
              onUpdateScreenName={handleUpdateScreenName}
              onUpdateFieldLabel={handleUpdateFieldLabel}
            />
          ) : (
            <Preview
              screens={screens}
              currentScreenIndex={expandedScreenId ? screens.findIndex((s) => s.id === expandedScreenId) : 0}
            />
          )}
        </div>
      </div>

      {showJSON && <JSONViewer screens={screens} onClose={() => setShowJSON(false)} />}
    </>
  );
};

export default Configure;
