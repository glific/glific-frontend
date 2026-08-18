import { Slider } from '@mui/material';
import styles from './RangeSlider.module.css';

export interface RangeSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
  onClear?: () => void;
  testId?: string;
  inputTestId?: string;
}

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
