import React, { useState } from 'react';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import {
  ChevronDown,
  ChevronRight
} from 'lucide-react';

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

  const [expanded, setExpanded] =
    useState(false);

  const isExpanded =
    forceExpanded || expanded;


  /* =========================================================
     ORIGEM
     ========================================================= */

  const origemColor =
    family.origem === 'Importado'
      ? {
          bg: 'bg-[#F8ECE9]',
          text: 'text-[#C35F52]',
          border: 'border-[#E9D0CA]'
        }
      : family.origem === 'Misto'
      ? {
          bg: 'bg-[#F8F2E8]',
          text: 'text-[#A27642]',
          border: 'border-[#E8DAC2]'
        }
      : {
          bg: 'bg-[#EDF3F5]',
          text: 'text-[#4F7180]',
          border: 'border-[#D6E3E8]'
        };


  /* =========================================================
     EXPANSÃO
     ========================================================= */

  const handleHeaderClick = () => {

    if (onFocus) {
      onFocus();
    } else {
      setExpanded(!expanded);
    }

  };


  return (

    <Card
      className="
        group
        overflow-hidden
        rounded-[18px]
        border
        border-[#DDD6CC]
        bg-[#FFFDFC]
        shadow-[0_5px_20px_rgba(49,45,40,0.055)]
        transition-all
        duration-200
        hover:-translate-y-[2px]
        hover:shadow-[0_12px_30px_rgba(49,45,40,0.08)]
      "
    >

      {/* =====================================================
          CABEÇALHO
          ===================================================== */}

      <div
        className={`
          p-4
          transition-colors
          ${
            forceExpanded
              ? ''
              : 'cursor-pointer hover:bg-[#FAF8F5]'
          }
        `}
        onClick={handleHeaderClick}
      >

        <div className="flex items-start justify-between gap-3 mb-4">

          <div className="flex items-center gap-2 min-w-0">

            <div
              className="
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-[#F3F0EB]
                text-[#66727A]
                transition-colors
                group-hover:bg-[#ECE7E0]
              "
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>

            <div className="min-w-0">

              <h3
                className="
                  truncate
                  text-[15px]
                  font-semibold
                  tracking-[-0.02em]
                  text-[#273238]
                "
              >
                {family.familia}
              </h3>

              <p
                className="
                  mt-0.5
                  text-[10px]
                  font-medium
                  text-[#90979C]
                "
              >
                {family.cores.length} cores
              </p>

            </div>

          </div>


          <Badge
            variant="outline"
            className={`
              shrink-0
              rounded-full
              border
              px-2.5
              py-1
              text-[10px]
              font-semibold
              ${origemColor.bg}
              ${origemColor.text}
              ${origemColor.border}
            `}
          >
            {family.origem}
          </Badge>

        </div>


        {/* ===================================================
            ESTOQUE GERAL
            =================================================== */}

        <div
          className="
            relative
            overflow-hidden
            rounded-[15px]
            border
            border-[#DDD6CC]
            bg-[#F5F2ED]
            px-4
            py-3.5
            mb-3
          "
        >

          {/* pequeno detalhe visual */}

          <div
            className="
              absolute
              left-0
              top-0
              bottom-0
              w-1
              bg-[#587486]
            "
          />

          <div className="flex items-end justify-between gap-4">

            <div>

              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-[#6E787F]
                "
              >
                Estoque Geral
              </p>

              <p
                className="
                  mt-1.5
                  text-[26px]
                  font-semibold
                  leading-none
                  tracking-[-0.045em]
                  text-[#355D6D]
                "
              >
                {fmtQty(family.estoqueGeral)}
              </p>

            </div>

            <div className="text-right">

              <p className="text-[9px] font-medium text-[#969C9F]">
                Estoque + compras + OP
              </p>

            </div>

          </div>


          {/* =================================================
              DETALHES
              ================================================= */}

          <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3">

            <div>

              <span className="text-[10px] text-[#7B858B]">
                Estoque
              </span>

              <p className="mt-0.5 text-[14px] font-semibold text-[#496F80]">
                {fmtQty(family.estoque)}
              </p>

            </div>


            <div>

              <span className="text-[10px] text-[#7B858B]">
                Compras
              </span>

              <p className="mt-0.5 text-[14px] font-semibold text-[#A76D31]">
                {fmtQty(family.compras)}
              </p>

            </div>


            <div>

              <span className="text-[10px] text-[#7B858B]">
                Compra Paraguai
              </span>

              <p className="mt-0.5 text-[14px] font-semibold text-[#597786]">
                {fmtQty(family.comprasParaguai || 0)}
              </p>

            </div>


            <div>

              <span className="text-[10px] text-[#7B858B]">
                OP
              </span>

              <p className="mt-0.5 text-[14px] font-semibold text-[#636F76]">
                {fmtQty(family.op)}
              </p>

            </div>

          </div>

        </div>


        {/* =====================================================
            VENDAS + CONSUMO
            ===================================================== */}
{/* CONSUMO */}

<div
  className="
    mt-3
    rounded-[13px]
    border
    border-[#EED9D3]
    bg-[#F9ECE9]
    px-3.5
    py-3
  "
>

  <div className="flex items-center justify-between">

    <div>

      <p
        className="
          text-[10px]
          font-medium
          text-[#836F6A]
        "
      >
        Consumo (12m)
      </p>

      <p
        className="
          mt-1.5
          text-[16px]
          font-semibold
          tracking-[-0.015em]
          text-[#C7675C]
        "
      >
        {fmtQty(family.consumo)}
      </p>

    </div>

    <div
      className="
        flex
        h-7
        w-7
        items-center
        justify-center
        rounded-lg
        bg-[#F3DED9]
      "
    >

      <span
        className="
          h-2
          w-2
          rounded-full
          bg-[#C7675C]
        "
      />

    </div>

  </div>

</div>


        {/* =====================================================
            EMPRESAS
            ===================================================== */}

        {(family.estoqueRS > 0 ||
          family.estoqueSC > 0) && (

          <div
            className="
              mt-3
              flex
              items-center
              gap-4
              border-t
              border-[#EEE9E2]
              pt-2.5
              text-[10px]
              text-[#80898E]
            "
          >

            <span>
              RS (SMT):
              <strong className="ml-1 font-semibold text-[#56636A]">
                {fmtQty(family.estoqueRS)}
              </strong>
            </span>

            <span>
              SC (SM3):
              <strong className="ml-1 font-semibold text-[#56636A]">
                {fmtQty(family.estoqueSC)}
              </strong>
            </span>

          </div>

        )}

      </div>


      {/* =====================================================
          EXPANDIDO
          ===================================================== */}

      {isExpanded && (

        <div
          className="
            border-t
            border-[#E7E0D7]
            bg-[#FAF8F5]
            p-3.5
            space-y-3
          "
        >

          <TrendPanel
            consumoByDay={family.consumoByDay}
            vendasByDay={family.vendasByDay}
          />


          <div className="flex items-center justify-between px-1">

            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.10em]
                text-[#747F85]
              "
            >
              Selecione uma ou mais cores para analisar
            </p>

            {selectedCorNames.length > 0 && (

              <span
                className="
                  rounded-full
                  bg-[#EDF3F5]
                  px-2
                  py-1
                  text-[9px]
                  font-semibold
                  text-[#4F7180]
                "
              >
                {selectedCorNames.length} selecionada
                {selectedCorNames.length > 1 ? 's' : ''}
              </span>

            )}

          </div>


          <div
            className="
              max-h-[320px]
              overflow-y-auto
              pr-1
              space-y-2
            "
          >

            {family.cores.map(cor => (

              <ColorDetail
                key={cor.cor}
                cor={cor}
                selected={
                  selectedCorNames.includes(cor.cor)
                }
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