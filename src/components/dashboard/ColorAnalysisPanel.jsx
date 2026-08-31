import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

import {
  fmtQty,
  getWindowValue
} from '@/lib/dashboardData';

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
    <Card className="p-5 bg-white border-[#E6E0D8] shadow-sm">

      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="mb-3 -ml-2 text-[#6F777D] hover:text-[#2F3437]"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Voltar para as famílias
      </Button>

      <div className="mb-4">

        <h2 className="text-[22px] font-semibold tracking-tight text-[#2F3437]">
          {familia}
        </h2>

        <p className="text-[13px] text-[#7A8187]">
          Cores selecionadas:{' '}
          <span className="font-semibold text-[#364047]">
            {cores.map(c => c.cor).join(', ')}
          </span>
        </p>

      </div>

      <div className="mb-7">

        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A8187] mb-2">
          Janela de consumo
        </p>

        <div className="flex flex-wrap rounded-xl border border-[#E6E0D8] bg-[#F8F6F2] p-1 gap-1 w-fit">

          {WINDOWS.map(w => (

            <button
              key={w.key}
              onClick={() =>
                setWindowKey(w.key)
              }
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                windowKey === w.key
                  ? 'bg-[#364047] text-white shadow-sm'
                  : 'hover:bg-[#FFFDFC] text-[#6F777D]'
              }`}
            >
              {w.label}
            </button>

          ))}

        </div>

      </div>

{/* ========================================================= */}
{/* POSIÇÃO DE ABASTECIMENTO */}
{/* ========================================================= */}

<div className="mb-5">

  {(() => {

    // =======================================================
    // CONSUMO MÉDIO MENSAL DOS ÚLTIMOS 3 MESES
    // =======================================================

    const consumoMedio3m =
      (Number(cor.consumo_3m) || 0) / 3;

    // =======================================================
    // ESTOQUE JÁ DISPONÍVEL
    // =======================================================

    const estoqueEmCasa =
      Number(cor.estoqueLocal) || 0;

    // =======================================================
    // COMPRAS A RECEBER
    // =======================================================

    const comprasBrasil =
      Number(cor.compras) || 0;

    const comprasParaguai =
      Number(cor.comprasParaguai) || 0;

    const comprasAReceber =
      comprasBrasil + comprasParaguai;

    // =======================================================
    // TOTAL
    // =======================================================

    const totalAbastecimento =
      estoqueEmCasa + comprasAReceber;

    // =======================================================
    // COBERTURA EM MESES
    // =======================================================

    const mesesEmCasa =
      consumoMedio3m > 0
        ? estoqueEmCasa / consumoMedio3m
        : 0;

    const mesesAReceber =
      consumoMedio3m > 0
        ? comprasAReceber / consumoMedio3m
        : 0;

    // =======================================================
    // PERCENTUAIS PARA A BARRA
    // =======================================================

    const percentualEmCasa =
      totalAbastecimento > 0
        ? (estoqueEmCasa / totalAbastecimento) * 100
        : 0;

    const percentualAReceber =
      totalAbastecimento > 0
        ? (comprasAReceber / totalAbastecimento) * 100
        : 0;

    return (
      <div className="rounded-2xl border border-[#E6E0D8] bg-[#FAF8F4] p-4">

        {/* ================================================= */}
        {/* CABEÇALHO */}
        {/* ================================================= */}

        <div className="flex items-center justify-between mb-3">

          <div>

            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A8187]">
              Posição de abastecimento
            </p>

            <p className="mt-1 text-xs text-[#8A8F93]">
              Baseada no consumo médio dos últimos 3 meses
            </p>

          </div>

          <p className="text-sm font-bold text-[#364047]">
            {fmtQty(totalAbastecimento)}
          </p>

        </div>


        {/* ================================================= */}
        {/* BARRA */}
        {/* ================================================= */}

        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[#ECE7E1]">

          <div
            className="h-full bg-[#5A9276] transition-all duration-300"
            style={{
              width: `${Math.max(
                0,
                Math.min(100, percentualEmCasa)
              )}%`
            }}
          />

          <div
            className="h-full bg-[#D9776A] transition-all duration-300"
            style={{
              width: `${Math.max(
                0,
                Math.min(100, percentualAReceber)
              )}%`
            }}
          />

        </div>


        {/* ================================================= */}
        {/* MESES */}
        {/* ================================================= */}

        <div className="mt-3 grid grid-cols-2 gap-4">

          {/* EM CASA */}

          <div>

            <p className="text-xs text-[#6F777D]">
              Já em casa
            </p>

            <p className="mt-1 text-[19px] font-semibold text-[#5A9276]">
              {mesesEmCasa.toFixed(1)} meses
            </p>

            <p className="text-[11px] text-[#8A8F93]">
              {fmtQty(estoqueEmCasa)}
            </p>

          </div>


          {/* A CHEGAR */}

          <div className="text-right">

            <p className="text-xs text-[#6F777D]">
              A chegar
            </p>

            <p className="mt-1 text-[19px] font-semibold text-[#D9776A]">
              {mesesAReceber.toFixed(1)} meses
            </p>

            <p className="text-[11px] text-[#8A8F93]">
              {fmtQty(comprasAReceber)}
            </p>

          </div>

        </div>


        {/* ================================================= */}
        {/* DETALHE DAS COMPRAS */}
        {/* ================================================= */}

        {comprasAReceber > 0 && (
          <div className="mt-2 flex justify-end gap-3 text-[10px] text-[#8A8F93]">

            <span>
              Brasil: {fmtQty(comprasBrasil)}
            </span>

            <span>
              Paraguai: {fmtQty(comprasParaguai)}
            </span>

          </div>
        )}

      </div>
    );

  })()}

</div>

{/* ========================================================= */}
{/* ESTOQUE */}
{/* ========================================================= */}

<div className="mb-7">

  <div className="rounded-2xl border border-[#E6E0D8] bg-[#FBFAF7] p-5">

    <div className="flex items-end justify-between mb-4">

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A8187]">
          Estoque Total
        </p>

        <p className="mt-1 text-[34px] font-semibold tracking-tight text-[#2F3437]">
          {fmtQty(cor.estoqueGeral)}
        </p>
      </div>

      <div className="text-right">
        <p className="text-xs text-[#6F777D]">
          Distribuição por local
        </p>

        <p className="text-xs font-medium text-[#364047]">
          Estoque físico + posições externas
        </p>
      </div>

    </div>


    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

      {/* ESTOQUE LOCAL */}

      <div className="rounded-xl bg-[#FFFDFC] border border-[#E6E0D8] border-l-[3px] border-l-[#587486] p-3.5">

        <p className="text-xs font-semibold uppercase tracking-wide text-[#6F777D]">
          Estoque Local
        </p>

        <p className="mt-2 text-[25px] font-semibold text-[#587486]">
          {fmtQty(cor.estoqueLocal || 0)}
        </p>

        <p className="mt-1 text-xs text-[#6F777D]">
          Estoque físico
        </p>

      </div>


      {/* ESTOQUE PARAGUAI */}

      <div className="rounded-xl bg-[#FFFDFC] border border-[#E6E0D8] border-l-4 border-l-[#2F3437] p-4">

        <p className="text-xs font-semibold uppercase tracking-wide text-[#6F777D]">
          Estoque Paraguai
        </p>

        <p className="mt-2 text-[25px] font-semibold text-[#4F626C]">
          {fmtQty(cor.estoqueParaguai || 0)}
        </p>

        <p className="mt-1 text-xs text-[#6F777D]">
          Estoque externo
        </p>

      </div>


      {/* ESTOQUE EADI */}

      <div className="rounded-xl bg-[#FFFDFC] border border-[#E6E0D8] border-l-4 border-l-[#7BA39C] p-4">

        <p className="text-xs font-semibold uppercase tracking-wide text-[#6F777D]">
          Estoque EADI
        </p>

        <p className="mt-2 text-[25px] font-semibold text-[#5D8B83]">
          {fmtQty(cor.estoqueEadi || 0)}
        </p>

        <p className="mt-1 text-xs text-[#6F777D]">
          Estoque em EADI
        </p>

      </div>

    </div>

  </div>

</div>


{/* ========================================================= */}
{/* INDICADORES */}
{/* ========================================================= */}

<div className="mb-7">

  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A8187]">
    Indicadores
  </p>


  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">



    {/* COMPRAS */}

<div className="rounded-xl border border-[#E2E8F0] bg-white p-4">

  <p className="text-xs font-medium text-[#64748B]">
    Compras em Aberto
  </p>

  <p className="mt-2 text-xl font-bold text-[#B9824A]">
    {fmtQty(cor.compras)}
  </p>

</div>


{/* COMPRA PARAGUAI */}

<div className="rounded-xl border border-[#D9E2E8] bg-white p-4">

  <p className="text-xs font-medium text-[#64748B]">
    Compra Paraguai
  </p>

  <p className="mt-2 text-xl font-bold text-[#587486]">
    {fmtQty(cor.comprasParaguai || 0)}
  </p>

</div>


    {/* CONSUMO */}

    <div className="rounded-xl border border-[#E6E0D8] bg-white p-4">

      <p className="text-xs font-medium text-[#6F777D]">
        Consumo ({windowLabel})
      </p>

      <p className="mt-2 text-[19px] font-semibold text-[#D9776A]">
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

  <div className="rounded-xl border border-[#E6E0D8] bg-white p-4">

    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A8187]">
      Cobertura
    </p>

    <div className="flex items-end justify-between">

      <p className="mt-2 text-[25px] font-semibold text-[#C65F55]">
        {cobertura.toFixed(1)} meses
      </p>

      <span className="text-xs text-[#6F777D]">
        Estoque / demanda
      </span>

    </div>

  </div>


  {/* SUGESTÃO DE COMPRA */}

  <div className="rounded-xl border border-[#DDE9E0] bg-[#F5F8F5] p-4">

    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A8187]">
      Sugestão de Compra
    </p>

    <div className="flex items-end justify-between">

      <p className="mt-2 text-[25px] font-semibold text-[#4F856A]">
        {fmtQty(sugestaoCompra)}
      </p>

      <span className="text-xs text-[#6F777D]">
        Quantidade sugerida
      </span>

    </div>

  </div>

</div>


    </Card>
  );
}
