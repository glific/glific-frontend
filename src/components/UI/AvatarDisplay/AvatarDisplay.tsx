import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';

import styles from './AvatarDisplay.module.css';

export interface AvatarDisplayProps {
  name: string;
  type?: string;
  badgeDisplay?: boolean;
}

export const AvatarDisplay = ({
  name,
  type = 'normal',
  badgeDisplay = false,
}: AvatarDisplayProps) => {
  const nameInitials = name.split(' ')[0][0];

  let avatarContent = <Avatar className={styles.Default}>{nameInitials}</Avatar>;

  if (badgeDisplay) {
    avatarContent = (
      <Badge overlap="circular" color="primary" variant="dot" badgeContent=" ">
        {avatarContent}
      </Badge>
    );
  }
  return avatarContent;
};
