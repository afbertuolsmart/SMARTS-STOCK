import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

import {
  fmtQty,
  buildWindowTrend,
  getWindowValue
} from '@/lib/dashboardData';

import { ConsumoVendasChart } from '@/components/dashboard/ConsumoVendasChart';

const WINDOWS = [
  { key: 'consumo_1m', label: 'Último mês' },
  { key: 'consumo_3m', label: 'Últimos 3 meses' },
  { key: 'consumo_6m', label: 'Últimos 6 meses' },
  { key: 'consumo_12m', label: 'Últimos 12 meses' },
];

function consolidateColors(cores) {

  const result = {
    cor: cores.map(c => c.cor).join(' + '),

    estoque: 0,
  estoqueLocal: 0,
  estoqueParaguai: 0,
  estoqueEadi: 0,
    compras: 0,
    op: 0,
    vendas: 0,
    consumo: 0,
    estoqueGeral: 0,
    comprasParaguai: 0,

    consumo_1m: 0,
    consumo_3m: 0,
    consumo_6m: 0,
    consumo_12m: 0,

    vendas_1m: 0,
    vendas_3m: 0,
    vendas_6m: 0,
    vendas_12m: 0,

    consumoByDay: {},
    vendasByDay: {},

    origem: cores.length === 1
      ? cores[0].origem
      : 'Misto',
  };

  cores.forEach(cor => {

    result.estoque += cor.estoque || 0;
    result.estoqueLocal += cor.estoqueLocal || 0;
    result.estoqueParaguai += cor.estoqueParaguai || 0;
    result.estoqueEadi += cor.estoqueEadi || 0;
    result.compras += cor.compras || 0;
    result.comprasParaguai += cor.comprasParaguai || 0;
    result.op += cor.op || 0;
    result.vendas += cor.vendas || 0;
    result.consumo += cor.consumo || 0;

    result.estoqueGeral += cor.estoqueGeral || 0;

    result.consumo_1m += cor.consumo_1m || 0;
    result.consumo_3m += cor.consumo_3m || 0;
    result.consumo_6m += cor.consumo_6m || 0;
    result.consumo_12m += cor.consumo_12m || 0;

    result.vendas_1m += cor.vendas_1m || 0;
    result.vendas_3m += cor.vendas_3m || 0;
    result.vendas_6m += cor.vendas_6m || 0;
    result.vendas_12m += cor.vendas_12m || 0;

    Object.entries(cor.consumoByDay || {}).forEach(
      ([day, qty]) => {
        result.consumoByDay[day] =
          (result.consumoByDay[day] || 0) + qty;
      }
    );

    Object.entries(cor.vendasByDay || {}).forEach(
      ([day, qty]) => {
        result.vendasByDay[day] =
          (result.vendasByDay[day] || 0) + qty;
      }
    );

  });

  return result;
}

export function ColorAnalysisPanel({
  familia,
  cores,
  origem,
  onBack
}) {

  const [windowKey, setWindowKey] =
    useState('consumo_12m');

  const cor = useMemo(
    () => consolidateColors(cores),
    [cores]
  );

  const windowLabel =
    WINDOWS.find(w => w.key === windowKey)?.label || '';

  const vendasKey =
    windowKey.replace('consumo', 'vendas');

  const consumo =
    getWindowValue(
      cor,
      windowKey,
      'consumo'
    );

  const vendas =
    getWindowValue(
      cor,
      windowKey,
      'vendas'
    );

  const trend = buildWindowTrend(
    cor.consumoByDay,
    cor.vendasByDay,
    windowKey
  );

  const meses =
    windowKey === 'consumo_1m'
      ? 1
      : windowKey === 'consumo_3m'
      ? 3
      : windowKey === 'consumo_6m'
      ? 6
      : 12;

  const demandaMensal =
    (consumo + vendas) / meses;

  const cobertura =
    demandaMensal > 0
      ? cor.estoqueGeral / demandaMensal
      : 999;

  const coberturaDesejada =
    origem === 'Importado'
      ? 4
      : 2;

  const sugestaoCompra = Math.max(
    0,
    demandaMensal * coberturaDesejada -
      cor.estoqueGeral
  );



  return (
    <Card className="p-5 bg-white border-[#D5E0E5] shadow-sm">

      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="mb-2 -ml-2 text-[#667983] hover:text-[#123B4A]"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Voltar para as famílias
      </Button>

      <div className="mb-4">

        <h2 className="text-xl font-bold text-[#123B4A]">
          {familia}
        </h2>

        <p className="text-sm text-[#667983]">
          Cores selecionadas:{' '}
          <span className="font-semibold text-[#18323D]">
            {cores.map(c => c.cor).join(', ')}
          </span>
        </p>

      </div>

      <div className="mb-5">

        <p className="text-xs font-semibold uppercase tracking-wider text-[#667983] mb-2">
          Janela de consumo
        </p>

        <div className="flex flex-wrap rounded-lg border border-[#D5E0E5] bg-[#F5F8F9] p-1 gap-1 w-fit">

          {WINDOWS.map(w => (

            <button
              key={w.key}
              onClick={() =>
                setWindowKey(w.key)
              }
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                windowKey === w.key
                  ? 'bg-[#1F6075] text-white shadow-sm'
                  : 'hover:bg-white text-[#667983]'
              }`}
            >
              {w.label}
            </button>

          ))}

        </div>

      </div>

{/* ========================================================= */}
{/* ESTOQUE */}
{/* ========================================================= */}

<div className="mb-6">

  <div className="rounded-xl border border-[#D5E0E5] bg-[#F8FAFB] p-5">

    <div className="flex items-end justify-between mb-4">

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#667983]">
          Estoque Total
        </p>

        <p className="mt-1 text-3xl font-bold tracking-tight text-[#123B4A]">
          {fmtQty(cor.estoqueGeral)}
        </p>
      </div>

      <div className="text-right">
        <p className="text-xs text-[#667983]">
          Distribuição por local
        </p>

        <p className="text-xs font-medium text-[#18323D]">
          Estoque físico + posições externas
        </p>
      </div>

    </div>


    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

      {/* ESTOQUE LOCAL */}

      <div className="rounded-xl bg-white border border-[#D5E0E5] border-l-4 border-l-[#1F6075] p-4">

        <p className="text-xs font-semibold uppercase tracking-wide text-[#667983]">
          Estoque Local
        </p>

        <p className="mt-2 text-2xl font-bold text-[#1F6075]">
          {fmtQty(cor.estoqueLocal || 0)}
        </p>

        <p className="mt-1 text-xs text-[#667983]">
          Estoque físico
        </p>

      </div>


      {/* ESTOQUE PARAGUAI */}

      <div className="rounded-xl bg-white border border-[#D5E0E5] border-l-4 border-l-[#123B4A] p-4">

        <p className="text-xs font-semibold uppercase tracking-wide text-[#667983]">
          Estoque Paraguai
        </p>

        <p className="mt-2 text-2xl font-bold text-[#123B4A]">
          {fmtQty(cor.estoqueParaguai || 0)}
        </p>

        <p className="mt-1 text-xs text-[#667983]">
          Estoque externo
        </p>

      </div>


      {/* ESTOQUE EADI */}

      <div className="rounded-xl bg-white border border-[#D5E0E5] border-l-4 border-l-[#249A98] p-4">

        <p className="text-xs font-semibold uppercase tracking-wide text-[#667983]">
          Estoque EADI
        </p>

        <p className="mt-2 text-2xl font-bold text-[#249A98]">
          {fmtQty(cor.estoqueEadi || 0)}
        </p>

        <p className="mt-1 text-xs text-[#667983]">
          Estoque em EADI
        </p>

      </div>

    </div>

  </div>

</div>


{/* ========================================================= */}
{/* INDICADORES */}
{/* ========================================================= */}

<div className="mb-6">

  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#667983]">
    Indicadores
  </p>


  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">


    {/* COMPRAS */}

    <div className="rounded-xl border border-[#D5E0E5] bg-white p-4">

      <p className="text-xs font-medium text-[#667983]">
        Compras em Aberto
      </p>

      <p className="mt-2 text-xl font-bold text-[#B45309]">
        {fmtQty(cor.compras)}
      </p>

    </div>

    {/* COMPRAS */}

<div className="rounded-xl border border-[#E2E8F0] bg-white p-4">

  <p className="text-xs font-medium text-[#64748B]">
    Compras em Aberto
  </p>

  <p className="mt-2 text-xl font-bold text-[#B45309]">
    {fmtQty(cor.compras)}
  </p>

</div>


{/* COMPRA PARAGUAI */}

<div className="rounded-xl border border-[#D9E2E8] bg-white p-4">

  <p className="text-xs font-medium text-[#64748B]">
    Compra Paraguai
  </p>

  <p className="mt-2 text-xl font-bold text-[#123B5D]">
    {fmtQty(cor.comprasParaguai || 0)}
  </p>

</div>


    {/* OP */}

    <div className="rounded-xl border border-[#D5E0E5] bg-white p-4">

      <p className="text-xs font-medium text-[#667983]">
        Ordens de Produção
      </p>

      <p className="mt-2 text-xl font-bold text-[#1F6075]">
        {fmtQty(cor.op)}
      </p>

    </div>


    {/* VENDAS */}

    <div className="rounded-xl border border-[#D5E0E5] bg-white p-4">

      <p className="text-xs font-medium text-[#667983]">
        Vendas ({windowLabel})
      </p>

      <p className="mt-2 text-xl font-bold text-[#16856A]">
        {fmtQty(cor[vendasKey] || 0)}
      </p>

    </div>


    {/* CONSUMO */}

    <div className="rounded-xl border border-[#D5E0E5] bg-white p-4">

      <p className="text-xs font-medium text-[#667983]">
        Consumo ({windowLabel})
      </p>

      <p className="mt-2 text-xl font-bold text-[#D97706]">
        {fmtQty(consumo)}
      </p>

    </div>

  </div>

</div>


{/* ========================================================= */}
{/* PLANEJAMENTO */}
{/* ========================================================= */}

<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">


  {/* COBERTURA */}

  <div className="rounded-xl border border-[#D5E0E5] bg-white p-4">

    <p className="text-xs font-semibold uppercase tracking-wider text-[#667983]">
      Cobertura
    </p>

    <div className="flex items-end justify-between">

      <p className="mt-2 text-2xl font-bold text-[#DC2626]">
        {cobertura.toFixed(1)} meses
      </p>

      <span className="text-xs text-[#667983]">
        Estoque / demanda
      </span>

    </div>

  </div>


  {/* SUGESTÃO DE COMPRA */}

  <div className="rounded-xl border border-[#BFE5D5] bg-[#F4FBF8] p-4">

    <p className="text-xs font-semibold uppercase tracking-wider text-[#667983]">
      Sugestão de Compra
    </p>

    <div className="flex items-end justify-between">

      <p className="mt-2 text-2xl font-bold text-[#16856A]">
        {fmtQty(sugestaoCompra)}
      </p>

      <span className="text-xs text-[#667983]">
        Quantidade sugerida
      </span>

    </div>

  </div>

</div>

      <div className="mb-2">

        <h3 className="text-sm font-semibold text-[#18323D]">
          Tendência de Consumo e Vendas — {windowLabel}
        </h3>

      </div>

      <div className="border border-[#D5E0E5] rounded-lg bg-white p-3">

        <ConsumoVendasChart data={trend} />

      </div>

    </Card>
  );
}
