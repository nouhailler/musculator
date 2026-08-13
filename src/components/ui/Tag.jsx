import Icon from './Icon.jsx';

const VARIANT_CLASS = { accent: 'tag tag-accent', neutral: 'tag tag-neutral', outline: 'tag tag-outline' };

export default function Tag({ variant = 'neutral', icon, children }) {
  return (
    <span className={VARIANT_CLASS[variant] || VARIANT_CLASS.neutral}>
      {icon && <Icon name={icon} size={12} style={{ marginRight: 4 }} />}
      {children}
    </span>
  );
}
