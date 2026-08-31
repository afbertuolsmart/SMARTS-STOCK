import React from 'react';
import { Check } from 'lucide-react';
import { fmtQty } from '@/lib/dashboardData';

export function ColorDetail({
  cor,
  selected,
  onSelectColor
}) {
  const estoqueEmCasa =
    Number(cor.estoque) || 0;

  const comprasBrasil =
    Number(cor.compras) || 0;

  const comprasParaguai =
    Number(cor.comprasParaguai) || 0;

  const aChegar =
    comprasBrasil + comprasParaguai;

  const totalAbastecimento =
    estoqueEmCasa + aChegar;

  const percentualEmCasa =
    totalAbastecimento > 0
      ? (estoqueEmCasa / totalAbastecimento) * 100
      : 0;

  const percentualAReceber =
    totalAbastecimento > 0
      ? (aChegar / totalAbastecimento) * 100
      : 0;

  return (
    <button
      type="button"
      className={`w-full rounded-lg border p-3 text-left transition-all ${
        selected
          ? 'bg-[#F5F1EA] border-[#B8AA96] ring-1 ring-[#B8AA96]/40'
          : 'bg-[#FFFEFC] border-[#E8E1D8] hover:bg-[#FAF7F2] hover:border-[#D8CEC0]'
      }`}
      onClick={() => onSelectColor(cor.cor)}
    >

      <div className="flex items-center justify-between gap-2">

        <div className="flex min-w-0 items-center gap-2">

          <div
            className={`h-4 w-4 shrink-0 rounded border flex items-center justify-center ${
              selected
                ? 'bg-stone-800 border-stone-800'
                : 'bg-white border-stone-300'
            }`}
          >
            {selected && (
              <Check className="h-3 w-3 text-white" />
            )}
          </div>

          <span className="truncate text-sm font-semibold text-stone-800">
            {cor.cor}
          </span>

        </div>

        <span className="shrink-0 text-sm font-bold text-stone-900">
          {fmtQty(totalAbastecimento)}
        </span>

      </div>


      <div className="ml-6 mt-3">

        <div className="mb-1.5 flex items-center justify-between">

          <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">
            Posição de abastecimento
          </span>

        </div>


        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[#ECE7E1]">

          <div
            className="h-full bg-[#3A9B73] transition-all duration-300"
            style={{
              width: `${percentualEmCasa}%`
            }}
          />

          <div
            className="h-full bg-[#D96C5E] transition-all duration-300"
            style={{
              width: `${percentualAReceber}%`
            }}
          />

        </div>


        <div className="mt-2 grid grid-cols-2 gap-2">

          <div>

            <p className="text-[10px] text-stone-500">
              Em casa
            </p>

            <p className="text-xs font-semibold text-[#348C68]">
              {fmtQty(estoqueEmCasa)}
              {' '}
              ({percentualEmCasa.toFixed(1)}%)
            </p>

          </div>


          <div className="text-right">

            <p className="text-[10px] text-stone-500">
              A chegar
            </p>

            <p className="text-xs font-semibold text-[#D96C5E]">
              {fmtQty(aChegar)}
              {' '}
              ({percentualAReceber.toFixed(1)}%)
            </p>

          </div>

        </div>

      </div>

    </button>
  );
}