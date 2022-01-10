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
});

// function to reconnect the web socket connection
// const resetWSConnection = async (wsConnection: any) => {
//   // let's renew the token
//   const authToken = await renewAuthToken();
//   if (authToken.data) {
//     // update localstore
//     setAuthSession(JSON.stringify(authToken.data.data));
//     setLogs('Successful token renewal by websocket', 'info');

//     // connect the socket again
//     wsConnection.connect();
//   }
// };

socketConnection.onError((error: any) => {
  console.log('error socket connection', error);
  // add logs in logflare
  setLogs(error, 'error');
});
// socketConnection.onClose((error: any) => {
//   console.log('closing socket connection', error);
//   // add logs in logflare
//   setLogs(error, 'error');

//   console.log(socketConnection.connectionState());

//   socketConnection.connect({ token: getAuthSession('access_token') });

//   console.log('reached here');
// });

// wrap the Phoenix socket in an AbsintheSocket and export
export default SocketApolloLink.createAbsintheSocketLink(AbsintheSocket.create(socketConnection));
