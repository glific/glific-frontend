import React from 'react';

export interface ContentProps {}

export const Content: React.SFC<ContentProps> = (props) => {
  return <div>{props.children}</div>;
};

export default Content;
