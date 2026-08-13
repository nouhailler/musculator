export function Pill({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pill"
      style={{
        background: active ? 'var(--color-accent-800)' : 'transparent',
        color: active ? 'var(--color-accent-100)' : 'var(--color-neutral-300)',
        borderColor: active ? 'var(--color-accent)' : 'var(--color-divider)',
      }}
    >
      {label}
    </button>
  );
}

// options: string[]; value: string (single) or string[] (multi)
export function PillGroup({ options, value, onChange, multi = false, style }) {
  return (
    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', ...style }}>
      {options.map((o) => {
        const active = multi ? value.includes(o) : value === o;
        return <Pill key={o} label={o} active={active} onClick={() => onChange(o)} />;
      })}
    </div>
  );
}
