import { SOCKET } from '.';
import { CONNECTION_RECONNECT_ATTEMPTS } from '../common/constants';
import { getAuthSession, renewAuthToken, setAuthSession } from '../services/AuthService';

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
});

// we should try to reconnect ws connection only finite (5) times and then abort and prevent
// unnecessary load on the server
// watch for websocket error event using onError

let connectionFailureCounter = 0;
socketConnection.onError(async () => {
  if (connectionFailureCounter === 0) {
    const authtoken = await renewAuthToken();
    if (authtoken.data) {
      setAuthSession(JSON.stringify(authtoken.data.data));
    }
  }
  // increment the counter when error occurs
  connectionFailureCounter += 1;
  // let's disconnect the socket connection if there are 5 failures
  if (connectionFailureCounter >= CONNECTION_RECONNECT_ATTEMPTS) {
    socketConnection.disconnect();
  }
});

// wrap the Phoenix socket in an AbsintheSocket and export
export default SocketApolloLink.createAbsintheSocketLink(AbsintheSocket.create(socketConnection));
