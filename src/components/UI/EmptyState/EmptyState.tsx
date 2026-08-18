import { ReactNode } from 'react';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  title: ReactNode;
  note: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  testId?: string;
}

export const EmptyState = ({ title, note, icon, action, className, testId }: EmptyStateProps) => (
  <div className={`${styles.Wrap} ${className ?? ''}`} data-testid={testId}>
    {icon && <div className={styles.Icon}>{icon}</div>}
    <div className={styles.Title}>{title}</div>
    <div className={styles.Note}>{note}</div>
    {action && <div className={styles.Action}>{action}</div>}
  </div>
);
