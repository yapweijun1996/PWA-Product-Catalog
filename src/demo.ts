import type { Product } from './types';

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'demo-001', catalogVersionId: 'demo', sku: 'PUMP-100', name: 'Stainless Steel Transfer Pump',
    description: 'Compact transfer pump for light industrial liquid handling.', category: 'Pumps', unit: 'each',
    priceMinor: 12900, currency: 'USD', specifications: { Flow: '80 L/min', Voltage: '220V', Material: '304 stainless steel' },
    sourceRow: 2, importedAt: '', updatedAt: '',
  },
  {
    id: 'demo-002', catalogVersionId: 'demo', sku: 'VALVE-025', name: 'Brass Ball Valve 25mm',
    description: 'Full-port threaded ball valve for general service applications.', category: 'Valves', unit: 'each',
    priceMinor: 1850, currency: 'USD', specifications: { Size: '25mm', Pressure: '16 bar', Connection: 'BSP threaded' },
    sourceRow: 3, importedAt: '', updatedAt: '',
  },
  {
    id: 'demo-003', catalogVersionId: 'demo', sku: 'HOSE-10M', name: 'Reinforced Industrial Hose 10m',
    description: 'Flexible reinforced hose for water and non-corrosive fluids.', category: 'Hoses', unit: 'roll',
    priceMinor: 7450, currency: 'USD', specifications: { Length: '10m', InnerDiameter: '19mm', Temperature: '-20 to 80°C' },
    sourceRow: 4, importedAt: '', updatedAt: '',
  },
  {
    id: 'demo-004', catalogVersionId: 'demo', sku: 'FILTER-050', name: 'Inline Sediment Filter 50 Micron',
    description: 'Replaceable inline filter for pre-treatment systems.', category: 'Filtration', unit: 'each',
    priceMinor: 3290, currency: 'USD', specifications: { Rating: '50 micron', Port: '1 inch', Body: 'Polypropylene' },
    sourceRow: 5, importedAt: '', updatedAt: '',
  },
  {
    id: 'demo-005', catalogVersionId: 'demo', sku: 'MOTOR-075', name: 'Variable Speed Motor 0.75kW',
    description: 'Energy-efficient motor for pump and conveyor assemblies.', category: 'Motors', unit: 'each',
    priceMinor: 28600, currency: 'USD', specifications: { Power: '0.75kW', Speed: '900–2800 rpm', Protection: 'IP55' },
    sourceRow: 6, importedAt: '', updatedAt: '',
  },
  {
    id: 'demo-006', catalogVersionId: 'demo', sku: 'GAUGE-100', name: 'Digital Pressure Gauge',
    description: 'Backlit digital gauge with configurable pressure units.', category: 'Instrumentation', unit: 'each',
    priceMinor: 9100, currency: 'USD', specifications: { Range: '0–10 bar', Display: 'LCD', Accuracy: '±0.5%' },
    sourceRow: 7, importedAt: '', updatedAt: '',
  },
];
