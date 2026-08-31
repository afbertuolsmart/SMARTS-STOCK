import React, { useState, useEffect, useMemo } from 'react';
import {
  loadAllData,
  aggregateData,
  getSummary,
  fmtQty
} from '@/lib/dashboardData';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { FamilyCard } from '@/components/dashboard/FamilyCard';
import { ColorAnalysisPanel } from '@/components/dashboard/ColorAnalysisPanel';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColors, setSelectedColors] = useState([]);
  const [showColorAnalysis, setShowColorAnalysis] = useState(false);
  const [focusedFamily, setFocusedFamily] = useState(null);

  useEffect(() => {
    loadAllData()
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { console.error(e); setError(e); setLoading(false); });
  }, []);

  // Auto-refresh when the local sync script regenerates the JSON files.
  useEffect(() => {
    let last = null;
    let active = true;
    const base = import.meta.env.BASE_URL;
    const check = async () => {
      try {
        const res = await fetch(`${base}data/_version.json`, { cache: 'no-store' });
        if (!res.ok) return;
        const v = await res.json();
        if (!active || v.updatedAt === last) return;
        if (last !== null) {
          const d = await loadAllData();
          if (active) setData(d);
        }
        last = v.updatedAt;
      } catch { /* no version file yet */ }
    };
    check();
    const id = setInterval(check, 10000);
    return () => { active = false; clearInterval(id); };
  }, []);

const families = useMemo(() => {
  if (!data) return [];
  return aggregateData(data, '', '');
}, [data]);

const summary = useMemo(() => {
  if (!data) return null;
  return getSummary(data, '', '');
}, [data]);

const filtered = families;

const handleSelectColor = (familia, origem, cor) => {

  setSelectedColors(prev => {

    const mesmaFamilia =
      prev.length === 0 ||
      (
        prev[0].familia === familia &&
        prev[0].origem === origem
      );

    const base = mesmaFamilia ? prev : [];

    const existe = base.some(
      item => item.cor === cor
    );

    if (existe) {
      return base.filter(
        item => item.cor !== cor
      );
    }

    return [
      ...base,
      {
        familia,
        origem,
        cor
      }
    ];
  });

  // Abre a análise automaticamente no primeiro clique
  setShowColorAnalysis(true);
};

const selectedFam =
  selectedColors.length > 0
    ? families.find(
        f =>
          f.familia === selectedColors[0].familia &&
          f.origem === selectedColors[0].origem
      )
    : null;

const selectedCorObjects =
  selectedFam
    ? selectedFam.cores.filter(cor =>
        selectedColors.some(
          selected => selected.cor === cor.cor
        )
      )
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-slate-400" />
          <p className="text-sm text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-destructive">Erro ao carregar dados. Tente novamente.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF2F4] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
{!focusedFamily && !showColorAnalysis && (
  <div className="mb-6">
    <h1 className="text-2xl font-bold text-[#123B4A]">
      Dashboard de Compras, Estoque e Consumo
    </h1>

<p className="text-sm text-[#667983] mt-1">
  Análise consolidada por família e cor de produto
</p>
  </div>
)}

{!focusedFamily && !showColorAnalysis && summary && (
  <div className="mb-7 flex items-center gap-8">

    <div className="flex-1">
      <SummaryCards summary={summary} />
    </div>

    <div className="hidden lg:flex w-[190px] h-[105px] items-center justify-center shrink-0">

      <img
        src="/smart-group-logo.png"
        alt="Smart Group"
        className="w-[170px] h-auto object-contain opacity-80"
      />

    </div>

  </div>
)}

{!showColorAnalysis && (
  <div className="mb-3 flex items-center justify-between">
    <h2 className="text-lg font-semibold text-[#18323D]">
      Famílias de Produtos
    </h2>

    <span className="text-sm text-slate-500">
      {filtered.length} famílias
    </span>
  </div>
)}

{showColorAnalysis && selectedFam ? (
  <div className="grid grid-cols-[280px_minmax(0,1fr)] gap-4 items-start">

    {/* PAINEL DE CORES */}
    <div className="bg-white border border-[#D5E0E5] rounded-xl overflow-hidden sticky top-4 shadow-sm">

      {/* Cabeçalho */}
      <div className="p-4 border-b border-[#D5E0E5]">

        <button
          onClick={() => {
            setShowColorAnalysis(false);
            setSelectedColors([]);
          }}
          className="flex items-center gap-1 text-xs text-[#667983] hover:text-[#123B4A] mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para famílias
        </button>

        <h3 className="font-bold text-[#123B4A] text-sm">
          {selectedFam.familia}
        </h3>

        <p className="text-xs text-slate-500 mt-1">
          {selectedFam.cores.length} cores
        </p>

      </div>

      {/* Lista */}
      <div className="p-3">

        <div className="flex items-center justify-between mb-2">

          <p className="text-xs font-semibold text-slate-600">
            Selecionar cores
          </p>

          {selectedColors.length > 0 && (
            <span className="text-xs font-semibold text-[#123B4A]">
              {selectedColors.length} selecionada
              {selectedColors.length > 1 ? 's' : ''}
            </span>
          )}

        </div>

<div className="max-h-[calc(100vh-190px)] overflow-y-auto space-y-1 pr-1">

  {selectedFam.cores.map(cor => {

    const selected = selectedColors.some(
      item => item.cor === cor.cor
    );

    // =====================================================
    // CORES QUE TERÃO IDENTIDADE VISUAL DE BEGE
    // =====================================================

const corVisual = {
  // BEGE
  'BEGE 626': 'bege',
  'BLUSH': 'bege',
  'CREME': 'bege',
  'MENTA': 'bege',
  'NUDE': 'bege',
  'BEGE': 'bege',
  'OCRE': 'bege',

  // PRETO
  'BORDO': 'preto',
  'CAFE': 'preto',
  'MILITAR': 'preto',
  'BLACK': 'preto',

  // BRANCO
  'BRANCO': 'branco',
  'LAGOA AZUL': 'branco',
  'OFF WHITE 526': 'branco',
  'ROSE': 'branco',
  'OFF WHITE': 'branco',

  // CASTANHO
  'CAMEL 1165': 'castanho',
  'CANELA': 'castanho',
  'CARAMELO': 'castanho',
  'CASTOR': 'castanho',
  'CONHAQUE': 'castanho',
  'MEL': 'castanho',
  'CASTANHO': 'castanho',
};

const coresCards = {
  // BEGE
  bege: {
    bg: 'bg-[#E8D8B8]',
    border: 'border-[#C9B184]',
    text: 'text-[#5F513A]',
    selected: 'bg-[#D8C39A] border-[#8F7445]',
  },

  // PRETO
  preto: {
    bg: 'bg-[#252A2D]',
    border: 'border-[#3F464A]',
    text: 'text-white',
    selected: 'bg-[#111416] border-[#6B7479]',
  },

  // BRANCO
  branco: {
    bg: 'bg-[#F8FAFC]',
    border: 'border-[#CBD5E1]',
    text: 'text-[#475569]',
    selected: 'bg-[#E2E8F0] border-[#64748B]',
  },

  // CASTANHO
  castanho: {
    bg: 'bg-[#8B6B4A]',
    border: 'border-[#6F5136]',
    text: 'text-white',
    selected: 'bg-[#6F5136] border-[#4E3826]',
  },
};

    const tipoCor = corVisual[cor.cor] || null;

    const visual = tipoCor
      ? coresCards[tipoCor]
      : {
          bg: 'bg-white',
          border: 'border-slate-200',
          text: 'text-slate-700',
          selected: 'bg-[#EDF4F8] border-[#123B5D]',
        };

    return (
      <button
        key={cor.cor}
        onClick={() =>
          handleSelectColor(
            selectedFam.familia,
            selectedFam.origem,
            cor.cor
          )
        }
        className={`
          w-full
          flex
          items-center
          justify-between
          gap-2
          rounded-lg
          border
          px-3
          py-2
          text-left
          transition-all

          ${
            selected
              ? `${visual.selected} ring-1 ring-[#123B5D]/30`
              : `${visual.bg} ${visual.border} hover:brightness-95`
          }
        `}
      >

        <div className="flex items-center gap-2 min-w-0">

          {/* CHECKBOX */}

          <div
            className={`
              h-4
              w-4
              rounded
              border
              flex
              items-center
              justify-center
              shrink-0

              ${
                selected
                  ? 'bg-[#123B5D] border-[#123B5D]'
                  : visual.border
              }
            `}
          >

            {selected && (
              <span className="text-white text-[10px] font-bold">
                ✓
              </span>
            )}

          </div>

          {/* NOME DA COR */}

          <span
            className={`
              text-xs
              font-medium
              truncate
              ${visual.text}
            `}
          >
            {cor.cor}
          </span>

        </div>

{/* ESTOQUE + COMPRA PARAGUAI */}

<div className="flex flex-col items-end shrink-0">

  <span
    className={`
      text-xs
      font-semibold
      ${selected ? visual.text : 'text-slate-500'}
    `}
  >
    Est: {fmtQty(cor.estoque || 0)}
  </span>

  <span
    className={`
      text-[10px]
      font-medium
      ${selected ? visual.text : 'text-slate-400'}
    `}
  >
    PY: {fmtQty(cor.comprasParaguai || 0)}
  </span>

</div>

      </button>
    );
  })}

</div>

      </div>

    </div>

    {/* PAINEL DE ANÁLISE */}
    <div className="min-w-0">

      {selectedCorObjects.length > 0 ? (
        <ColorAnalysisPanel
          familia={selectedFam.familia}
          cores={selectedCorObjects}
          origem={selectedFam.origem}
          onBack={() => {
            setShowColorAnalysis(false);
            setSelectedColors([]);
          }}
        />
      ) : (
        <div className="min-h-[500px] bg-white border border-slate-200 rounded-xl flex items-center justify-center">

          <div className="text-center">

            <p className="text-lg font-semibold text-[#123B4A]">
              Selecione uma ou mais cores
            </p>

            <p className="text-sm text-[#667983] mt-1">
              Escolha as cores no painel ao lado para iniciar a análise.
            </p>

          </div>

        </div>
      )}

    </div>

  </div>
) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
{filtered
  .filter(fam => !focusedFamily || focusedFamily === `${fam.familia}-${fam.origem}`)
  .map(fam => (
<FamilyCard
  key={`${fam.familia}-${fam.origem}`}
  family={fam}
  onSelectColor={handleSelectColor}
  selectedCorNames={
    selectedColors
      .filter(
        c =>
          c.familia === fam.familia &&
          c.origem === fam.origem
      )
      .map(c => c.cor)
  }
  onAnalyzeSelected={() => {
    setShowColorAnalysis(true);
  }}
  forceExpanded={
    focusedFamily === `${fam.familia}-${fam.origem}`
  }
  onFocus={() =>
    setFocusedFamily(prev =>
      prev === `${fam.familia}-${fam.origem}`
        ? null
        : `${fam.familia}-${fam.origem}`
    )
  }
/>
))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Nenhuma família encontrada com os filtros selecionados.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
