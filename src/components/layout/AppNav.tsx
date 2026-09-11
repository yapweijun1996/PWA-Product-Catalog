import { Icon } from '../../icons';
import type { Labels } from '../../i18n/translations';

export type Screen = 'catalog' | 'quotes' | 'settings';

interface AppNavProps {
  screen: Screen;
  labels: Labels;
  quoteLinesCount?: number;
  onNavigate: (next: Screen) => void;
  className?: string;
}

export function AppNav({ screen, labels, quoteLinesCount, onNavigate, className }: AppNavProps) {
  const screens: Screen[] = ['catalog', 'quotes', 'settings'];

  return (
    <nav
      className={className ? `main-nav ${className}` : 'main-nav'}
      aria-label={labels.primaryNavigation}
    >
      {screens.map((item) => (
        <button
          key={item}
          className={screen === item ? 'nav-item is-active' : 'nav-item'}
          onClick={() => onNavigate(item)}
        >
          <Icon name={item === 'catalog' ? 'catalog' : item === 'quotes' ? 'quote' : 'settings'} />
          <span className="nav-label">{labels[item]}</span>
          {item === 'quotes' && Boolean(quoteLinesCount) && (
            <b className="nav-count">{quoteLinesCount}</b>
          )}
        </button>
      ))}
    </nav>
  );
}
