import React from 'react';

// import styles from './TerminateFlow.module.css';

export interface TerminateFlowProps {
  contactId: String | undefined;
}

export const TerminateFlow: React.FC<TerminateFlowProps> = ({ contactId }: TerminateFlowProps) => {
  return <div>{contactId}</div>;
};
