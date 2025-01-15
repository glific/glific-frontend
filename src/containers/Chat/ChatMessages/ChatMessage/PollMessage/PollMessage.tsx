import { LinearProgress } from '@mui/material';
import styles from './PollMessage.module.css';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

interface PollMessageProps {
  pollContentJson: any;
  isSender?: boolean;
  isSimulator?: boolean;
}

const getTotalVotes = (options: any) => {
  return options.reduce((acc: number, option: any) => acc + option.votes, 0);
};

export const PollMessage = ({ pollContentJson, isSender = false, isSimulator = false }: PollMessageProps) => {
  const { text, options } = pollContentJson;
  const totalVotes = getTotalVotes(options);

  return (
    <div className={`${isSimulator ? styles.SimpulatorMessage : styles.ChatMessage} ${isSender && styles.Sender}`}>
      <div className={styles.Text}>{text}</div>
      <p className={styles.SelectText}>Select one or more</p>
      <div className={styles.Options}>
        {options.map((option: any, index: number) => {
          return (
            <>
              {option.name ? (
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
                      root: isSimulator ? styles.LinearProgressChat : styles.LinearProgressSimulator,
                    }}
                    variant="determinate"
                    value={isSimulator ? 0 : (option.votes / totalVotes) * 100}
                  />
                </div>
              ) : (
                isSimulator && <div className={styles.PlaceHolder}>Option {option.id + 1}</div>
              )}
            </>
          );
        })}
      </div>
    </div>
  );
};
