import Avatar from '@mui/material/Avatar';

import styles from './AvatarDisplay.module.css';

export interface AvatarDisplayProps {
  name: string;
  type?: string;
}

export const AvatarDisplay = ({ name, type = 'normal' }: AvatarDisplayProps) => {
  const nameInitials = name.split(' ')[0][0];

  return <Avatar className={styles.Default}>{nameInitials}</Avatar>;
};
