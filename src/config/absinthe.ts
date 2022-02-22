import { getAuthSession } from 'services/AuthService';
import setLogs from './logs';
import { SOCKET } from '.';

const AbsintheSocket = require('@absinthe/socket');
const SocketApolloLink = require('@absinthe/socket-apollo-link');
const PhoenixSocket = require('phoenix');

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

socketConnection.onError(() => {
  // add logs in log flare

  setLogs('Socket connection error', 'error');
});

socketConnection.onClose((reason: any) => {
  // add logs in log flare

  const reasonString = JSON.stringify(reason, ['reason', 'code', 'type']);
  setLogs(`Socket connection closed: ${reasonString}`, 'error');
});

export { socketConnection };

// wrap the Phoenix socket in an AbsintheSocket and export
export default SocketApolloLink.createAbsintheSocketLink(AbsintheSocket.create(socketConnection));
