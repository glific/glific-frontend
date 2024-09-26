interface AssistantProps {
  assistants: { id: string; inserted_at: string; name: string }[];
}

export const AssistantsAttached = ({ assistants }: AssistantProps) => {
  return <div></div>;
};
