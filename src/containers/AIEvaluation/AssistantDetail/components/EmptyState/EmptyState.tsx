import { ReactNode } from 'react';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  title: ReactNode;
  note: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  testId?: string;
}

export const EmptyState = ({ title, note, icon, action, testId }: EmptyStateProps) => (
  <div className={styles.Wrap} data-testid={testId}>
    {icon && <div className={styles.Icon}>{icon}</div>}
    <div className={styles.Title}>{title}</div>
    <div className={styles.Note}>{note}</div>
    {action && <div className={styles.Action}>{action}</div>}
  </div>
);
