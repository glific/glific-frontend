import React, { ChangeEvent } from 'react';
import { ListIcon } from './ListIcon';
import { shallow, mount } from 'enzyme';

import HomeSharpIcon from '@material-ui/icons/HomeSharp';
import LabelSharpIcon from '@material-ui/icons/LabelSharp';
import ChatBubbleSharpIcon from '@material-ui/icons/ChatBubbleSharp';
import ForumSharpIcon from '@material-ui/icons/ForumSharp';
import MoreVertSharpIcon from '@material-ui/icons/MoreVertSharp';

describe('list icon tests', () => {
  const iconList: { [type: string]: any } = {
    tag: LabelSharpIcon,
    chat: ChatBubbleSharpIcon,
    conversation: ForumSharpIcon,
    verticalMenu: MoreVertSharpIcon,
  };
  const createIcon = (type: string) => {
    return <ListIcon icon={type} />;
  };

  it('renders an object', () => {
    const wrapper = shallow(createIcon(''));
    expect(wrapper).toBeTruthy();
  });

  it('renders appropriate tags', () => {
    let keys = Object.keys(iconList);
    for (let i = 0; i < keys.length; i++) {
      const wrapper = shallow(createIcon(keys[i]));
      expect(wrapper.find(iconList[keys[i]]).length).toEqual(1);
    }
    const wrapper = shallow(createIcon('default case'));
    expect(wrapper.find(HomeSharpIcon).length).toEqual(1);
  });
});
