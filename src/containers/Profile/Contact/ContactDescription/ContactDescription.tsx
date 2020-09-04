import React from 'react';
import styles from './ContactDescription.module.css';
import { Timer } from '../../../../components/UI/Timer/Timer';

export interface ContactDescriptionProps {
  fields: any;
  phoneNo: string;
  groups: any;
  lastMessage: string;
}

export const ContactDescription: React.FC<ContactDescriptionProps> = ({
  fields,
  phoneNo,
  groups,
  lastMessage,
}: ContactDescriptionProps) => {
  let assignedToGroup: any = Array.from(
    new Set(
      [].concat(
        ...groups.map((group: any) => group.users.map((user: any) => user.name.split(' ')[0]))
      )
    )
  );
  if (assignedToGroup.length > 2) {
    assignedToGroup =
      assignedToGroup.slice(0, 2).join(', ') + ' +' + (assignedToGroup.length - 2).toString();
  } else {
    assignedToGroup = assignedToGroup.join(', ');
  }

  const groupDetails = [
    { label: 'Groups', value: groups.map((group: any) => group.label).join(', ') },
    {
      label: 'Assigned to',
      value: assignedToGroup,
    },
  ];

  const otherDetails = [
    { label: 'Actitvity preference', value: '' },
    {
      label: 'Location',
      value: '',
    },
    {
      label: 'Status',
      value: '',
    },
  ];
  return (
    <div className={styles.DescriptionContainer}>
      <h2 className={styles.Title}>Details</h2>
      <div className={styles.Description}>
        <span data-testid="phoneNo">+{phoneNo}</span>

        <div className={styles.SessionTimer}>
          <span>Session Timer</span>
          <Timer time={lastMessage}></Timer>
        </div>
      </div>

      <div className={styles.DetailBlock}>
        {groupDetails.map((groupItem: any, index) => (
          <div key={index}>
            <span className={styles.DescriptionItem}>{groupItem.label}</span>
            <span className={styles.DescriptionItemValue} data-testid="groups">
              {groupItem.value}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.DetailBlock}>
        {otherDetails.map((detail: any, index) => (
          <div key={index}>
            <span className={styles.DescriptionItem}>{detail.label}</span>
            <span className={styles.DescriptionItemValue}>{detail.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
