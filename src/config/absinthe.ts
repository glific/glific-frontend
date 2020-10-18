import { SOCKET } from '.';
import { getAuthSession } from '../services/AuthService';
const AbsintheSocket = require('@absinthe/socket');
const SocketApolloLink = require('@absinthe/socket-apollo-link');
const PhoenixSocket = require('phoenix');

// get auth token
const accessToken = getAuthSession('access_token');

// token is used in the backend to identify the user and potentially the organization associated with the same.
// this is more like an authentication header, which WS does not support. Hence, it is passed as params.
// create socket connection
const socketConnection = new PhoenixSocket.Socket(SOCKET, { params: { token: accessToken } });

export default SocketApolloLink.createAbsintheSocketLink(AbsintheSocket.create(socketConnection));
