import pino from 'pino';
import { createPinoBrowserSend, createWriteStream } from 'pino-logflare';
import { LOGFLARE_API, LOGFLARE_SOURCE } from '.';

let logger: any;

if (LOGFLARE_API && LOGFLARE_SOURCE) {
  const apiKey = LOGFLARE_API;
  const sourceToken = LOGFLARE_SOURCE;
  // create pino-logflare stream
  const stream = createWriteStream({
    apiKey,
    sourceToken,
  });

  // create pino-logflare browser stream
  const send = createPinoBrowserSend({
    apiKey,
    sourceToken,
  });

  // create pino logger
  logger = pino(
    {
      browser: {
        transmit: {
          // @ts-ignore
          send,
        },
      },
    },
    stream
  );
}

export const setLogs = (message: any, type: string) => {
  // log some events
  switch (type) {
    case 'info':
      logger.log('info', message);
      break;
    case 'error':
      logger.error(message);
      break;
    default:
      break;
  }
};

export { setLogs as default };
