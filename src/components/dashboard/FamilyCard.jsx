import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { fmtQty } from '@/lib/dashboardData';
import { ColorDetail } from './ColorDetail';
import { TrendPanel } from './TrendPanel';

export function FamilyCard({
  family,
  onSelectColor,
  forceExpanded,
  selectedCorNames = [],
  onAnalyzeSelected,
  onFocus
}) {
  const [expanded, setExpanded] = useState(false);

  const isExpanded = forceExpanded || expanded;

  const origemColor =
    family.origem === 'Importado'
      ? 'bg-red-100 text-red-700 border-red-200'
      : family.origem === 'Misto'
      ? 'bg-amber-100 text-amber-700 border-amber-200'
      : 'bg-blue-100 text-blue-700 border-blue-200';

  const handleHeaderClick = () => {
    if (onFocus) {
      onFocus();
    } else {
      setExpanded(!expanded);
    }
  };

  return (
    <Card className="overflow-hidden">

      {/* CABEÇALHO DA FAMÍLIA */}
      <div
        className={`p-4 transition-colors ${
          forceExpanded ? '' : 'cursor-pointer hover:bg-slate-50'
        }`}
        onClick={handleHeaderClick}
      >
        <div className="flex items-start justify-between mb-3">

          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}

            <h3 className="font-semibold text-base">
              {family.familia}
            </h3>

            <span className="text-xs text-muted-foreground">
              ({family.cores.length} cores)
            </span>
          </div>

          <Badge
            variant="outline"
            className={origemColor}
          >
            {family.origem}
          </Badge>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700">
              Estoque Geral
            </span>

            <span className="text-xl font-bold text-blue-700">
              {fmtQty(family.estoqueGeral)}
            </span>
          </div>

<div className="grid grid-cols-2 gap-2 mt-2">

  <div>
    <span className="text-xs text-slate-500">
      Estoque
    </span>
    <p className="font-semibold text-slate-700">
      {fmtQty(family.estoque)}
    </p>
  </div>

  <div>
    <span className="text-xs text-slate-500">
      Compras
    </span>
    <p className="font-semibold text-slate-700">
      {fmtQty(family.compras)}
    </p>
  </div>

  <div>
    <span className="text-xs text-slate-500">
      Compra Paraguai
    </span>
    <p className="font-semibold text-[#123B5D]">
      {fmtQty(family.comprasParaguai)}
    </p>
  </div>

  <div>
    <span className="text-xs text-slate-500">
      OP
    </span>
    <p className="font-semibold text-slate-700">
      {fmtQty(family.op)}
    </p>
  </div>

</div>
        </div>

        <div className="grid grid-cols-2 gap-2">

          <div className="bg-green-50 rounded-lg p-2">
            <p className="text-xs text-green-600">
              Vendas (12m)
            </p>

            <p className="font-semibold text-green-700">
              {fmtQty(family.vendas)}
            </p>
          </div>

          <div className="bg-orange-50 rounded-lg p-2">
            <p className="text-xs text-orange-600">
              Consumo (12m)
            </p>

            <p className="font-semibold text-orange-700">
              {fmtQty(family.consumo)}
            </p>
          </div>

        </div>

        {(family.estoqueRS > 0 || family.estoqueSC > 0) && (
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">

            <span>
              RS (SMT):
              <strong> {fmtQty(family.estoqueRS)}</strong>
            </span>

            <span>
              SC (SM3):
              <strong> {fmtQty(family.estoqueSC)}</strong>
            </span>

          </div>
        )}
      </div>

      {/* CONTEÚDO EXPANDIDO */}
      {isExpanded && (
        <div className="border-t bg-slate-50/50 p-3 space-y-3">

          <TrendPanel
            consumoByDay={family.consumoByDay}
            vendasByDay={family.vendasByDay}
          />

          <div className="flex items-center justify-between px-1">

            <p className="text-xs font-medium text-muted-foreground">
              Selecione uma ou mais cores para analisar
            </p>

            {selectedCorNames.length > 0 && (
              <span className="text-xs font-semibold text-blue-600">
                {selectedCorNames.length} selecionada
                {selectedCorNames.length > 1 ? 's' : ''}
              </span>
            )}

          </div>

          <div className="max-h-[320px] overflow-y-auto pr-1 space-y-2">

            {family.cores.map(cor => (

<ColorDetail
  key={cor.cor}
  cor={cor}
  selected={selectedCorNames.includes(cor.cor)}
  onSelectColor={(corName) => {
    onSelectColor(
      family.familia,
      family.origem,
      corName
    );
  }}
/>

            ))}

          </div>

      



        </div>
      )}

    </Card>
  );
}