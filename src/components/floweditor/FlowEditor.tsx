import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useApolloClient } from '@apollo/client';
import { Prompt, Redirect, useHistory } from 'react-router-dom';
import { IconButton } from '@material-ui/core';

import * as Manifest from '@glific/flow-editor/build/asset-manifest.json';

import styles from './FlowEditor.module.css';
import { ReactComponent as HelpIcon } from '../../assets/images/icons/Help.svg';
import { ReactComponent as FlowIcon } from '../../assets/images/icons/Flow/Dark.svg';
import { ReactComponent as WarningIcon } from '../../assets/images/icons/Warning.svg';
import { Button } from '../UI/Form/Button/Button';
import { APP_NAME, FLOW_EDITOR_CONFIGURE_LINK, FLOW_EDITOR_API } from '../../config/index';
import { Simulator } from '../simulator/Simulator';
import { DialogBox } from '../UI/DialogBox/DialogBox';
import { setNotification } from '../../common/notification';
import { PUBLISH_FLOW } from '../../graphql/mutations/Flow';
import { GET_FLOW_DETAILS } from '../../graphql/queries/Flow';

declare function showFlowEditor(node: any, config: any): void;

const loadfiles = () => {
  const files: Array<HTMLScriptElement | HTMLLinkElement> = [];
  const filesToLoad: any = Manifest.files;
  let index = 0;
  Object.keys(filesToLoad).forEach((fileName) => {
    if (filesToLoad[fileName].startsWith('/static')) {
      if (filesToLoad[fileName].endsWith('.js')) {
        index += 1;
        const script = document.createElement('script');
        script.src = filesToLoad[fileName];
        script.id = `flowEditorScript${index}`;
        script.async = false;
        files.push(script);
      }

      if (filesToLoad[fileName].endsWith('.css')) {
        const link = document.createElement('link');
        link.href = filesToLoad[fileName];
        link.id = `flowEditorfile${index}`;
        link.rel = 'stylesheet';
        document.body.appendChild(link);
      }
    }
  });

  // loading the largest file first
  document.body.appendChild(files[3]);
  document.body.appendChild(files[0]);
  document.body.appendChild(files[2]);
  document.body.appendChild(files[1]);

  return files;
};

const glificBase = FLOW_EDITOR_API;

const setConfig = (uuid: any) => ({
  flow: uuid,
  flowType: 'message',
  localStorage: true,
  mutable: true,
  filters: ['whatsapp'],

  excludeTypes: [
    'add_contact_urn',
    'send_email',
    'set_run_result',
    'call_resthook',
    'start_session',
    'open_ticket',
    'transfer_airtime',
    'split_by_intent',
    'split_by_contact_field',
    'split_by_random',
    'split_by_groups',
    'split_by_scheme',
  ],

  excludeOperators: [
    'has_beginning',
    'has_text',
    'has_number_lt',
    'has_number_lte',
    'has_number_gte',
    'has_number_gt',
    'has_date',
    'has_date_category',
    'has_date_lt',
    'has_number_lte',
    'has_number_gte',
    'has_number_gt',
    'has_date',
    'has_date_category',
    'has_date_lt',
    'has_date_eq',
    'has_date_gt',
    'has_time',
    'has_group',
    'has_category',
    'has_state',
    'has_state_category',
    'has_district',
    'has_ward',
    'has_error',
    'has_value',
    'has_pattern',
  ],
  help: {
    legacy_extra: 'help.html',
    missing_dependency: 'help.html',
    invalid_regex: 'help.html',
  },
  endpoints: {
    simulateStart: false,
    simulateResume: false,
    globals: `${glificBase}globals`,
    groups: `${glificBase}groups`,
    fields: `${glificBase}fields`,
    labels: `${glificBase}labels`,
    channels: `${glificBase}channels`,
    classifiers: `${glificBase}classifiers`,
    ticketers: `${glificBase}ticketers`,
    resthooks: `${glificBase}resthooks`,
    templates: `${glificBase}templates`,
    languages: `${glificBase}languages`,
    environment: `${glificBase}environment`,
    recipients: `${glificBase}recipients`,
    completion: `${glificBase}completion`,
    activity: `${glificBase}activity`,
    flows: `${glificBase}flows`,
    revisions: `${glificBase}revisions/${uuid}`,
    functions: `${glificBase}functions`,
    editor: FLOW_EDITOR_CONFIGURE_LINK,
    validateMedia: `${glificBase}validate-media`,
  },
});

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

  const config = setConfig(uuid);
  const [published, setPublished] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [lastLocation, setLastLocation] = useState<Location | null>(null);
  const [confirmedNavigation, setConfirmedNavigation] = useState(false);
  const [flowValidation, setFlowValidation] = useState<any>();
  const [IsError, setIsError] = useState(false);
  const [flowKeyword, setFlowKeyword] = useState('');

  let modal = null;
  let dialog = null;

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
        title="Do you want to navigate away without saving your changes?"
        handleOk={handleConfirmNavigationClick}
        handleCancel={closeModal}
        colorOk="secondary"
        alignButtons="center"
      />
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
  let flowTitle: any;

  // flowname can return an empty array if the uuid present is not correct
  if (flowName && flowName.flows.length > 0) {
    flowTitle = flowName.flows[0].name;
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
    const files = loadfiles();
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
    };
  }, []);

  useEffect(() => {
    // check if runtime main file is present and then load
    const lastFile: HTMLScriptElement | null = document.body.querySelector('#flowEditorScript2');
    if (lastFile) {
      lastFile.onload = () => {
        showFlowEditor(document.getElementById('flow'), config);
      };
    }
  }, [config]);

  const handlePublishFlow = () => {
    publishFlow({ variables: { uuid: props.match.params.uuid } });
  };

  const handleCancelFlow = () => {
    setPublishDialog(false);
    setIsError(false);
    setFlowValidation('');
  };

  const errorMsg = () => (
    <p className={styles.DialogError}>
      Errors were detected in the flow. Would you like to continue modifying?
      <p>
        {flowValidation.map((message: any) => (
          <p key={message.message}>
            <WarningIcon className={styles.ErrorMsgIcon} />
            {message.message}
          </p>
        ))}
      </p>
    </p>
  );

  if (publishDialog) {
    dialog = (
      <DialogBox
        title="Are you ready to publish the flow?"
        buttonOk="Publish"
        handleOk={() => handlePublishFlow()}
        handleCancel={() => handleCancelFlow()}
        alignButtons="center"
        buttonCancel="Cancel"
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
    return <Redirect to="/flow" />;
  }

  const resetMessage = () => {
    setFlowKeyword('');
  };

  const getFlowKeyword = () => {
    if (flowName && flowName.flows.length > 0) {
      if (flowName.flows[0].keywords.length > 0) {
        setFlowKeyword(`draft:${flowName.flows[0].keywords[0]}`);
      } else {
        setFlowKeyword('No keyword found');
      }
    }
  };
  return (
    <>
      {dialog}
      <div className={styles.ButtonContainer}>
        <a
          href="https://glific.slab.com/public/3-flows-e2mlrud4"
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

        <Button
          variant="outlined"
          color="primary"
          data-testid="saveDraftButton"
          className={simulatorId === 0 ? styles.Draft : styles.SimulatorDraft}
          onClick={() => {
            setConfirmedNavigation(true);
            setNotification(client, 'The flow has been saved as draft');
            history.push('/flow');
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
      </div>
    </>
  );
};

export default FlowEditor;
