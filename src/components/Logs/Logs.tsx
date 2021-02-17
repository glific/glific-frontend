import React from 'react';
import pino from 'pino';
import { createPinoBrowserSend, createWriteStream } from 'pino-logflare';

// create pino-logflare stream
const stream = createWriteStream({
  apiKey: 'vV5sj8-sZZIa',
  sourceToken: '1a0516df-58b6-46a8-88c6-85ed26c8de08',
});

// create pino-logflare browser stream
const send = createPinoBrowserSend({
  apiKey: 'vV5sj8-sZZIa',
  sourceToken: '1a0516df-58b6-46a8-88c6-85ed26c8de08',
});

// create pino logger
const logger = pino(
  {
    browser: {
      transmit: {},
    },
  },
  stream
);

export interface Props {
  message: string;
}

export const Logs: React.SFC<Props> = ({ ...props }) => {
  const { message } = props;
  // info: test message my string {}
  // log some events
  logger.info(message);
  logger.error(new Error('things got bad'), 'error message');

  return null;
};
