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
  className?: string;
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
  className,
  testId = 'rangeSlider',
  inputTestId = 'rangeSliderInput',
}: RangeSliderProps) => {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  return (
    <div className={`${styles.Wrap} ${className ?? ''}`}>
      <span className={styles.Bound}>{min}</span>
      <Slider
        className={styles.Slider}
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(_, next) => onChange(clamp(Number(next)))}
        valueLabelDisplay="auto"
        data-testid={testId}
      />
      <span className={styles.Bound}>{max}</span>
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
