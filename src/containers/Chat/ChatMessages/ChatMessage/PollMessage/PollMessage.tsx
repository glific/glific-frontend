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
  const maxVotes = Math.max(...pollContentJson.options.map((option: any) => option.votes));

  return (
    <div className={`${isSimulator ? styles.SimpulatorMessage : styles.ChatMessage} ${isSender && styles.Sender}`}>
      <div className={styles.Text}>{text}</div>
      <p className={isSender ? styles.SelectTextLight : styles.SelectTextDark}>Select one or more</p>
      <div className={styles.Options}>
        {options.map((option: any, index: number) => {
          const percentage = maxVotes > 0 ? (option.votes / maxVotes) * 100 : 0;
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
                      root: isSimulator ? styles.LinearProgressSimulator : styles.LinearProgressChat,
                    }}
                    variant="determinate"
                    value={isSimulator ? 0 : percentage}
                    color={isSender ? 'inherit' : 'primary'}
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
