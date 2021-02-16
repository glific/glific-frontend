import React from 'react';

const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' }),
  ],
});

export interface Props {
  message: string;
}

export const Logs: React.SFC<Props> = ({ ...props }) => {
  const { message } = props;

  logger.log({
    level: 'info',
    message,
  });

  return null;
};
