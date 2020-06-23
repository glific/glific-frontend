import React, { ChangeEvent } from 'react';
import { ListIcon } from './ListIcon';
import { shallow, mount } from 'enzyme';

import HomeSharpIcon from '@material-ui/icons/HomeSharp';
import LabelSharpIcon from '@material-ui/icons/LabelSharp';
import ChatBubbleSharpIcon from '@material-ui/icons/ChatBubbleSharp';
import ForumSharpIcon from '@material-ui/icons/ForumSharp';
import MoreVertSharpIcon from '@material-ui/icons/MoreVertSharp';

describe('list icon tests', () => {
  const createIcon = (type: string) => {
    return <ListIcon icon={type} />;
  };

  it('renders an object', () => {
    const wrapper = shallow(createIcon(''));
    expect(wrapper).toBeTruthy();
  });

  it('renders label sharp', () => {
    const wrapper = shallow(createIcon('tag'));
    console.log(wrapper.find(LabelSharpIcon).length);
  });

  // case 'tag':
  //   return <LabelSharpIcon />;
  // case 'chat':
  //   return <ChatBubbleSharpIcon />;
  // case 'conversation':
  //   return <ForumSharpIcon />;
  // case 'verticalMenu':
  //   return <MoreVertSharpIcon />;
  // default:
  //   return <HomeSharpIcon />;
});
