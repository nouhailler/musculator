import { useApp } from '../state/store.jsx';
import Icon from './ui/Icon.jsx';

const TABS = [
  { key: 'home', label: 'Accueil', icon: 'house' },
  { key: 'programs', label: 'Programmes', icon: 'list-checks' },
  { key: 'library', label: 'Exos', icon: 'books' },
  { key: 'journal', label: 'Journal', icon: 'notebook' },
  { key: 'progress', label: 'Progrès', icon: 'chart-line-up' },
];

export default function TabBar() {
  const { state, actions } = useApp();
  if (state.view) return null;
  return (
    <nav className="tab-bar">
      {TABS.map((t) => {
        const on = state.tab === t.key;
        return (
          <button key={t.key} type="button" onClick={() => actions.goTab(t.key)}>
            <Icon name={t.icon} weight={on ? 'fill' : 'regular'} size={23} color={on ? 'var(--color-accent)' : 'var(--color-neutral-500)'} />
            <span className="tab-label" style={{ color: on ? 'var(--color-accent)' : 'var(--color-neutral-500)' }}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
