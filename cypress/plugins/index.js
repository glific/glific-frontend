/// <reference types="cypress" />
/* global process */
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
export const plugins = (on, config) => {
  // require("@cypress/code-coverage/task")(on, config);
  const toNestedObject = (source) =>
    Object.entries(source || {}).reduce((acc, [key, value]) => {
      if (!key.includes('__')) {
        acc[key] = value;
        return acc;
      }

      const path = key.split('__').filter(Boolean);
      if (path.length === 0) {
        return acc;
      }

      path.reduce((target, segment, index) => {
        if (index === path.length - 1) {
          target[segment] = value;
          return target[segment];
        }

        if (
          typeof target[segment] !== 'object' ||
          target[segment] === null ||
          Array.isArray(target[segment])
        ) {
          target[segment] = {};
        }

        return target[segment];
      }, acc);

      return acc;
    }, {});

  // Merge Cypress-provided env plus explicit CYPRESS_ vars from CI.
  const cypressPrefixedEnv = Object.entries(process.env).reduce((acc, [key, value]) => {
    if (!key.startsWith('CYPRESS_')) {
      return acc;
    }

    acc[key.replace(/^CYPRESS_/, '')] = value;
    return acc;
  }, {});

  config.env = {
    ...toNestedObject(config.env),
    ...toNestedObject(cypressPrefixedEnv),
  };

  return config;
};
