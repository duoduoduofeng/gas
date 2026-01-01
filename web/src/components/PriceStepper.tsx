import { useEffect, useMemo, useRef, useState } from "react";
import PriceStepperView from "./PriceStepperView";

type Props = {
  value: number | null;
  min: number;
  max: number;
  step: number;
  decimals: number;
  placeholder: string;
  onChange: (valueOrNull: number | null) => void;
};

function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

export default function PriceStepper(props: Props) {
  const { value, min, max, step, decimals, placeholder, onChange } = props;

  const editingRef = useRef(false);

  const minText = useMemo(() => formatNumber(min, decimals), [min, decimals]);
  const maxText = useMemo(() => formatNumber(max, decimals), [max, decimals]);

  const [text, setText] = useState<string>("");
  const [isMin, setIsMin] = useState(false);
  const [isMax, setIsMax] = useState(false);

  function syncFromProps(v: number | null) {
    if (!isFiniteNumber(v)) {
      setText("");
      setIsMin(false);
      setIsMax(false);
      return;
    }
    setText(formatNumber(v, decimals));
    setIsMin(v <= min);
    setIsMax(v >= max);
  }

  useEffect(() => {
    if (editingRef.current) return;
    syncFromProps(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, min, max, decimals]);

  function clamp(n: number) {
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  function roundToStep(n: number) {
    if (!step || step <= 0) return n;
    const k = Math.round(n / step);
    return k * step;
  }

  function normalizeAndEmit(n: number) {
    const normalized = clamp(roundToStep(n));
    onChange(normalized);
  }

  function onMinus() {
    if (!isFiniteNumber(value)) return;
    if (value <= min) return;
    editingRef.current = false;
    normalizeAndEmit(value - step);
  }

  function onPlus() {
    if (!isFiniteNumber(value)) return;
    if (value >= max) return;
    editingRef.current = false;
    normalizeAndEmit(value + step);
  }

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    editingRef.current = true;

    const nextText = e.target.value;
    setText(nextText);

    if (nextText === "") {
      onChange(null);
      return;
    }

    if (nextText.endsWith(".")) return;

    const n = Number(nextText);
    if (!Number.isFinite(n)) return;

    onChange(clamp(n));
  }

  function onBlur() {
    editingRef.current = false;

    if (text === "") {
      syncFromProps(value);
      return;
    }

    const n = Number(text);
    if (!Number.isFinite(n)) {
      syncFromProps(value);
      return;
    }

    normalizeAndEmit(n);
  }

  return (
    <PriceStepperView
      text={text}
      placeholder={placeholder}
      minText={minText}
      maxText={maxText}
      isMin={isMin}
      isMax={isMax}
      onMinus={onMinus}
      onPlus={onPlus}
      onInput={onInput}
      onBlur={onBlur}
    />
  );
}

function formatNumber(n: number, decimals: number) {
  if (!Number.isFinite(n)) return "";
  return n.toFixed(decimals);
}