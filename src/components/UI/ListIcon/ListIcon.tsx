import React from 'react';

import HomeSharpIcon from '@material-ui/icons/HomeSharp';
import LabelSharpIcon from '@material-ui/icons/LabelSharp';
import ChatBubbleSharpIcon from '@material-ui/icons/ChatBubbleSharp';
import ForumSharpIcon from '@material-ui/icons/ForumSharp';
import MoreVertSharpIcon from '@material-ui/icons/MoreVertSharp';

export interface ListIconProps {
  icon: string;
  fontSize?: FontSize;
}

type FontSize = 'small' | 'large' | undefined;
export const ListIcon: React.SFC<ListIconProps> = ({ icon, fontSize }) => {
  switch (icon) {
    case 'tag':
      return <LabelSharpIcon fontSize={fontSize} />;
    case 'chat':
      return <ChatBubbleSharpIcon fontSize={fontSize} />;
    case 'conversation':
      return <ForumSharpIcon fontSize={fontSize} />;
    case 'verticalMenu':
      return <MoreVertSharpIcon fontSize={fontSize} />;
    default:
      return <HomeSharpIcon fontSize={fontSize} />;
  }
};

export default ListIcon;
