import { useContext, useEffect, useState } from 'react';
import { useMutation, useLazyQuery, useQuery } from '@apollo/client';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { IconButton } from '@mui/material';

import { ReactComponent as HelpIcon } from 'assets/images/icons/Help.svg';
import { ReactComponent as FlowIcon } from 'assets/images/icons/Flow/Dark.svg';
import { ReactComponent as WarningIcon } from 'assets/images/icons/Warning.svg';
import { ReactComponent as ExportIcon } from 'assets/images/icons/Flow/Export.svg';
import { ReactComponent as ResetFlowIcon } from 'assets/images/icons/Flow/ResetFlow.svg';
import { Button } from 'components/UI/Form/Button/Button';
import { APP_NAME, FLOWS_HELP_LINK } from 'config/index';
import { Simulator } from 'components/simulator/Simulator';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { setNotification } from 'common/notification';
import { PUBLISH_FLOW, RESET_FLOW_COUNT } from 'graphql/mutations/Flow';
import { EXPORT_FLOW, GET_FLOW_DETAILS, GET_FREE_FLOW } from 'graphql/queries/Flow';
import { setAuthHeaders } from 'services/AuthService';
import { SideDrawerContext } from 'context/session';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { exportFlowMethod } from 'common/utils';
import styles from './FlowEditor.module.css';
import { checkElementInRegistry, loadfiles, setConfig } from './FlowEditor.helper';

declare function showFlowEditor(node: any, config: any): void;

customElements.define = checkElementInRegistry(customElements.define);

export const FlowEditor = () => {
  const params = useParams();
  const { uuid } = params;
  const navigate = useNavigate();
  const [publishDialog, setPublishDialog] = useState(false);
  const [simulatorId, setSimulatorId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [flowEditorLoaded, setFlowEditorLoaded] = useState(false);

  const config = setConfig(uuid);
  const [published, setPublished] = useState(false);
  const [stayOnPublish, setStayOnPublish] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showResetFlowModal, setShowResetFlowModal] = useState(false);
  const [lastLocation, setLastLocation] = useState<Location | null>(null);
  const [confirmedNavigation, setConfirmedNavigation] = useState(false);
  const [flowValidation, setFlowValidation] = useState<any>();
  const [IsError, setIsError] = useState(false);
  const [flowKeyword, setFlowKeyword] = useState('');
  const [currentEditDialogBox, setCurrentEditDialogBox] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const { drawerOpen } = useContext(SideDrawerContext);

  let modal = null;
  let dialog = null;
  let flowTitle: any;

  const [getFreeFlow] = useLazyQuery(GET_FREE_FLOW, {
    fetchPolicy: 'network-only',
    onCompleted: ({ flowGet }) => {
      if (flowGet.flow && !flowEditorLoaded) {
        showFlowEditor(document.getElementById('flow'), config);
        setLoading(false);
        setFlowEditorLoaded(true);
      } else if (flowGet.errors && flowGet.errors.length) {
        setDialogMessage(flowGet.errors[0].message);
        setCurrentEditDialogBox(true);
      }
    },
  });

  const [exportFlowMutation] = useLazyQuery(EXPORT_FLOW, {
    fetchPolicy: 'network-only',
    onCompleted: async ({ exportFlow }) => {
      const { exportData } = exportFlow;
      exportFlowMethod(exportData, flowTitle);
    },
  });
  const [resetFlowCountMethod] = useMutation(RESET_FLOW_COUNT, {
    onCompleted: ({ resetFlowCount }) => {
      const { success } = resetFlowCount;
      if (success) {
        setNotification('Flow counts have been reset', 'success');
        setShowResetFlowModal(false);
        window.location.reload();
      }
    },
    onError: (error) => {
      setNotification('An error occured while resetting the flow count', 'warning');
    },
  });

  const [publishFlow] = useMutation(PUBLISH_FLOW, {
    onCompleted: (data) => {
      if (data.publishFlow.errors && data.publishFlow.errors.length > 0) {
        setFlowValidation(data.publishFlow.errors);
        setIsError(true);
      } else if (data.publishFlow.success) {
        setPublished(true);
      }
    },
  });

  const { data: flowName } = useQuery(GET_FLOW_DETAILS, {
    fetchPolicy: 'network-only',
    variables: {
      filter: {
        uuid,
      },
      opts: {},
    },
  });

  let flowId: any;

  // flowname can return an empty array if the uuid present is not correct
  if (flowName && flowName.flows.length > 0) {
    flowTitle = flowName.flows[0].name;
    flowId = flowName.flows[0].id;
  }

  const closeModal = () => {
    setModalVisible(false);
  };
  // eslint-disable-next-line no-unused-vars
  const handleBlockedNavigation = (nextLocation: any): boolean => {
    if (!confirmedNavigation) {
      setModalVisible(true);
      setLastLocation(nextLocation);
      return false;
    }
    return true;
  };
  const handleConfirmNavigationClick = () => {
    setModalVisible(false);
    setConfirmedNavigation(true);
  };
  useEffect(() => {
    if (confirmedNavigation && lastLocation) {
      navigate(lastLocation);
    }
  }, [confirmedNavigation, lastLocation, navigate]);

  if (modalVisible) {
    modal = (
      <DialogBox
        title="Unsaved changes!"
        handleOk={handleConfirmNavigationClick}
        handleCancel={closeModal}
        colorOk="warning"
        buttonOk="Ignore & leave"
        buttonCancel="Stay & recheck"
        alignButtons="center"
        contentAlign="center"
        additionalTitleStyles={styles.DialogTitle}
      >
        <div className={styles.DialogContent}>
          Your changes will not be saved if you navigate away. Please save as draft or publish.
        </div>
      </DialogBox>
    );
  }

  const handleResetFlowCount = () => {
    resetFlowCountMethod({ variables: { flowId } });
  };

  if (showResetFlowModal) {
    modal = (
      <DialogBox
        title="Warning!"
        handleOk={handleResetFlowCount}
        handleCancel={() => setShowResetFlowModal(false)}
        colorOk="warning"
        buttonOk="Accept & reset"
        buttonCancel="DON'T RESET YET"
        alignButtons="center"
        contentAlign="center"
        additionalTitleStyles={styles.DialogTitle}
      >
        <div className={styles.DialogContent}>
          Please be careful, this cannot be undone. Once you reset the flow counts you will lose
          tracking of how many times a node was triggered for users.
        </div>
      </DialogBox>
    );
  }

  useEffect(() => {
    if (flowName) {
      document.title = flowTitle;
    }
    return () => {
      document.title = APP_NAME;
    };
  }, [flowName]);

  useEffect(() => {
    if (flowId) {
      const { fetch, xmlSend, xmlOpen } = setAuthHeaders();
      const files = loadfiles(() => {
        getFreeFlow({ variables: { id: flowId } });
      });

      // when switching tabs we need to check if the flow is still active for the user
      window.onfocus = () => {
        getFreeFlow({ variables: { id: flowId } });
      };

      return () => {
        Object.keys(files).forEach((node: any) => {
          if (files[node]) {
            document.body.removeChild(files[node]);
          }
        });
        // clearing all timeouts when component unmounts
        const highestTimeoutId: any = setTimeout(() => {});
        for (let timeoutId = 0; timeoutId < highestTimeoutId; timeoutId += 1) {
          clearTimeout(timeoutId);
        }
        XMLHttpRequest.prototype.send = xmlSend;
        XMLHttpRequest.prototype.open = xmlOpen;
        window.fetch = fetch;
      };
    }
    return () => {};
  }, [flowId]);

  const handlePublishFlow = () => {
    publishFlow({ variables: { uuid: params.uuid } });
  };

  const handleCancelFlow = () => {
    setPublishDialog(false);
    setIsError(false);
    setFlowValidation('');
  };

  const errorMsg = () => (
    <div className={styles.DialogError}>
      Errors were detected in the flow. Would you like to continue modifying?
      <div>
        {flowValidation.map((message: any) => (
          <div key={message.message}>
            <WarningIcon className={styles.ErrorMsgIcon} />
            {message.message}
          </div>
        ))}
      </div>
    </div>
  );

  if (currentEditDialogBox) {
    dialog = (
      <DialogBox
        title={dialogMessage}
        alignButtons="center"
        skipCancel
        buttonOk="Take Over"
        buttonMiddle="Go Back"
        handleOk={() => {
          getFreeFlow({ variables: { id: flowId, isForced: true } });
          setCurrentEditDialogBox(false);
        }}
        handleMiddle={() => {
          setConfirmedNavigation(true);
          navigate('/flow');
        }}
      >
        <p className={styles.DialogDescription}>
          You can either go back and edit it later or <br /> &lsquo;Take Over&rsquo; this flow to
          start editing now.
        </p>
      </DialogBox>
    );
  }

  if (publishDialog) {
    dialog = (
      <DialogBox
        title="Ready to publish?"
        buttonOk="Publish & Stay"
        titleAlign="center"
        buttonMiddle="Publish & go back"
        handleOk={() => {
          setStayOnPublish(true);
          handlePublishFlow();
        }}
        handleCancel={() => handleCancelFlow()}
        handleMiddle={() => {
          setStayOnPublish(false);
          handlePublishFlow();
        }}
        alignButtons="center"
        buttonCancel="Cancel"
        additionalTitleStyles={styles.PublishDialogTitle}
      >
        <p className={styles.DialogDescription}>New changes will be activated for the users</p>
      </DialogBox>
    );
  }

  if (IsError) {
    dialog = (
      <DialogBox
        title=""
        buttonOk="Publish"
        handleOk={() => {
          setPublishDialog(false);
          setIsError(false);
          setPublished(true);
        }}
        handleCancel={() => handleCancelFlow()}
        alignButtons="center"
        buttonCancel="Modify"
      >
        {errorMsg()}
      </DialogBox>
    );
  }

  if (published && !IsError) {
    setNotification('The flow has been published');
    if (!stayOnPublish) {
      return <Navigate to="/flow" />;
    }
    setPublishDialog(false);
    setPublished(false);
  }

  const resetMessage = () => {
    setFlowKeyword('');
  };

  const getFlowKeyword = () => {
    const flows = flowName ? flowName.flows : null;
    if (flows && flows.length > 0) {
      const { isActive, keywords } = flows[0];
      if (isActive && keywords.length > 0) {
        setFlowKeyword(`draft:${keywords[0]}`);
      } else if (keywords.length === 0) {
        setFlowKeyword('No keyword found');
      } else {
        setFlowKeyword('Sorry, the flow is not active');
      }
    }
  };

  return (
    <>
      {dialog}
      <div className={styles.ButtonContainer}>
        <a
          href={FLOWS_HELP_LINK}
          className={styles.Link}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="helpButton"
        >
          <HelpIcon className={styles.HelpIcon} />
        </a>

        <Button
          variant="contained"
          className={styles.ContainedButton}
          onClick={() => {
            navigate('/flow');
          }}
        >
          Back
        </Button>

        <div
          className={styles.ExportIcon}
          onClick={() => exportFlowMutation({ variables: { id: flowId } })}
          aria-hidden="true"
        >
          <ExportIcon />
        </div>

        <Button
          variant="outlined"
          color="primary"
          data-testid="saveDraftButton"
          className={simulatorId === 0 ? styles.Draft : styles.SimulatorDraft}
          onClick={() => {
            setNotification('The flow has been saved as draft');
          }}
        >
          Save as draft
        </Button>

        <Button
          variant="contained"
          color="primary"
          data-testid="button"
          className={styles.ContainedButton}
          onClick={() => setPublishDialog(true)}
        >
          Publish
        </Button>
      </div>
      <Simulator
        showSimulator={simulatorId > 0}
        setSimulatorId={setSimulatorId}
        hasResetButton
        flowSimulator
        message={flowKeyword}
        resetMessage={resetMessage}
        getFlowKeyword={getFlowKeyword}
      />
      {modal}
      {/* TODOS: need to add custom Prompt */}
      {/* <Prompt when message={handleBlockedNavigation} /> */}
      <div className={styles.FlowContainer}>
        <div
          className={drawerOpen ? styles.FlowName : styles.FlowNameClosed}
          data-testid="flowName"
        >
          {flowName && (
            <>
              <IconButton disabled className={styles.Icon}>
                <FlowIcon />
              </IconButton>

              {flowTitle}
            </>
          )}
        </div>

        <Button
          variant="outlined"
          color="primary"
          className={drawerOpen ? styles.ResetFlow : styles.ResetClosedDrawer}
          data-testid="resetFlow"
          onClick={() => setShowResetFlowModal(true)}
          aria-hidden="true"
        >
          <ResetFlowIcon /> Reset flow counts
        </Button>
        <div id="flow" />
        {loading && <Loading />}
      </div>
    </>
  );
};

export default FlowEditor;
