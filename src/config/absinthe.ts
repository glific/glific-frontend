import { SOCKET } from '.';
import { getAuthSession } from '../services/AuthService';
const AbsintheSocket = require('@absinthe/socket');
const SocketApolloLink = require('@absinthe/socket-apollo-link');
const Socket = require('phoenix');

// get auth token
const accessToken = getAuthSession('access_token');

// token is used in the backend to identify the user and potentially the organization associated with the same.
// this is more like an authentication header, which WS does not support. Hence, it is passed as params.
// create socket connection
const socketConnection = new Socket.Socket(SOCKET, { params: { token: accessToken } });
// let's re-try connection only few times
socketConnection.reconnectAfterMs = (tries: any) => {
  return [10, 50, 100, 150, 200, 250, 500, 1000, 2000][tries - 1] || 5000;
};

export default SocketApolloLink.createAbsintheSocketLink(AbsintheSocket.create(socketConnection));
