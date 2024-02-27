import { useState } from 'react';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { chatRoutes, groupRoutes } from 'routes/AuthenticatedRoute/AuthenticatedRoute';
import { ChatSubscription } from './ChatSubscription/ChatSubscription';
import { GroupMessageSubscription } from 'containers/WA_Groups/GroupMessageSubscription';
import { useLocation } from 'react-router';

export const Chat = () => {
  const [loaded, setDataLoaded] = useState(false);
  const location = useLocation();
  let isWAGroup: boolean = location.pathname.includes('group');
  let routes: any = chatRoutes;
  if (isWAGroup) {
    routes = groupRoutes;
  }

  return (
    <>
      <ChatSubscription setDataLoaded={setDataLoaded} />
      <GroupMessageSubscription setDataLoaded={setDataLoaded} />
      {loaded ? routes : <Loading />}
    </>
  );
};

export default Chat;
