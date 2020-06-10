import React from 'react';

export interface ChatInputProps {}

export const ChatInput: React.SFC<ChatInputProps> = () => {
  return (
    <div>
      <textarea></textarea>
    </div>
  );
};

export default ChatInput;
