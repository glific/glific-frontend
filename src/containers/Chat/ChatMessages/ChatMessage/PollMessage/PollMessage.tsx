import { LinearProgress } from '@mui/material';
import styles from './PollMessage.module.css';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Fragment } from 'react/jsx-runtime';

interface PollMessageProps {
  pollContentJson?: any;
  isSender?: boolean;
  isSimulator?: boolean;
  view?: boolean;
  poll?: any;
}

export const PollMessage = ({ isSender = false, isSimulator = false, view = false, poll }: PollMessageProps) => {
  const pollContentJson = poll.pollContent
    ? typeof poll.pollContent === 'string'
      ? JSON.parse(poll.pollContent)
      : poll.pollContent
    : {};

  const { text, options } = pollContentJson;
  const maxVotes = Math.max(...pollContentJson.options.map((option: any) => option.votes));

  return (
    <div className={`${isSimulator ? styles.SimulatorMessage : styles.ChatMessage} ${isSender && styles.Sender}`}>
      <div className={view ? styles.TextLarge : styles.Text}>{text}</div>
      {!view && (
        <p className={isSender ? styles.SelectTextLight : styles.SelectTextDark}>
          {poll?.allowMultipleAnswer ? 'Select one or more' : 'Select one'}
        </p>
      )}
      <div className={styles.Options}>
        {options.map((option: any, index: number) => {
          const percentage = maxVotes > 0 ? (option.votes / maxVotes) * 100 : 0;
          return (
            <Fragment key={option.id}>
              {option.name ? (
                <div className={styles.Option} key={index}>
                  <span>
                    <span className={view ? styles.OptionNameLarge : styles.OptionName}>
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
                isSimulator && <div className={styles.PlaceHolder}>Option {index + 1}</div>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};
