import React from 'react';
import styles from './ContactDescription.module.css';
import { Timer } from '../../../../components/UI/Timer/Timer';

export interface ContactDescriptionProps {
  fields: any;
  settings: any;
  phoneNo: string;
  groups: any;
  lastMessage: string;
}

export const ContactDescription: React.FC<ContactDescriptionProps> = ({
  fields,
  settings,
  phoneNo,
  groups,
  lastMessage,
}: ContactDescriptionProps) => {
  let assignedToGroup: any = Array.from(
    new Set([].concat(...groups.map((group: any) => group.users.map((user: any) => user.name))))
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
      value: assignedToGroup ? assignedToGroup : 'None',
    },
  ];

  if (typeof settings === "string") {
    settings = JSON.parse(settings);
  }

  if (typeof fields === "string") {
    fields = JSON.parse(fields);
  }

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
            <div className={styles.DescriptionItem}>{groupItem.label}</div>
            <div className={styles.DescriptionItemValue} data-testid="groups">
              {groupItem.value}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.DetailBlock}>
        {settings && typeof settings === "object" && Object.keys(settings).map((key) => (
          <div key={key}>
            <div className={styles.DescriptionItem}>{key}</div>
            <div className={styles.DescriptionItemValue}>
              {Object.keys(settings[key]).filter((settingKey) => {
                return settings[key][settingKey] === true;
              }).join(', ')}
            </div>
          </div>
        ))}
        {fields && typeof fields === "object" && Object.keys(fields).map((key) => (
          <div key={key}>
            <div className={styles.DescriptionItem}>{fields[key].label ? fields[key].label : key.replace('_', ' ')}</div>
            <div className={styles.DescriptionItemValue}>{fields[key].value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
