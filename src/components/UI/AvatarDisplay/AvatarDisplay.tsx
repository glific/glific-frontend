import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';

import styles from './AvatarDisplay.module.css';

export interface AvatarDisplayProps {
  name: string;
  type?: string;
  badgeDisplay?: boolean;
}

export const AvatarDisplay = ({ name, type, badgeDisplay = false }: AvatarDisplayProps) => {
  const nameInitials = name?.split(' ')[0][0] || '';

  const avatarClasses = [styles.Default];
  if (type === 'large') {
    avatarClasses.push(styles.Large);
  }
  let avatarContent = <Avatar className={avatarClasses.join(' ')}>{nameInitials}</Avatar>;

  if (badgeDisplay) {
    avatarContent = (
      <Badge overlap="circular" color="primary" variant="dot" badgeContent=" ">
        {avatarContent}
      </Badge>
    );
  }
  return avatarContent;
};
