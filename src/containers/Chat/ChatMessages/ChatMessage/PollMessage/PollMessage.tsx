import { LinearProgress } from '@mui/material';
import styles from './PollMessage.module.css';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

interface PollMessageProps {
  pollContentJson: any;
  isSender: boolean;
}

const getTotalVotes = (options: any) => {
  return options.reduce((acc: number, option: any) => acc + option.votes, 0);
};

export const PollMessage = ({ pollContentJson, isSender }: PollMessageProps) => {
  const { text, options } = pollContentJson;
  const totalVotes = getTotalVotes(options);

  return (
    <div className={`${styles.PollsContainer} ${isSender && styles.Sender}`}>
      <div className={styles.Text}>{text}</div>
      <p className={styles.SelectText}>Select one or more</p>
      <div className={styles.Options}>
        {options.map((option: any, index: number) => {
          return (
            <div className={styles.Option} key={index}>
              <span>
                <span className={styles.OptionName}>
                  <RadioButtonUncheckedIcon fontSize="small" />
                  {option.name}
                </span>
                <span className={styles.Vote}>{option.votes}</span>
              </span>
              <LinearProgress
                classes={{
                  root: styles.LinearProgress,
                }}
                variant="determinate"
                value={(option.votes / totalVotes) * 100}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
