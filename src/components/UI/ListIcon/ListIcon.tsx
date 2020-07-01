import React from 'react';
import chatIcon from '../../../assets/images/icons/MenuItems/Chat.svg';
import tagIcon from '../../../assets/images/icons/MenuItems/Tag.svg';
import broadcastIcon from '../../../assets/images/icons/MenuItems/Broadcast.svg';
import automationIcon from '../../../assets/images/icons/MenuItems/Automation.svg';
import collectionsIcon from '../../../assets/images/icons/MenuItems/Collection.svg';
import goalsIcon from '../../../assets/images/icons/MenuItems/Goal.svg';
import analyticsIcon from '../../../assets/images/icons/MenuItems/Analytics.svg';

import styles from './ListIcon.module.css';

export interface ListIconProps {
  icon: string;
  selected: boolean;
}

export const ListIcon: React.SFC<ListIconProps> = (props) => {
  const stringsToIcons: { [iconName: string]: string } = {
    chat: chatIcon,
    tag: tagIcon,
    broadcast: broadcastIcon,
    automation: automationIcon,
    collection: collectionsIcon,
    goal: goalsIcon,
    analytics: analyticsIcon,
  };

  return (
    <img
      src={stringsToIcons[props.icon]}
      className={props.selected ? styles.SelectedColor : undefined}
      alt={'Selected '.concat(props.icon)}
    />
  );
};

export default ListIcon;
