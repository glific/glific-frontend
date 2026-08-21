import { ReactNode } from 'react';
import styles from './SegmentedControl.module.css';

export interface SegmentedControlOption<T extends string = string> {
  value: T;
  label?: ReactNode;
  disabled?: boolean;
  testId?: string;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: ReactNode;
  helperText?: ReactNode;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  testId?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  label,
  helperText,
  disabled = false,
  className,
  labelClassName,
  testId = 'segmentedControl',
}: SegmentedControlProps<T>) {
  return (
    <div className={`${styles.Wrapper} ${className ?? ''}`}>
      {label && (
        <div className={`${styles.Label} ${labelClassName ?? ''}`} data-testid={`${testId}-label`}>
          {label}
        </div>
      )}

      <div className={styles.Track} role="radiogroup" data-testid={testId}>
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <button
              type="button"
              role="radio"
              key={option.value}
              aria-checked={isActive}
              disabled={disabled || option.disabled}
              className={`${styles.Option} ${isActive ? styles.ActiveOption : ''}`}
              onClick={() => onChange(option.value)}
              data-testid={option.testId ?? `${testId}-${option.value}`}
            >
              {option.label ?? option.value}
            </button>
          );
        })}
      </div>

      {helperText && <div className={styles.HelperText}>{helperText}</div>}
    </div>
  );
}

export default SegmentedControl;
