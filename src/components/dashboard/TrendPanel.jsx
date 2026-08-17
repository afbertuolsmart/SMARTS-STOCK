import React, { useState } from 'react';
import { buildWindowTrend } from '@/lib/dashboardData';
import { ConsumoVendasChart } from './ConsumoVendasChart';

const WINDOWS = [
  { key: 'consumo_1m', label: 'Último mês' },
  { key: 'consumo_3m', label: 'Últimos 3 meses' },
  { key: 'consumo_6m', label: 'Últimos 6 meses' },
  { key: 'consumo_12m', label: 'Últimos 12 meses' },
];

export function TrendPanel({ consumoByDay, vendasByDay, title = 'Tendência de Consumo e Faturamento' }) {
  const [windowKey, setWindowKey] = useState('consumo_12m');
  const windowLabel = WINDOWS.find(w => w.key === windowKey)?.label || '';
  const trend = buildWindowTrend(consumoByDay, vendasByDay, windowKey);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1">
        <h4 className="text-sm font-semibold">{title} — {windowLabel}</h4>
        <div className="flex flex-wrap rounded-lg border bg-card p-1 gap-1">
          {WINDOWS.map(w => (
            <button
              key={w.key}
              onClick={() => setWindowKey(w.key)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                windowKey === w.key
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>
      <div className="border rounded-lg p-2 bg-white">
        <ConsumoVendasChart data={trend} />
      </div>
    </div>
  );
}