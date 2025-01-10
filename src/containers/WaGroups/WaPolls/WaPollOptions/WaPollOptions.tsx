import { ClickAwayListener, FormControl, FormHelperText, IconButton, TextField, Typography } from '@mui/material';
import styles from './WaPollOptions.module.css';
import { Button } from 'components/UI/Form/Button/Button';
import CrossIcon from 'assets/images/icons/Cross.svg?react';
import EmojiPicker from 'components/UI/EmojiPicker/EmojiPicker';
import { useState } from 'react';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';

interface WaPollOptionsProps {
  form: { field: any; errors: any; touched: any; values: any; setFieldValue: any };
  options: string[];
}

const emojiStyles = {
  position: 'absolute',
  bottom: '25px',
  right: '-150px',
  zIndex: 100,
};

export const WaPollOptions = ({ form: { values, setFieldValue, errors, touched } }: WaPollOptionsProps) => {
  const handleAddOption = () => {
    setFieldValue('options', [...values.options, '']);
  };

  const handleInput = (value: any, ind: any) => {
    const newOptions = [...values.options];
    newOptions[ind] = value;
    setFieldValue('options', newOptions);
  };

  const handleEmojiAdd = (emoji: any, ind: number) => {
    console.log(emoji);

    const newOptions = [...values.options];
    const value = newOptions[ind] + emoji?.native;
    newOptions[ind] = value;
    setFieldValue('options', newOptions);
  };

  const handleRemoveClick = (index: any) => {
    const newOptions = [...values.options];
    setFieldValue(
      'options',
      newOptions.filter((_, ind: any) => ind !== index)
    );
  };

  return (
    <div className={styles.Container}>
      <Typography className={styles.Title} variant="h6">
        Poll Options
      </Typography>
      <div className={styles.Options}>
        {values.options.map((option: any, ind: number) => (
          <PollOption
            key={ind}
            ind={ind}
            option={option}
            options={values.options}
            handleInput={handleInput}
            handleRemoveClick={handleRemoveClick}
            handleEmojiAdd={handleEmojiAdd}
            errors={errors['options']}
            touched={touched['options']}
          />
        ))}
        {values.options.length < 10 && (
          <Button variant="outlined" onClick={handleAddOption}>
            Add Option
          </Button>
        )}
      </div>
    </div>
  );
};

interface PollOptionProps {
  option: string;
  ind: number;
  options: any;
  errors: any;
  touched: any;
  handleInput: any;
  handleRemoveClick: any;
  handleEmojiAdd: any;
}

const PollOption = ({
  option,
  ind,
  options,
  errors,
  touched,
  handleInput,
  handleRemoveClick,
  handleEmojiAdd,
}: PollOptionProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const hasError = errors && touched && errors[ind] && touched[ind];

  return (
    <FormControl key={ind} fullWidth error={hasError} color={hasError ? 'error' : 'primary'}>
      <div className={styles.OptionField}>
        <TextField
          className={styles.TextField}
          variant="outlined"
          placeholder={`Option ${ind + 1}`}
          value={option}
          onChange={(event) => handleInput(event.target.value, ind)}
          slotProps={{
            input: {
              endAdornment: (
                <ClickAwayListener onClickAway={() => setShowEmojiPicker(false)}>
                  <IconButton
                    data-testid="emoji-picker"
                    color="primary"
                    aria-label="pick emoji"
                    component="span"
                    className={styles.EmojiButton}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <EmojiEmotionsOutlinedIcon className={styles.EmojiIcon} role="img" aria-label="pick emoji" />
                  </IconButton>
                </ClickAwayListener>
              ),
            },
          }}
        />

        {options.length !== 2 && (
          <CrossIcon
            className={styles.RemoveIcon}
            title="Remove"
            data-testid="cross-icon"
            onClick={() => handleRemoveClick(ind)}
          />
        )}
        {showEmojiPicker && (
          <EmojiPicker onEmojiSelect={(emoji: any) => handleEmojiAdd(emoji, ind)} displayStyle={emojiStyles} />
        )}
      </div>
      {hasError ? <FormHelperText>{errors[ind]}</FormHelperText> : null}
    </FormControl>
  );
};
