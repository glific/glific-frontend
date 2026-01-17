import { useMutation, useQuery } from '@apollo/client';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { setErrorMessage, setNotification } from 'common/notification';
import setLogs from 'config/logs';
import { PUBLISH_FORM, SAVE_WHATSAPP_FORM_REVISION } from 'graphql/mutations/WhatsAppForm';
import { GET_LATEST_WHATSAPP_FORM_REVISION } from 'graphql/queries/WhatsAppForm';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import styles from './Configure.module.css';
import { FormBuilder } from './FormBuilder/FormBuilder';
import { Screen } from './FormBuilder/FormBuilder.types';
import { convertFlowJSONToFormBuilder, convertFormBuilderToFlowJSON } from './FormBuilder/FormBuilder.utils';
import { JSONViewer } from './JSONViewer/JSONViewer';
import { Preview } from './Preview/Preview';
import { Variables } from './Variables/Variables';
import { VersionHistory } from './VersionHistory/VersionHistory';
import { ArrowLeftIcon } from '@mui/x-date-pickers';
import { Button } from 'components/UI/Form/Button/Button';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';

export const Configure = () => {
  const [flowName, setFlowName] = useState('');
  const [screens, setScreens] = useState<Screen[]>([]);
  const [expandedScreenId, setExpandedScreenId] = useState<string | null>('1');
  const [expandedContentId, setExpandedContentId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const [showJSON, setShowJSON] = useState(false);
  const [view, setView] = useState<'preview' | 'variables' | 'versions'>('preview');
  const params = useParams();
  const isInitialMount = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const [saveWhatsappFormRevision] = useMutation(SAVE_WHATSAPP_FORM_REVISION, {
    onError: (error) => {
      setNotification('Error saving form revision', 'warning');
      setLogs(error, 'error');
    },
  });

  const [publishWhatsappForm, { loading }] = useMutation(PUBLISH_FORM, {
    onError: (errors: any) => {
      setErrorMessage(errors);
    },
    onCompleted: () => {
      setNotification('Form published successfully', 'success');
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

  const handleUpdateFieldLabel = (screenId: string, contentId: string, newVariableName: string) => {
    setScreens((prevScreens) =>
      prevScreens.map((screen) => {
        if (screen.id === screenId) {
          return {
            ...screen,
            content: screen.content.map((item) =>
              item.id === contentId ? { ...item, data: { ...item.data, variableName: newVariableName } } : item
            ),
          };
        }
        return screen;
      })
    );
  };

  const handleRevisionReverted = ({ revertToWhatsappFormRevision }: any) => {
    if (revertToWhatsappFormRevision?.whatsappFormRevision?.definition) {
      try {
        const flowJSON = JSON.parse(revertToWhatsappFormRevision?.whatsappFormRevision?.definition);

        if (!flowJSON) return;

        const convertedScreens = convertFlowJSONToFormBuilder(flowJSON);
        setScreens(convertedScreens);
      } catch (error) {
        setLogs(error, 'error');
      }
    }
  };

  const handlePublishForm = () => {
    publishWhatsappForm({
      variables: {
        id: params.id,
      },
      onCompleted: () => {
        setNotification('Form published successfully', 'success');
        setOpenDialog(false);
        navigate('/whatsapp-forms');
      },
    });
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

  let dialog;
  if (openDialog) {
    dialog = (
      <DialogBox
        title="Publish Form"
        handleOk={handlePublishForm}
        handleCancel={() => setOpenDialog(false)}
        buttonOkLoading={loading}
        disableOk={loading}
      >
        <p>Are you sure you want to publish this form?</p>
      </DialogBox>
    );
  }

  return (
    <>
      {dialog}
      <div className={styles.Header}>
        <div className={styles.Name}>
          <div
            onClick={() => {
              navigate('/whatsapp-forms');
            }}
            className={styles.BackIcon}
          >
            <ArrowLeftIcon />
          </div>

          <p>{flowName}</p>
        </div>

        <div className={styles.Buttonsscre}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setOpenDialog(true);
            }}
          >
            Publish
          </Button>
          <Button variant="outlined" onClick={handleViewJSON}>
            View JSON
          </Button>
        </div>
      </div>

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
              <ToggleButton value="versions" aria-label="versions">
                Versions
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
          {view === 'variables' ? (
            <Variables screens={screens} onUpdateFieldLabel={handleUpdateFieldLabel} />
          ) : view === 'versions' ? (
            <VersionHistory whatsappFormId={params.id || ''} onRevisionReverted={handleRevisionReverted} />
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
