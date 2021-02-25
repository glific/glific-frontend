import pino from 'pino';
import { createPinoBrowserSend, createWriteStream } from 'pino-logflare';

const apiKey: string = 'vV5sj8-sZZIa';
const sourceToken: string = '1a0516df-58b6-46a8-88c6-85ed26c8de08';

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
const logger = pino(
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
