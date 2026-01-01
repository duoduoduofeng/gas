import "./price-stepper.css";

type Props = {
  text: string;
  placeholder: string;
  minText: string;
  maxText: string;
  isMin: boolean;
  isMax: boolean;

  onMinus: () => void;
  onPlus: () => void;
  onInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
};

export default function PriceStepperView(props: Props) {
  const { text, placeholder, minText, maxText, isMin, isMax, onMinus, onPlus, onInput, onBlur } = props;

  return (
    <div className="ps-wrap">
      <button
        type="button"
        className={`ps-btn ${isMin ? "disabled" : ""}`}
        onClick={onMinus}
        disabled={isMin}
      >
        <div className="ps-sign">−</div>
        <div className="ps-limit">{minText}</div>
      </button>

      <input
        className="ps-input"
        inputMode="decimal"
        value={text}
        placeholder={placeholder}
        onChange={onInput}
        onBlur={onBlur}
      />

      <button
        type="button"
        className={`ps-btn ${isMax ? "disabled" : ""}`}
        onClick={onPlus}
        disabled={isMax}
      >
        <div className="ps-sign">+</div>
        <div className="ps-limit">{maxText}</div>
      </button>
    </div>
  );
}