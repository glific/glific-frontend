import { useQuery } from '@apollo/client';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { PollMessage } from 'containers/Chat/ChatMessages/ChatMessage/PollMessage/PollMessage';
import { GET_POLL } from 'graphql/queries/WaPolls';

interface ViewPollProps {
  id: string | null;
  onClose: any;
}

export const ViewPoll = ({ id, onClose }: ViewPollProps) => {
  const { data, loading } = useQuery(GET_POLL, {
    variables: {
      id: id,
    },
  });

  const poll = data?.waPoll?.waPoll;
  const pollContentJson = poll?.pollContent ? JSON.parse(poll?.pollContent) : {};

  if (loading) {
    return <Loading />;
  }

  return (
    <DialogBox title={poll?.label} handleCancel={onClose} alignButtons="center" skipOk skipCancel>
      <PollMessage
        pollContent={{
          poll: poll,
          pollContentJson: pollContentJson,
        }}
        view
      />
    </DialogBox>
  );
};
