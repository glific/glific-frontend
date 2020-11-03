import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Prompt, Redirect, useHistory } from 'react-router';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import styles from './FlowEditor.module.css';
import { ReactComponent as HelpIcon } from '../../assets/images/icons/Help.svg';
import { Button } from '../UI/Form/Button/Button';
import { PUBLISH_AUTOMATION } from '../../graphql/mutations/Automation';
import { APP_NAME, FLOW_EDITOR_CONFIGURE_LINK } from '../../config/index';
import { FLOW_EDITOR_API } from '../../config/index';
import * as Manifest from '@nyaruka/flow-editor/build/asset-manifest.json';
import { GET_AUTOMATION_NAME } from '../../graphql/queries/Automation';
import { ReactComponent as AutomationIcon } from '../../assets/images/icons/Automations/Dark.svg';
import { IconButton } from '@material-ui/core';
import { Simulator } from '../simulator/Simulator';
import { DialogBox } from '../UI/DialogBox/DialogBox';

declare function showFlowEditor(node: any, config: any): void;

const loadfiles = () => {
  const files: Array<HTMLScriptElement | HTMLLinkElement> = [];
  const filesToLoad: any = Manifest.files;
  let index = 0;
  for (const fileName in filesToLoad) {
    if (!filesToLoad[fileName].startsWith('./static')) {
      continue;
    }
    if (filesToLoad[fileName].endsWith('.js')) {
      index++;
      const script = document.createElement('script');
      script.src = filesToLoad[fileName].slice(1);
      script.id = 'flowEditorScript' + index;
      script.async = false;
      document.body.appendChild(script);
      files.push(script);
    }

    if (filesToLoad[fileName].endsWith('.css')) {
      const link = document.createElement('link');
      link.href = filesToLoad[fileName].slice(1);
      link.id = 'flowEditorfile' + index;
      link.rel = 'stylesheet';
      document.body.appendChild(link);
    }
  }

  return files;
};

const base_glific = FLOW_EDITOR_API;

const setConfig = (uuid: any) => {
  return {
    flow: uuid,
    flowType: 'message',
    localStorage: true,
    mutable: true,
    filters: ['whatsapp'],

    excludeTypes: [
      'send_broadcast',
      'add_contact_urn',
      'remove_contact_groups',
      'send_email',
      'set_run_result',
      'call_resthook',
      'start_session',
      'open_ticket',
      'split_by_expression',
      'transfer_airtime',
      'split_by_intent',
      'split_by_contact_field',
      'split_by_run_result',
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
      'has_phone',
      'has_phone_category',
      'has_email',
      'has_email_category',
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
      globals: base_glific + 'globals',
      groups: base_glific + 'groups',
      fields: base_glific + 'fields',
      labels: base_glific + 'labels',
      channels: base_glific + 'channels',
      classifiers: base_glific + 'classifiers',
      ticketers: base_glific + 'ticketers',
      resthooks: base_glific + 'resthooks',
      templates: base_glific + 'templates',
      languages: base_glific + 'languages',
      environment: base_glific + 'environment',
      recipients: base_glific + 'recipients',
      completion: base_glific + 'completion',
      activity: base_glific + 'activity',
      flows: base_glific + 'flows',
      revisions: base_glific + 'revisions/' + uuid,
      functions: base_glific + 'functions',
      editor: FLOW_EDITOR_CONFIGURE_LINK,
    },
  };
};

export interface FlowEditorProps {
  match: any;
}

export const FlowEditor = (props: FlowEditorProps) => {
  const history = useHistory();
  const uuid = props.match.params.uuid;
  const [publishDialog, setPublishDialog] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const config = setConfig(uuid);
  const [publishFlow] = useMutation(PUBLISH_AUTOMATION);
  const [published, setPublished] = useState(false);
  let dialog = null;
  const [modalVisible, setModalVisible] = useState(false);
  const [lastLocation, setLastLocation] = useState<Location | null>(null);
  const [confirmedNavigation, setConfirmedNavigation] = useState(false);

  let modal = null;

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
  }, [confirmedNavigation, lastLocation]);

  if (modalVisible) {
    modal = (
      <DialogBox
        title="Do you want to navigate away without saving your changes?"
        handleOk={handleConfirmNavigationClick}
        handleCancel={closeModal}
        colorOk="secondary"
        alignButtons={'center'}
      ></DialogBox>
    );
  }

  const { data: automationName } = useQuery(GET_AUTOMATION_NAME, {
    variables: {
      filter: {
        uuid: uuid,
      },
      opts: {},
    },
  });

  let automationTitle: any;
  let automationKeyword: any;
  if (automationName) {
    automationTitle = automationName.flows[0].name;
    automationKeyword = automationName.flows[0].keywords[0];
  }

  useEffect(() => {
    if (automationName) {
      document.title = automationTitle;
    }
    return () => {
      document.title = APP_NAME;
    };
  }, [automationName]);

  useEffect(() => {
    const files = loadfiles();
    return () => {
      for (const node in files) {
        document.body.removeChild(files[node]);
      }
    };
  }, []);

  useEffect(() => {
    const lastFile: HTMLScriptElement | null = document.body.querySelector('#flowEditorScript4');
    if (lastFile) {
      lastFile.onload = () => {
        showFlowEditor(document.getElementById('flow'), config);
      };
    }
  }, [config]);

  const handlePublishFlow = () => {
    publishFlow({ variables: { uuid: props.match.params.uuid } });
    setPublished(true);
  };

  if (publishDialog) {
    dialog = (
      <DialogBox
        title="Are you ready to publish the flow?"
        buttonOk="Publish"
        handleOk={() => handlePublishFlow()}
        handleCancel={() => setPublishDialog(false)}
        alignButtons="center"
      >
        <p className={styles.DialogDescription}>New changes will be activated for the users</p>
      </DialogBox>
    );
  }

  if (published) {
    return <Redirect to="/automation" />;
  }

  return (
    <>
      {dialog}
      <div className={styles.ButtonContainer}>
        <a
          href="https://app.rapidpro.io/video/"
          className={styles.Link}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="helpButton"
        >
          <HelpIcon className={styles.HelpIcon} />
        </a>

        <Button variant="contained" color="default" onClick={() => history.push('/automation')}>
          Back
        </Button>

        <Button variant="outlined" color="primary" className={styles.Button}>
          Save as draft
        </Button>
        <Button
          variant="outlined"
          color="primary"
          className={styles.Button}
          onClick={() => {
            setShowSimulator(!showSimulator);
          }}
        >
          Preview
          {showSimulator ? (
            <CancelOutlinedIcon
              className={styles.CrossIcon}
              onClick={() => {
                setShowSimulator(false);
              }}
            />
          ) : null}
        </Button>
        <Button
          variant="contained"
          color="primary"
          data-testid="button"
          onClick={() => setPublishDialog(true)}
        >
          Publish
        </Button>
      </div>
      {showSimulator ? (
        <Simulator
          showSimulator={showSimulator}
          setShowSimulator={setShowSimulator}
          message={{ type: 'draft', keyword: automationKeyword }}
        />
      ) : null}
      {modal}
      <Prompt when={true} message={handleBlockedNavigation} />

      <div className={styles.FlowContainer}>
        <div className={styles.AutomationName} data-testid="automationName">
          {automationName ? (
            <>
              <IconButton disabled={true} className={styles.Icon}>
                <AutomationIcon />
              </IconButton>

              {automationTitle}
            </>
          ) : null}
        </div>
        <div id="flow"></div>
      </div>
    </>
  );
};
