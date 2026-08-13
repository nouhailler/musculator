import { useApp } from '../state/store.jsx';
import Icon from './ui/Icon.jsx';

export default function OfflineBanner() {
  const { state } = useApp();
  if (state.online) return null;
  return (
    <div className="offline-banner">
      <Icon name="cloud-slash" size={14} />
      Mode hors-ligne — tes séances restent accessibles
    </div>
  );
}
