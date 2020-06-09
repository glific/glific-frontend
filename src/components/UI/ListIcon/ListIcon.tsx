import React from 'react';

import HomeSharpIcon from '@material-ui/icons/HomeSharp';
import LabelSharpIcon from '@material-ui/icons/LabelSharp';
import ChatBubbleSharpIcon from '@material-ui/icons/ChatBubbleSharp';

export interface ListIconProps {
  icon: string;
}

export const ListIcon: React.SFC<ListIconProps> = (props) => {
  switch (props.icon) {
    case 'dashbord':
      return <HomeSharpIcon />;
    case 'tag':
      return <LabelSharpIcon />;
    case 'chat':
      return <ChatBubbleSharpIcon />;
    default:
      return <HomeSharpIcon />;
  }
};

export default ListIcon;
