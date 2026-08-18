import { Slider } from '@mui/material';
import styles from './RangeSlider.module.css';

export interface RangeSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
  /** fires when the number box is emptied, so a caller can drop the field entirely */
  onClear?: () => void;
  testId?: string;
  inputTestId?: string;
}

/**
 * A slider paired with the number it is setting, so a value can be dragged roughly or typed
 * exactly. Both controls clamp to the range, so a reader correcting a digit is never left
 * holding a number the server would refuse.
 */
export const RangeSlider = ({
  value,
  min,
  max,
  step = 0.01,
  disabled = false,
  onChange,
  onClear,
  testId = 'rangeSlider',
  inputTestId = 'rangeSliderInput',
}: RangeSliderProps) => {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  return (
    <div className={styles.Wrap}>
      <Slider
        className={styles.Slider}
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(_, next) => onChange(clamp(Number(next)))}
        data-testid={testId}
      />
      <input
        type="number"
        className={styles.Value}
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(event) => {
          const next = parseFloat(event.target.value);

          if (Number.isNaN(next)) onClear?.();
          else onChange(clamp(next));
        }}
        data-testid={inputTestId}
      />
    </div>
  );
};
