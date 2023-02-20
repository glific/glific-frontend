import { useState } from 'react';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { chatRoutes } from 'routes/AuthenticatedRoute/AuthenticatedRoute';
import { ChatSubscription } from './ChatSubscription/ChatSubscription';

export const Chat = () => {
  const [loaded, setDataLoaded] = useState(false);

  return (
    <>
      <ChatSubscription setDataLoaded={setDataLoaded} />
      {loaded ? chatRoutes : <Loading />}
    </>
  );
};

export default Chat;
