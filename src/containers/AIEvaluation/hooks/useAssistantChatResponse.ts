import { useSubscription } from '@apollo/client/react';
import { useEffect, useRef } from 'react';
import { t } from 'i18next';
import { setErrorMessage } from 'common/notification';
import { ASSISTANT_CHAT_RESPONSE } from 'graphql/subscriptions/Assistant';
import type { AssistantChatResponse, UseAssistantChatResponseOptions } from 'containers/AIEvaluation/types/sandboxType';

export const useAssistantChatResponse = ({ enabled, onResponse }: UseAssistantChatResponseOptions) => {
  const requestIdRef = useRef<string | null>(null);
  const earlyResponsesRef = useRef<AssistantChatResponse[]>([]);

  const onResponseRef = useRef(onResponse);
  useEffect(() => {
    onResponseRef.current = onResponse;
  });

  useSubscription(ASSISTANT_CHAT_RESPONSE, {
    skip: !enabled,
    onError: (error) => setErrorMessage(error, t('Could not listen for the reply')),
    onData: ({ data }) => {
      const result: AssistantChatResponse | undefined = data?.data?.assistantChatResponse;
      if (!result) return;

      // the mutation has not told us our requestId yet — hold this in case it is ours
      if (!requestIdRef.current) {
        earlyResponsesRef.current.push(result);
        return;
      }

      if (result.requestId !== requestIdRef.current) return;

      onResponseRef.current(result);
    },
  });

  const reset = () => {
    requestIdRef.current = null;
    earlyResponsesRef.current = [];
  };

  const expect = (requestId: string | null) => {
    requestIdRef.current = requestId;

    const early = requestId ? earlyResponsesRef.current.find((event) => event.requestId === requestId) : undefined;
    earlyResponsesRef.current = [];
    return early;
  };

  return { reset, expect };
};
