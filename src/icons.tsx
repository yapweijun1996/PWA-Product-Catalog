import type { SVGProps } from 'react';

export type IconName =
  | 'catalog'
  | 'quote'
  | 'settings'
  | 'search'
  | 'add'
  | 'close'
  | 'minus'
  | 'plus'
  | 'arrowRight'
  | 'check'
  | 'trash';

const paths: Record<IconName, string> = {
  catalog: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  quote: 'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5',
  settings: 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm0-5v2m0 13v2m9-8h-2m-14 0H3m15.36-6.36-1.41 1.41M7.05 16.95l-1.41 1.41m0-12.72 1.41 1.41m9.9 9.9 1.41 1.41',
  search: 'm20 20-4.5-4.5m2-5.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z',
  add: 'M12 5v14M5 12h14',
  close: 'm6 6 12 12M18 6 6 18',
  minus: 'M5 12h14',
  plus: 'M12 5v14M5 12h14',
  arrowRight: 'M5 12h14M12 5l7 7-7 7',
  check: 'M20 6 9 17l-5-5',
  trash: 'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
};

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
