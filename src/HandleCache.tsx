import { useState, useEffect } from 'react';
import packageJson from '../package.json';

const currentAppVersion = packageJson.version;

const checkVersionMismatch = (latest: any, current: any) => {
  const latestVersion = latest.split(/\./g);
  const currentVersion = current.split(/\./g);

  while (latestVersion.length || currentVersion.length) {
    const a = Number(latestVersion.shift());
    const b = Number(currentVersion.shift()); // eslint-disable-next-line no-continue
    if (a === b) continue;
    // eslint-disable-next-line no-restricted-globals
    return a > b || isNaN(b);
  }
  return false;
};

const HandleCache = () => {
  const [isVersionAvailable, setIsVersionAvailable] = useState(false);

  const getLatestAppVersion = () => {
    fetch('/meta.json')
      .then((response: any) => response.json())
      .then((meta: any) => {
        const appMetaVersion = meta.version;
        const shouldForceRefresh = checkVersionMismatch(appMetaVersion, currentAppVersion);
        if (shouldForceRefresh) {
          console.log(`New verion - ${appMetaVersion}. available need to force refresh`);
          setIsVersionAvailable(true);
        } else {
          console.log(`Already latest version - ${appMetaVersion}. No refresh required.`);
          setIsVersionAvailable(false);
        }
      });
  };

  useEffect(() => {
    getLatestAppVersion();
  }, []);

  const clearCacheAndReload = () => {
    console.log('Clearing cache and reloading');
    // TODO clearing cache if any

    // Hard reloading for site
    window.location.reload(true);
  };

  return {
    isVersionAvailable,
    clearCacheAndReload,
  };
};

export default HandleCache;
