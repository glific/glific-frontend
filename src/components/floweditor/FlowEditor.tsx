import { useEffect, useState } from 'react';
import { useMutation, useLazyQuery, useQuery } from '@apollo/client';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Menu, MenuItem, Typography } from '@mui/material';
import BackIconFlow from 'assets/images/icons/BackIconFlow.svg?react';
import WarningIcon from 'assets/images/icons/Warning.svg?react';
import PreviewIcon from 'assets/images/icons/PreviewIcon.svg?react';
import TranslateIcon from 'assets/images/icons/LanguageTranslation.svg?react';
import PublishIcon from 'assets/images/icons/PublishIcon.svg?react';
import { Button } from 'components/UI/Form/Button/Button';
import { APP_NAME } from 'config/index';
import { Simulator } from 'components/simulator/Simulator';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { setErrorMessage, setNotification } from 'common/notification';
import { PUBLISH_FLOW, RESET_FLOW_COUNT } from 'graphql/mutations/Flow';
import { EXPORT_FLOW, GET_FLOW_DETAILS, GET_FREE_FLOW } from 'graphql/queries/Flow';
import { setAuthHeaders } from 'services/AuthService';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import Track from 'services/TrackService';
import { exportFlowMethod } from 'common/utils';
import styles from './FlowEditor.module.css';
import { checkElementInRegistry, loadfiles, setConfig } from './FlowEditor.helper';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { BackdropLoader, FlowTranslation } from 'containers/Flow/FlowTranslation';

declare function showFlowEditor(node: any, config: any): void;

customElements.define = checkElementInRegistry(customElements.define);

export const FlowEditor = () => {
  const params = useParams();
  const { uuid } = params;
  const navigate = useNavigate();
  const location = useLocation();
  const [publishDialog, setPublishDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flowEditorLoaded, setFlowEditorLoaded] = useState(false);
  const [flowId, setFlowId] = useState();
  const isTemplate = location?.state === 'template';
  const config = setConfig(uuid, isTemplate);
  const [published, setPublished] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [stayOnPublish, setStayOnPublish] = useState(false);
  const [showResetFlowModal, setShowResetFlowModal] = useState(false);
  const [showTranslateFlowModal, setShowTranslateFlowModal] = useState(false);
  const [flowValidation, setFlowValidation] = useState<any>();
  const [IsError, setIsError] = useState(false);
  const [currentEditDialogBox, setCurrentEditDialogBox] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [publishLoading, setPublishLoading] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  let modal = null;
  let dialog = null;
  let flowTitle: any;
  let flowKeywords;

  const loadFlowEditor = () => {
    showFlowEditor(document.getElementById('flow'), config);
    setLoading(false);
  };

  const [getFreeFlowForced] = useLazyQuery(GET_FREE_FLOW, {
    fetchPolicy: 'network-only',
    onCompleted: () => {
      loadFlowEditor();
    },
  });

  const [getFreeFlow] = useLazyQuery(GET_FREE_FLOW, {
    fetchPolicy: 'network-only',
    onCompleted: ({ flowGet }) => {
      if (flowGet.flow && !flowEditorLoaded) {
        loadFlowEditor();
        setFlowEditorLoaded(true);
      } else if (flowGet.errors && flowGet.errors.length) {
        setDialogMessage(flowGet.errors[0].message);
        setCurrentEditDialogBox(true);
      }
    },
  });

  const [exportFlowMutation, { loading: exportFlowloading }] = useLazyQuery(EXPORT_FLOW, {
    fetchPolicy: 'network-only',
    onCompleted: async ({ exportFlow }) => {
      const { exportData } = exportFlow;
      exportFlowMethod(exportData, flowTitle);
    },
    onError: (error) => {
      setErrorMessage(error);
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
      setPublishLoading(false);
    },
    onError: () => {
      setPublishLoading(false);
      setNotification('Sorry! An error occurred', 'warning');
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

  useEffect(() => {
    if (flowName && flowName.flows.length > 0) {
      setFlowId(flowName.flows[0].id);
    }
  }, [flowName]);

  if (flowName && flowName.flows.length > 0) {
    flowTitle = flowName.flows[0].name;
    flowKeywords = flowName.flows[0].keywords.join(', ');
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

  if (showTranslateFlowModal) {
    modal = (
      <FlowTranslation
        loadFlowEditor={loadFlowEditor}
        flowId={flowId}
        setDialog={setShowTranslateFlowModal}
      />
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

      const onfocus = () => {
        getFreeFlow({ variables: { id: flowId } });
      };

      // when switching tabs we need to check if the flow is still active for the user
      window.addEventListener('focus', onfocus);

      Track('Flow opened');

      return () => {
        Object.keys(files).forEach((node: any) => {
          if (files[node] && document.body.contains(files[node])) {
            document.body.removeChild(files[node]);
          }
        });
        // clearing all timeouts when component unmounts
        const highestTimeoutId: any = setTimeout(() => {});
        for (let timeoutId = 0; timeoutId < highestTimeoutId; timeoutId += 1) {
          clearTimeout(timeoutId);
        }
        window.removeEventListener('focus', onfocus);
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
      {flowValidation.map((message: any) => (
        <div key={message.message} className={styles.ErrorMsg}>
          <WarningIcon className={styles.ErrorMsgIcon} />
          {message.message}
        </div>
      ))}
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
          getFreeFlowForced({ variables: { id: flowId, isForced: true } });
          setCurrentEditDialogBox(false);
        }}
        handleMiddle={() => {
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
        buttonOk="Publish & stay"
        titleAlign="center"
        buttonOkLoading={publishLoading}
        buttonMiddle="Publish & go back"
        handleOk={() => {
          setPublishLoading(true);
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
        title="Errors were detected in the flow. Would you like to continue modifying?"
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

  const getFlowKeyword = () => {
    const flows = flowName ? flowName.flows : null;
    if (flows && flows.length > 0) {
      const { isActive, keywords, isTemplate } = flows[0];
      if (isTemplate) {
        return 'temp:';
      } else if (isActive && keywords.length > 0) {
        return `draft:${keywords[0]}`;
      } else if (keywords.length === 0) {
        return 'No keyword found';
      } else {
        return 'Sorry, the flow is not active';
      }
    }
  };

  return (
    <>
      {exportFlowloading && <BackdropLoader />}
      {dialog}
      <div className={styles.Header}>
        <div className={styles.Title}>
          <BackIconFlow
            onClick={() => (isTemplate ? navigate('/flow?isTemplate=true') : navigate('/flow'))}
            className={styles.BackIcon}
            data-testid="back-button"
          />
          <div>
            <Typography variant="h6" data-testid="flowName">
              {flowName ? flowTitle : 'Flow'}
            </Typography>
            <div>{flowKeywords}</div>
          </div>
        </div>

        <div className={styles.Actions}>
          <Button
            aria-controls={open ? 'demo-customized-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            variant="outlined"
            data-testid="moreButton"
            disableElevation
            onClick={handleClick}
          >
            More <ArrowDropDownIcon />
          </Button>
          <Menu
            id="demo-customized-menu"
            MenuListProps={{
              'aria-labelledby': 'demo-customized-button',
            }}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            <MenuItem
              onClick={() => {
                exportFlowMutation({
                  variables: {
                    id: flowId,
                  },
                });
                handleClose();
              }}
              disableRipple
            >
              Export flow
            </MenuItem>
            <MenuItem
              onClick={() => {
                setShowResetFlowModal(true);
                handleClose();
              }}
              disableRipple
              disabled={isTemplate}
            >
              Reset flow count
            </MenuItem>
          </Menu>
          <Button
            variant="outlined"
            color="primary"
            data-testid="translateButton"
            disabled={isTemplate}
            onClick={() => {
              setShowTranslateFlowModal(true);
              handleClose();
            }}
          >
            <TranslateIcon className={styles.Icon} />
            Translate
          </Button>
          <Button
            variant="outlined"
            color="primary"
            data-testid="previewButton"
            onClick={() => setShowSimulator(!showSimulator)}
          >
            <PreviewIcon className={styles.Icon} />
            Preview
          </Button>
          <Button
            variant="contained"
            color="primary"
            data-testid="button"
            disabled={isTemplate}
            onClick={() => setPublishDialog(true)}
          >
            <PublishIcon className={styles.Icon} />
            Publish
          </Button>
        </div>
      </div>

      {showSimulator && (
        <Simulator
          setShowSimulator={setShowSimulator}
          hasResetButton
          flowSimulator
          message={getFlowKeyword()}
          flowId={flowId}
        />
      )}
      {modal}
      <div className={styles.FlowContainer}>
        <div id="flow" />
        {loading && <Loading showTip />}
      </div>
    </>
  );
};

export default FlowEditor;
