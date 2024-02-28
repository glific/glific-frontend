import { useQuery } from '@apollo/client';
import { GROUP_QUERY_VARIABLES } from 'common/constants';
import { GROUP_SEARCH_QUERY } from 'graphql/queries/WA_Groups';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { CollectionContactList } from 'containers/Collection/CollectionContact/CollectionContactList/CollectionContactList';

export const GroupDetails = () => {
  const params = useParams();
  const { t } = useTranslation();
  const [conversationInfo, setConversationInfo] = useState<any>({});
  let groupId = params.id;

  const { data: allConversations }: any = useQuery(GROUP_SEARCH_QUERY, {
    variables: GROUP_QUERY_VARIABLES,
    fetchPolicy: 'cache-only',
  });

  const findContactInAllConversations = () => {
    if (allConversations && allConversations.search) {
      allConversations.search.map((conversation: any, index: any) => {
        if (conversation.waGroup?.id === groupId?.toString()) {
          setConversationInfo(conversation?.waGroup);
        }
        return null;
      });
    }
  };

  useEffect(() => {
    if (groupId) {
      findContactInAllConversations();
    }
  }, [groupId, allConversations]);

  return (
    <>
      <CollectionContactList title={` \n ${conversationInfo.label}`} />
    </>
  );
};

export default GroupDetails;
