import React, { useEffect } from 'react';
import { Button } from '../UI/Form/Button/Button';
import styles from './FlowEditor.module.css';
import { Link } from 'react-router-dom';
import { FLOW_EDITOR_API } from '../../config/index';
import { ReactComponent as HelpIcon } from '../../assets/images/icons/Help.svg';
import * as Manifest from '@nyaruka/flow-editor/build/asset-manifest.json';

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
      editor: '/',
    },
  };
};

export interface FlowEditorProps {
  match: {
    params: {
      uuid: string;
    };
  };
}

export const FlowEditor = (props: FlowEditorProps) => {
  const config = setConfig(props.match.params.uuid);

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
  }, []);

  return (
    <>
      <a
        href="https://help.nyaruka.com/en/articles/1911210-starting-a-flow"
        className={styles.Link}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="helpButton"
      >
        <HelpIcon className={styles.HelpIcon} />
      </a>
      <Link to="/automation" className={styles.Link}>
        <Button variant="contained" color="primary" className={styles.Button} data-testid="button">
          Done
        </Button>
      </Link>
      <div id="flow"></div>
    </>
  );
};
