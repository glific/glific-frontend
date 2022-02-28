import { getAuthSession } from 'services/AuthService';
import { setNotification } from 'common/notification';
import { CONNECTION_RECONNECT_ATTEMPTS } from 'common/constants';
import setLogs from './logs';
import { SOCKET } from '.';

const AbsintheSocket = require('@absinthe/socket');
const SocketApolloLink = require('@absinthe/socket-apollo-link');
const PhoenixSocket = require('phoenix');

const closingError = () => {
  setNotification(
    'Sorry! Unable to show live messages. Kindly, refresh the page.',
    'warning',
    null
  );
};
// token is used in the backend to identify the user and potentially the organization associated with the same.
// this is more like an authentication header, which WS does not support. Hence, it is passed as params.
// note that params are called as a function because we want to get the user token after authentication.
// create Phoenix socket connection
const socketConnection = new PhoenixSocket.Socket(SOCKET, {
  params: () => {
    if (getAuthSession('access_token')) {
      return { token: getAuthSession('access_token') };
    }

    return {};
  },
  reconnectAfterMs: (tries: number) => tries * 1000,
});

let retryCounter = 0;

socketConnection.onError(() => {
  // add logs in log flare

  retryCounter += 1;
  if (retryCounter > CONNECTION_RECONNECT_ATTEMPTS) {
    retryCounter = 0;
    socketConnection.disconnect();
    closingError();
  }
  setLogs('Socket connection error', 'error');
});

socketConnection.onClose((reason: any) => {
  // add logs in log flare

  const reasonString = JSON.stringify(reason, ['reason', 'code', 'type']);

  // this is normal closure. Not sure why this is happening
  if (reason.code === 1000) {
    closingError();
  }
  setLogs(`Socket connection closed: ${reasonString}`, 'error');
});

// wrap the Phoenix socket in an AbsintheSocket and export
export default SocketApolloLink.createAbsintheSocketLink(AbsintheSocket.create(socketConnection));
