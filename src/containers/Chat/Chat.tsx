import React, { useState } from 'react';
import Loading from 'components/UI/Layout/Loading/Loading';
import { chatRoutes } from 'route/AuthenticatedRoute/AuthenticatedRoute';
import ChatSubscription from './ChatSubscription/ChatSubscription';

export interface ChatProps {
  contactId?: number | string | null;
  collectionId?: number | null;
  savedSearches?: boolean;
}

export const Chat: React.FC<ChatProps> = () => {
  const [loaded, setDataLoaded] = useState(false);

  return (
    <>
      <ChatSubscription setDataLoaded={setDataLoaded} />
      {loaded ? chatRoutes : <Loading />}
    </>
  );
};

export default Chat;
