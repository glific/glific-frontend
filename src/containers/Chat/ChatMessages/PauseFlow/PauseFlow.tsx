import React, { useState } from 'react';
import Tooltip from 'components/UI/Tooltip/Tooltip';
import { ReactComponent as InfoIcon } from 'assets/images/icons/Info.svg';
import { Switch } from '@material-ui/core';
import { PAUSE_FLOW, RESUME_FLOW } from 'graphql/mutations/Flow';
import { useMutation } from '@apollo/client';
import styles from './PauseFlow.module.css';

export interface PauseFlowProps {
  contactId: string;
}

export const PauseFlow: React.FC<PauseFlowProps> = ({ contactId }: PauseFlowProps) => {
  const [checked, setChecked] = useState(true);

  const [pauseFlow] = useMutation(PAUSE_FLOW);

  const [resumeFlow] = useMutation(RESUME_FLOW);

  console.log(contactId);
  const handleChange = (event: any) => {
    const isChecked = event.target.checked;
    console.log(contactId);
    if (isChecked) {
      resumeFlow({ variables: { contactId } });
    } else {
      pauseFlow({ variables: { contactId } });
    }
    setChecked(isChecked);
  };

  return (
    <div className={styles.PauseSectionContainer}>
      <div>{checked ? 'Flows on' : 'Flow paused'}</div>
      <Switch
        checked={checked}
        onChange={handleChange}
        name="gilad"
        classes={{
          thumb: styles.Thumb,
          switchBase: styles.SwitchBase,
          track: styles.Track,
        }}
      />
      <Tooltip
        tooltipClass={styles.Tooltip}
        title={
          checked
            ? 'Automated messages will continue to be sent. Click to pause.'
            : 'Automated messages have been paused. Click to resume. It will be reset after 3hrs. The previous flow will be expired.'
        }
        placement="right"
      >
        <InfoIcon />
      </Tooltip>
    </div>
  );
};
