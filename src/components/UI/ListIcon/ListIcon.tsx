import React from 'react';
import chatIcon from '../../../assets/images/icons/Chat/Unselected.svg';
import tagIcon from '../../../assets/images/icons/Tags/Unselected.svg';
import broadcastIcon from '../../../assets/images/icons/Broadcast/Unselected.svg';
import automationIcon from '../../../assets/images/icons/Automations/Unselected.svg';
import collectionsIcon from '../../../assets/images/icons/Collections/Unselected.svg';
import goalsIcon from '../../../assets/images/icons/Goals/Unselected.svg';
import analyticsIcon from '../../../assets/images/icons/Analytics/Unselected.svg';
import speedSendIcon from '../../../assets/images/icons/SpeedSend/Unselected.svg';
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
    speedSend: speedSendIcon,
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
