import React from 'react';
import { Check } from 'lucide-react';
import { fmtQty } from '@/lib/dashboardData';

export function ColorDetail({ cor, selected, onSelectColor }) {
  return (
    <div
      className={`rounded-lg border p-3 cursor-pointer transition-colors ${
        selected
          ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300'
          : 'bg-white hover:bg-slate-50'
      }`}
      onClick={() => onSelectColor(cor.cor)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`h-4 w-4 rounded border flex items-center justify-center ${
              selected
                ? 'bg-blue-600 border-blue-600'
                : 'bg-white border-slate-300'
            }`}
          >
            {selected && (
              <Check className="h-3 w-3 text-white" />
            )}
          </div>

          <span className="font-medium text-sm">
            {cor.cor}
          </span>
        </div>

        <span className="text-sm font-bold text-blue-600">
          {fmtQty(cor.estoqueGeral)}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground ml-6">
        <span>Est: {fmtQty(cor.estoque)}</span>
        <span>Comp: {fmtQty(cor.compras)}</span>
        <span>OP: {fmtQty(cor.op)}</span>
        <span>Vend: {fmtQty(cor.vendas)}</span>
        <span>Cons: {fmtQty(cor.consumo)}</span>
      </div>
    </div>
  );
}