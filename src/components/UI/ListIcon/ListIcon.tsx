import React from 'react';

import HomeSharpIcon from '@material-ui/icons/HomeSharp';
import LabelSharpIcon from '@material-ui/icons/LabelSharp';

export interface ListIconProps {
  icon: string;
}

export const ListIcon: React.SFC<ListIconProps> = (props) => {
  switch (props.icon) {
    case 'dashbord':
      return <HomeSharpIcon />;
    case 'tag':
      return <LabelSharpIcon />;
    default:
      return <HomeSharpIcon />;
  }
};

export default ListIcon;
