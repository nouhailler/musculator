import Icon from './Icon.jsx';

export function PrimaryButton({ icon, iconWeight = 'fill', children, onClick, disabled, size = 'md', style, type = 'button' }) {
  const big = size === 'lg';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        padding: big ? 16 : 14, fontFamily: 'var(--font-heading)', fontWeight: 600,
        fontSize: big ? 16 : 15, color: 'var(--color-accent-100)', background: 'var(--color-accent-800)',
        border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-lg)',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        boxShadow: disabled ? 'none' : '0 0 24px -4px color-mix(in srgb, var(--color-accent) 55%, transparent)',
        ...style,
      }}
    >
      {icon && <Icon name={icon} weight={iconWeight} size={big ? 22 : 20} />}
      {children}
    </button>
  );
}

export function SecondaryButton({ icon, children, onClick, style, className = '' }) {
  return (
    <button type="button" onClick={onClick} className={`btn btn-secondary ${className}`} style={style}>
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
}

export function GhostButton({ icon, children, onClick, style }) {
  return (
    <button type="button" onClick={onClick} className="btn btn-ghost" style={style}>
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
}

export function IconCircleButton({ icon, iconWeight = 'regular', onClick, title, active, size = 34, style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      style={{
        width: size, height: size, borderRadius: '50%',
        border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-divider)'}`,
        background: 'transparent', color: active ? 'var(--color-accent-200)' : 'var(--color-neutral-200)',
        cursor: 'pointer', display: 'grid', placeItems: 'center', flex: 'none',
        ...style,
      }}
    >
      <Icon name={icon} weight={iconWeight} size={Math.round(size * 0.55)} />
    </button>
  );
}
