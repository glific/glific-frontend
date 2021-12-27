import { CONNECTION_RECONNECT_ATTEMPTS, WEBSOCKET_RECONNECTION_ATTEMPTS } from 'common/constants';
import { getAuthSession, renewAuthToken, setAuthSession } from 'services/AuthService';
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
});

// function to reconnect the web socket connection
const resetWSConnection = async (wsConnection: any) => {
  // let's renew the token
  const authToken = await renewAuthToken();
  if (authToken.data) {
    // update localstore
    setAuthSession(JSON.stringify(authToken.data.data));
    setLogs('Successful token renewal by websocket', 'info');

    // connect the socket again
    wsConnection.connect();
  }
};

// we should try to reconnect ws connection only finite (5) times and then abort and prevent
// unnecessary load on the server
// watch for websocket error event using onError
let connectionFailureCounter = 0;
socketConnection.onError(async (error: any) => {
  // add logs in logflare
  setLogs(error, 'error');

  // increment the counter when error occurs
  connectionFailureCounter += 1;
  // let's disconnect the socket connection if there are 5 failures
  if (connectionFailureCounter >= CONNECTION_RECONNECT_ATTEMPTS) {
    socketConnection.disconnect();

    // lets not indefinitely try to reconnect
    if (connectionFailureCounter < WEBSOCKET_RECONNECTION_ATTEMPTS) {
      // let's trigger the reconnect function after 5sec
      setTimeout(() => resetWSConnection(socketConnection), 5000);
    }
  }
});

// wrap the Phoenix socket in an AbsintheSocket and export
export default SocketApolloLink.createAbsintheSocketLink(AbsintheSocket.create(socketConnection));
