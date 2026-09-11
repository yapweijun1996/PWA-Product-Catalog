import { Icon } from '../../icons';

interface QuantityStepperProps {
  name: string;
  value: number;
  min?: number;
  step?: number;
  isInvalid?: boolean;
  onChange: (value: number) => void;
  ariaLabel?: string;
  decreaseLabel: string;
  increaseLabel: string;
}

export function QuantityStepper({
  name,
  value,
  min = 0.01,
  step = 1,
  isInvalid = false,
  onChange,
  ariaLabel,
  decreaseLabel,
  increaseLabel,
}: QuantityStepperProps) {
  const handleDecrement = () => {
    const next = Math.max(min, Math.round((value - step) * 100) / 100);
    onChange(next);
  };

  const handleIncrement = () => {
    const next = Math.round((value + step) * 100) / 100;
    onChange(next);
  };

  return (
    <div className="stepper-wrapper">
      <button
        type="button"
        className="stepper-btn stepper-minus"
        onClick={handleDecrement}
        disabled={value <= min}
        aria-label={decreaseLabel}
      >
        <Icon name="minus" />
      </button>
      <input
        name={name}
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-invalid={isInvalid}
        aria-label={ariaLabel}
        className="stepper-input"
      />
      <button
        type="button"
        className="stepper-btn stepper-plus"
        onClick={handleIncrement}
        aria-label={increaseLabel}
      >
        <Icon name="plus" />
      </button>
    </div>
  );
}
