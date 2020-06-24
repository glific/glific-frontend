import React from 'react';

import HomeSharpIcon from '@material-ui/icons/HomeSharp';
import LabelSharpIcon from '@material-ui/icons/LabelSharp';
import ChatBubbleSharpIcon from '@material-ui/icons/ChatBubbleSharp';
import ForumSharpIcon from '@material-ui/icons/ForumSharp';
import MoreVertSharpIcon from '@material-ui/icons/MoreVertSharp';

export interface ListIconProps {
  icon: string;
}

export const ListIcon: React.SFC<ListIconProps> = (props) => {
  switch (props.icon) {
    case 'tag':
      return <LabelSharpIcon />;
    case 'chat':
      return <ChatBubbleSharpIcon />;
    case 'conversation':
      return <ForumSharpIcon />;
    case 'verticalMenu':
      return <MoreVertSharpIcon />;
    default:
      return <HomeSharpIcon />;
  }
};

export default ListIcon;
