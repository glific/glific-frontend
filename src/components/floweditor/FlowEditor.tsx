import React, { useEffect, useState } from 'react';
import { useMutation, useLazyQuery, useQuery, useApolloClient } from '@apollo/client';
import { Prompt, Redirect, useHistory } from 'react-router-dom';
import { IconButton } from '@material-ui/core';

import { ReactComponent as HelpIcon } from 'assets/images/icons/Help.svg';
import { ReactComponent as FlowIcon } from 'assets/images/icons/Flow/Dark.svg';
import { ReactComponent as WarningIcon } from 'assets/images/icons/Warning.svg';
import { ReactComponent as ExportIcon } from 'assets/images/icons/Flow/Export.svg';
import { Button } from 'components/UI/Form/Button/Button';
import { APP_NAME, FLOWS_HELP_LINK } from 'config/index';
import { Simulator } from 'components/simulator/Simulator';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { setNotification } from 'common/notification';
import { PUBLISH_FLOW } from 'graphql/mutations/Flow';
import { EXPORT_FLOW, GET_FLOW_DETAILS, GET_FREE_FLOW } from 'graphql/queries/Flow';
import { setAuthHeaders } from 'services/AuthService';
import { GET_ORGANIZATION_SERVICES } from 'graphql/queries/Organization';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { exportFlowMethod } from 'common/utils';
import styles from './FlowEditor.module.css';
import { safeDecorator, loadfiles, setConfig, checkServices } from './FlowEditor.helper';

customElements.define = safeDecorator(customElements.define);

export interface FlowEditorProps {
  match: any;
}

export const FlowEditor = (props: FlowEditorProps) => {
  const { match } = props;
  const client = useApolloClient();
  const history = useHistory();
  const { uuid } = match.params;
  const [publishDialog, setPublishDialog] = useState(false);
  const [simulatorId, setSimulatorId] = useState(0);
  const [loading, setLoading] = useState(true);

  const config = setConfig(uuid);
  const [published, setPublished] = useState(false);
  const [stayOnPublish, setStayOnPublish] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [lastLocation, setLastLocation] = useState<Location | null>(null);
  const [confirmedNavigation, setConfirmedNavigation] = useState(false);
  const [flowValidation, setFlowValidation] = useState<any>();
  const [IsError, setIsError] = useState(false);
  const [flowKeyword, setFlowKeyword] = useState('');
  const [currentEditDialogBox, setCurrentEditDialogBox] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  let modal = null;
  let dialog = null;
  let flowTitle: any;

  const [getOrganizationServices] = useLazyQuery(GET_ORGANIZATION_SERVICES, {
    fetchPolicy: 'network-only',
  });

  const [getFreeFlow] = useLazyQuery(GET_FREE_FLOW, {
    fetchPolicy: 'network-only',
  });

  const [exportFlowMutation] = useLazyQuery(EXPORT_FLOW, {
    fetchPolicy: 'network-only',
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

  const closeModal = () => {
    setModalVisible(false);
  };
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
      history.push(lastLocation);
    }
  }, [confirmedNavigation, lastLocation, history]);

  if (modalVisible) {
    modal = (
      <DialogBox
        title="Unsaved changes!"
        handleOk={handleConfirmNavigationClick}
        handleCancel={closeModal}
        colorOk="secondary"
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

  const { data: flowName } = useQuery(GET_FLOW_DETAILS, {
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

  const checkFlowAvailable = () => {
    console.log('winddsnc');
    getFreeFlow({ variables: { id: flowId } }).then(({ data: { flowGet } }) => {
      console.log(flowGet);
      if (flowGet.flow) {
        getOrganizationServices().then(({ data: { organizationServices } }) => {
          console.log('ss');
          checkServices(organizationServices, config);
          setLoading(false);
        });
      } else if (flowGet.errors && flowGet.errors.length) {
        setDialogMessage(flowGet.errors[0].message);
        setCurrentEditDialogBox(true);
      }
    });
  };

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
        checkFlowAvailable();
      });

      // when switching tabs we need to check if the flow is still active for the user
      window.onfocus = () => {
        console.log('wodow focus');
        checkFlowAvailable();
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
    publishFlow({ variables: { uuid: props.match.params.uuid } });
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
        buttonOk="Okay"
        handleOk={() => {
          setConfirmedNavigation(true);
          history.push('/flow');
        }}
      >
        <p className={styles.DialogDescription}>Please try again later or contact the user.</p>
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
    setNotification(client, 'The flow has been published');
    if (!stayOnPublish) {
      return <Redirect to="/flow" />;
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
          color="default"
          className={styles.ContainedButton}
          onClick={() => {
            history.push('/flow');
          }}
        >
          Back
        </Button>

        <div
          className={styles.ExportIcon}
          onClick={() =>
            exportFlowMutation({ variables: { id: flowId } }).then(({ data: { exportFlow } }) => {
              const { exportData } = exportFlow;
              exportFlowMethod(exportData, flowTitle);
            })
          }
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
            setNotification(client, 'The flow has been saved as draft');
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
        flowSimulator
        message={flowKeyword}
        resetMessage={resetMessage}
        getFlowKeyword={getFlowKeyword}
      />

      {modal}
      <Prompt when message={handleBlockedNavigation} />

      <div className={styles.FlowContainer}>
        <div className={styles.FlowName} data-testid="flowName">
          {flowName ? (
            <>
              <IconButton disabled className={styles.Icon}>
                <FlowIcon />
              </IconButton>

              {flowTitle}
            </>
          ) : null}
        </div>
        <div id="flow" />
        {loading && <Loading />}
      </div>
    </>
  );
};

export default FlowEditor;
