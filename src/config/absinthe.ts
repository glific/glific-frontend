import { SOCKET } from '.';
import { getAuthSession } from '../services/AuthService';
const AbsintheSocket = require('@absinthe/socket');
const SocketApolloLink = require('@absinthe/socket-apollo-link');
const Socket = require('phoenix');

// get auth token
const accessToken = getAuthSession('access_token');
export default SocketApolloLink.createAbsintheSocketLink(
  AbsintheSocket.create(new Socket.Socket(SOCKET, { params: { token: accessToken } }))
);
