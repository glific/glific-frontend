import React from 'react';

export interface ContentProps {}

export const Content: React.SFC<ContentProps> = (props) => {
  return (
    <main>
      <div>{props.children}</div>
    </main>
  );
};

export default Content;
