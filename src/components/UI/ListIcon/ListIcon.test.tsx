import React from 'react';
import { ListIcon } from './ListIcon';
import { shallow, mount } from 'enzyme';

import chatIcon from '../../../assets/images/icons/MenuItems/Chat.svg';
import tagIcon from '../../../assets/images/icons/MenuItems/Tag.svg';
import broadcastIcon from '../../../assets/images/icons/MenuItems/Broadcast.svg';
import automationIcon from '../../../assets/images/icons/MenuItems/Automation.svg';
import collectionsIcon from '../../../assets/images/icons/MenuItems/Collection.svg';
import goalsIcon from '../../../assets/images/icons/MenuItems/Goal.svg';
import analyticsIcon from '../../../assets/images/icons/MenuItems/Analytics.svg';

describe('list icon tests', () => {
  const iconList: { [iconName: string]: string } = {
    chat: chatIcon,
    tag: tagIcon,
    broadcast: broadcastIcon,
    automation: automationIcon,
    collection: collectionsIcon,
    goal: goalsIcon,
    analytics: analyticsIcon,
  };
  const createIcon = (type: string, selected: boolean) => {
    return <ListIcon icon={type} selected={selected} />;
  };

  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  it('renders an object', () => {
    const wrapper = shallow(createIcon('chat', false));
    expect(wrapper).toBeTruthy();
  });

  it('renders appropriate icons', () => {
    let keys = Object.keys(iconList);
    // Check without styling
    for (let i = 0; i < keys.length; i++) {
      const wrapper = shallow(createIcon(keys[i], false));
      expect(wrapper.find('img').props().src).toEqual(capitalize(keys[i]).concat('.svg'));
    }
    // Check with styling
    for (let i = 0; i < keys.length; i++) {
      const wrapper = shallow(createIcon(keys[i], true));
      expect(wrapper.find('img').props().className).toEqual('SelectedColor');
    }
  });
});
