export function Field({ label, children, style }) {
  return (
    <div className="field" style={style}>
      {label && <label>{label}</label>}
      {children}
    </div>
  );
}

export function TextInput({ value, onChange, placeholder, type = 'text', style, textAlign }) {
  return (
    <input
      className="input"
      type={type}
      value={value}
      onChange={(e) => onChange(type === 'number' ? Number(e.target.value) || 0 : e.target.value)}
      placeholder={placeholder}
      style={{ ...(textAlign ? { textAlign } : {}), ...style }}
    />
  );
}

export function TextArea({ value, onChange, placeholder, style }) {
  return (
    <textarea
      className="input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={style}
    />
  );
}

export function RangeInput({ value, onChange, min, max, step = 1 }) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      style={{ width: '100%', accentColor: 'var(--color-accent)' }}
    />
  );
}
