Component({
  properties: {
    value: { type: Number, value: 0 },
    min: { type: Number, value: 0 },
    max: { type: Number, value: 999999 },
    step: { type: Number, value: 0.01 },
    decimals: { type: Number, value: 2 },
    placeholder: { type: String, value: 'e.g. 1.52' }
  },

  data: {
    text: '',
    isMin: false,
    isMax: false,
    minText: '',
    maxText: ''
  },

  lifetimes: {
    attached() {
      this._editing = false;
      this.syncFromProps(this.properties.value);
    }
  },

  observers: {
    value(v) {
      // Critical: do not override user input while editing
      if (this._editing) return;
      this.syncFromProps(v);
    },
    min() {
      if (this._editing) return;
      this.syncFromProps(this.properties.value);
    },
    max() {
      if (this._editing) return;
      this.syncFromProps(this.properties.value);
    },
    decimals() {
      if (this._editing) return;
      this.syncFromProps(this.properties.value);
    }
  },

  methods: {
    format(n) {
      const { decimals } = this.properties;
      if (!Number.isFinite(n)) return '';
      return n.toFixed(decimals);
    },

    clamp(n) {
      const { min, max } = this.properties;
      if (n < min) return min;
      if (n > max) return max;
      return n;
    },

    roundToStep(n) {
      const { step } = this.properties;
      if (!step || step <= 0) return n;
      const k = Math.round(n / step);
      return k * step;
    },

    // Sync UI from props (only when NOT editing)
    syncFromProps(v) {
      const { min, max } = this.properties;

      const minText = this.format(min);
      const maxText = this.format(max);

      if (!Number.isFinite(v)) {
        this.setData({
          text: '',
          isMin: false,
          isMax: false,
          minText,
          maxText
        });
        return;
      }

      this.setData({
        text: this.format(v),
        isMin: v <= min,
        isMax: v >= max,
        minText,
        maxText
      });
    },

    emitChange(valueOrNull) {
      this.triggerEvent('change', { value: valueOrNull });
    },

    normalizeAndEmit(n) {
      const normalized = this.clamp(this.roundToStep(n));
      this.emitChange(normalized);
    },

    onMinus() {
      const { value, step, min } = this.properties;
      if (!Number.isFinite(value)) return;
      if (value <= min) return;

      // Not editing; button action is immediate + normalized
      this._editing = false;
      this.normalizeAndEmit(value - step);
    },

    onPlus() {
      const { value, step, max } = this.properties;
      if (!Number.isFinite(value)) return;
      if (value >= max) return;

      this._editing = false;
      this.normalizeAndEmit(value + step);
    },

    onInput(e) {
      // User is editing; keep raw text and DO NOT normalize
      this._editing = true;

      const text = e.detail.value;
      this.setData({ text });

      // Allow empty input (user wants to fully delete)
      if (text === '') {
        // Emit null so parent can reflect "no value" state
        this.emitChange(null);
        return;
      }

      // Allow intermediate state like "1."
      if (text.endsWith('.')) return;

      const n = Number(text);
      if (!Number.isFinite(n)) return;

      // During typing: clamp only, no rounding, no formatting
      this.emitChange(this.clamp(n));
    },

    onBlur() {
      // Finish editing; now we normalize
      this._editing = false;

      const text = this.data.text;

      if (text === '') {
        // Keep empty; parent already has null
        this.syncFromProps(this.properties.value);
        // If parent kept null, syncFromProps will show empty next time value updates.
        return;
      }

      const n = Number(text);
      if (!Number.isFinite(n)) {
        // Revert to last prop value
        this.syncFromProps(this.properties.value);
        return;
      }

      // Normalize on blur (round to step + clamp), then parent updates value,
      // and observer will sync formatted text.
      this.normalizeAndEmit(n);
    }
  }
});