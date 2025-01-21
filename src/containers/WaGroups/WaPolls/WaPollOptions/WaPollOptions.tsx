import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import { ClickAwayListener, FormControl, FormHelperText, IconButton, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import CrossIcon from 'assets/images/icons/Cross.svg?react';
import EmojiPicker from 'components/UI/EmojiPicker/EmojiPicker';
import { Button } from 'components/UI/Form/Button/Button';
import styles from './WaPollOptions.module.css';

interface WaPollOptionsProps {
  form: { field: any; errors: any; touched: any; values: any; setFieldValue: any };
  options: string[];
  isEditing: boolean;
}

const emojiStyles = {
  position: 'absolute',
  bottom: '25px',
  right: '-150px',
  zIndex: 100,
};

export const WaPollOptions = ({ form: { values, setFieldValue, errors, touched }, isEditing }: WaPollOptionsProps) => {
  const handleAddOption = () => {
    const lastId = values?.options[values?.options.length - 1]?.id;
    setFieldValue('options', [...values.options, { name: '', id: lastId + 1 }]);
  };

  const handleInput = (value: any, id: any) => {
    const newOptions = values.options.map((option: any) => (option.id === id ? { ...option, name: value } : option));
    setFieldValue('options', newOptions);
  };

  const handleEmojiAdd = (emoji: any, id: number) => {
    const newOptions = values.options.map((option: any) =>
      option.id === id ? { ...option, name: option.name + emoji.native } : option
    );

    setFieldValue('options', newOptions);
  };

  const handleRemoveClick = (id: any) => {
    const newOptions = values.options.filter((option: any) => option.id !== id);
    setFieldValue('options', newOptions);
  };

  return (
    <div className={styles.Container}>
      <Typography className={styles.Title} variant="h6">
        Poll Options
      </Typography>
      <div className={styles.Options}>
        {values.options.map((option: any, ind: number) => (
          <PollOption
            key={option.id}
            ind={ind}
            option={option}
            options={values.options}
            handleInput={handleInput}
            handleRemoveClick={handleRemoveClick}
            handleEmojiAdd={handleEmojiAdd}
            errors={errors['options']}
            touched={touched['options']}
            isEditing={isEditing}
          />
        ))}
        <FormHelperText error={true}>
          {errors['options'] && typeof errors['options'] === 'string' && errors['options']}
        </FormHelperText>

        {values.options.length < 12 && !isEditing && (
          <Button variant="outlined" onClick={handleAddOption}>
            Add Option
          </Button>
        )}
      </div>
    </div>
  );
};

interface PollOptionProps {
  option: any;
  options: any;
  errors: any;
  touched: any;
  handleInput: any;
  handleRemoveClick: any;
  handleEmojiAdd: any;
  isEditing: boolean;
  ind: number;
}

const PollOption = ({
  option,
  options,
  errors,
  touched,
  handleInput,
  handleRemoveClick,
  handleEmojiAdd,
  isEditing,
  ind,
}: PollOptionProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const hasError = errors && typeof errors !== 'string' && touched && errors[ind] && touched[ind];

  return (
    <FormControl fullWidth error={hasError} color={hasError ? 'error' : 'primary'}>
      <div className={styles.OptionField}>
        <TextField
          className={styles.TextField}
          variant="outlined"
          placeholder={`Option ${ind + 1}`}
          value={option?.name}
          onChange={(event) => handleInput(event.target.value, option?.id)}
          disabled={isEditing}
          slotProps={{
            input: {
              endAdornment: !isEditing && (
                <ClickAwayListener onClickAway={() => setShowEmojiPicker(false)}>
                  <div>
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
                    {showEmojiPicker && (
                      <EmojiPicker
                        onEmojiSelect={(emoji: any) => handleEmojiAdd(emoji, option.id)}
                        displayStyle={emojiStyles}
                      />
                    )}
                  </div>
                </ClickAwayListener>
              ),
            },
          }}
        />

        {options.length !== 2 && (
          <CrossIcon
            className={isEditing ? styles.Disabled : styles.RemoveIcon}
            title="Remove"
            data-testid="cross-icon"
            onClick={() => handleRemoveClick(option.id)}
          />
        )}
      </div>
      {hasError ? <FormHelperText>{errors[ind]?.name || ''}</FormHelperText> : null}
    </FormControl>
  );
};
