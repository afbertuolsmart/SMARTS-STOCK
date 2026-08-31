import React from 'react';

import { Card } from '@/components/ui/card';

import { fmtQty, fmtMoney } from '@/lib/dashboardData';

import {
  Package,
  ShoppingCart,
  Factory,
  Boxes,
  TrendingUp,
  Activity
} from 'lucide-react';

export function SummaryCards({ summary }) {

  const cards = [

    {
      label: 'Estoque Geral',
      value: summary.estoqueGeral,
      icon: Boxes,
      color: 'text-[#2F3437]',
      bg: 'bg-[#F2F0EC]',
      accent: 'border-l-[#587486]',
      sub: 'Estoque + Compras + OP'
    },

    {
      label: 'Estoque Físico',
      value: summary.estoque,
      icon: Package,
      color: 'text-[#587486]',
      bg: 'bg-[#EEF3F5]',
      accent: 'border-l-[#587486]',
      sub: fmtMoney(summary.valorEstoque)
    },

    {
      label: 'Compras em Aberto',
      value: summary.compras,
      icon: ShoppingCart,
      color: 'text-[#B9824A]',
      bg: 'bg-[#F7F1E9]',
      accent: 'border-l-[#B9824A]',
      sub: 'Qtd. aberto'
    },

    {
      label: 'Consumo (12 meses)',
      value: summary.consumo,
      icon: Activity,
      color: 'text-[#D9776A]',
      bg: 'bg-[#F8EEEB]',
      accent: 'border-l-[#D9776A]',
      sub: 'Qtd. movimentada'
    }

  ];

  return (

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

      {cards.map(c => (

        <Card
          key={c.label}
          className={`
            relative
            overflow-hidden
            rounded-xl
            border border-[#E6E0D8]
            border-l-[3px]
            ${c.accent}
            bg-[#FFFDFC]
            px-3.5
            py-3
            shadow-[0_2px_10px_rgba(45,42,38,0.035)]
            transition-all
            duration-150
            hover:-translate-y-[1px]
            hover:shadow-[0_6px_18px_rgba(45,42,38,0.06)]
          `}
        >

          {/* CABEÇALHO */}

          <div className="flex items-center gap-2">

            <div
              className={`
                inline-flex
                items-center
                justify-center
                h-7
                w-7
                rounded-lg
                ${c.bg}
              `}
            >
              <c.icon
                className={`
                  h-3.5
                  w-3.5
                  ${c.color}
                `}
              />
            </div>

            <p className="min-w-0 truncate text-[10px] font-medium text-[#6F777D]">
              {c.label}
            </p>

          </div>


          {/* VALOR */}

          <p className="mt-2 text-[20px] font-semibold leading-none tracking-[-0.03em] text-[#2F3437]">
            {fmtQty(c.value)}
          </p>


          {/* SUBTÍTULO */}

          <p className="mt-1 text-[9px] font-medium text-[#8A8F93] truncate">
            {c.sub}
          </p>

        </Card>

      ))}

    </div>

  );
}