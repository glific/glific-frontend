import { useMutation, useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import { setErrorMessage, setNotification } from 'common/notification';
import { FLOW_STATUS_PUBLISHED, setVariables } from 'common/constants';
import { SearchDialogBox } from 'components/UI/SearchDialogBox/SearchDialogBox';
import { CircularProgress } from '@mui/material';
import { GET_FLOWS } from 'graphql/queries/Flow';
import {
  ADD_FLOW_TO_COLLECTION,
  ADD_FLOW_TO_CONTACT,
  ADD_FLOW_TO_WA_GROUP,
} from 'graphql/mutations/Flow';

interface StartAFlowProps {
  collectionId: string | undefined;
  entityId?: any;
  setShowFlowDialog: any;
  groups?: boolean;
}

export const StartAFlow = ({
  collectionId,
  setShowFlowDialog,
  groups,
  entityId,
}: StartAFlowProps) => {
  const { t } = useTranslation();

  const { data: flowsData, loading } = useQuery(GET_FLOWS, {
    variables: setVariables({
      status: FLOW_STATUS_PUBLISHED,
      isActive: true,
    }),
    fetchPolicy: 'network-only', // set for now, need to check cache issue
  });

  const [addFlowToWaGroups] = useMutation(ADD_FLOW_TO_WA_GROUP, {
    onCompleted: () => {
      setNotification(t('Flow started successfully.'));
    },
    onError: (error) => {
      setErrorMessage(error);
    },
  });

  const [addFlow] = useMutation(ADD_FLOW_TO_CONTACT, {
    onCompleted: () => {
      setNotification(t('Flow started successfully.'));
    },
    onError: (error) => {
      setErrorMessage(error);
    },
  });

  const [addFlowToCollection] = useMutation(ADD_FLOW_TO_COLLECTION, {
    onCompleted: () => {
      setNotification(t('Your flow will start in a couple of minutes.'));
    },
  });

  const handleFlowSubmit = (flowId: any) => {
    if (!flowId) return;
    const flowVariables: any = {
      flowId,
    };

    if (entityId) {
      if (groups) {
        flowVariables.waGroupId = entityId;
        addFlowToWaGroups({
          variables: flowVariables,
        });
      } else {
        flowVariables.contactId = entityId;
        addFlow({
          variables: flowVariables,
        });
      }
    }

    if (collectionId) {
      flowVariables.groupId = collectionId;
      addFlowToCollection({
        variables: flowVariables,
      });
    }

    setShowFlowDialog(false);
  };

  const closeFlowDialogBox = () => {
    setShowFlowDialog(false);
  };

  let flowOptions = [];
  if (flowsData) {
    flowOptions = flowsData.flows;
  }
  if (loading) {
    return <CircularProgress data-testid="loading" />;
  }

  return (
    <SearchDialogBox
      title={t('Select flow')}
      handleOk={handleFlowSubmit}
      handleCancel={closeFlowDialogBox}
      options={flowOptions}
      optionLabel="name"
      multiple={false}
      buttonOk="Start"
      textFieldPlaceholder={t('Select flow')}
      description={t('The contact will be responded as per the messages planned in the flow.')}
    />
  );
};

export default StartAFlow;
