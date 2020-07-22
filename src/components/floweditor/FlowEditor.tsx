import React, { useEffect } from 'react';

declare function showFlowEditor(node: any, config: any): void;

const loadscripts = () => {
  const scriptsToLoad = [
    '2.b44c90d1.chunk.js',
    '3.1cea8884.chunk.js',
    'main.e19d5f85.chunk.js',
    'runtime-main.eb708944.js',
  ];

  const styleToLoad = 'main.e9e6650f.chunk.css';

  scriptsToLoad.map((scriptName) => {
    const script = document.createElement('script');
    script.src = '/js/' + scriptName;
    document.body.appendChild(script);
  });

  const link = document.createElement('link');
  link.href = '/css/' + styleToLoad;
  link.rel = 'stylesheet';
  document.body.appendChild(link);
};

var base_glific = 'http://localhost:4000/flow-editor/';

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
      // simulateStart: '/flow/simulate/{{object.id}}/',
      // simulateResume: '/flow/simulate/{{object.id}}/',
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
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const config = setConfig(props.match.params.uuid);

  useEffect(() => {
    loadscripts();
  }, []);

  useEffect(() => {
    if (typeof showFlowEditor !== 'undefined')
      showFlowEditor(document.getElementById('flow'), config);
    else forceUpdate();
  });

  return <div id="flow"></div>;
};
