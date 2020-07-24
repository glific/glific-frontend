import React, { useEffect } from 'react';
import { Button } from '../UI/Form/Button/Button';
import styles from './FlowEditor.module.css';
import { Link } from 'react-router-dom';
import { FLOW_EDITOR_API } from '../../config/index';
import Manifest from '@nyaruka/flow-editor/build/asset-manifest.json';
require(`@nyaruka/flow-editor/build/static/css/${Manifest.files['main.css'].slice(13)}`);

declare function showFlowEditor(node: any, config: any): void;

const loadscripts = () => {
  const scripts: Array<HTMLScriptElement | HTMLLinkElement> = [];
  const scriptsToLoad: any = Manifest.files;
  let index = 0;
  for (const scriptName in scriptsToLoad) {
    if (!scriptsToLoad[scriptName].startsWith('./static')) {
      continue;
    }
    if (scriptsToLoad[scriptName].endsWith('.js')) {
      index++;
      const script = document.createElement('script');
      script.src = '/floweditor/' + scriptsToLoad[scriptName].slice(12);
      script.id = 'flowEditorScript' + index;
      script.async = false;
      document.body.appendChild(script);
      scripts.push(script);
    }
  }

  return scripts;
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

export const FlowEditor = (props: any) => {
  const config = setConfig(props.match.params.uuid);

  useEffect(() => {
    const scripts = loadscripts();
    return () => {
      for (const node in scripts) {
        document.body.removeChild(scripts[node]);
      }
    };
  }, []);

  useEffect(() => {
    const lastScript: HTMLScriptElement | null = document.body.querySelector('#flowEditorScript4');
    if (lastScript) {
      lastScript.onload = () => {
        showFlowEditor(document.getElementById('flow'), config);
      };
    }
  }, []);

  return (
    <>
      <Link to="/automation" className={styles.Link}>
        <Button variant="contained" color="primary" className={styles.Button}>
          Complete
        </Button>
      </Link>
      <div id="flow"></div>
    </>
  );
};
