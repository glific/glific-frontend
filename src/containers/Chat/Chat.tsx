import Loading from 'components/UI/Layout/Loading/Loading';
import React, { useState } from 'react';
import ChatInterface from './ChatInterface/ChatInterface';
import ChatSubscription from './ChatSubscription/ChatSubscription';

export interface ChatProps {
  contactId?: number | string | null;
  collectionId?: number | null;
  savedSearches?: boolean;
}

export const Chat: React.SFC<ChatProps> = (props) => {
  const [loaded, setDataLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <ChatSubscription setDataLoaded={setDataLoaded} setLoading={setLoading} />;
      {loading ? <Loading /> : loaded && <ChatInterface {...props} />}
    </>
  );
};

export default Chat;
