/* global process */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const DATASETS = [
  'estoque',
  'compras',
  'consumo',
  'vendas',
  'ordens',

  'COMPRABASES',
  'COMPRAPARAGUAI',
  'CONSUMOBASES',
  'ESTOQUEBASESLOCAL',
  'ESTOQUEEADI',
  'ESTOQUEPARAGUAI',
];

const EXTS = ['.xlsx', '.xls', '.xlsm', '.csv'];

const NUMERIC_FIELDS = new Set([
  'produto',
  'subgrupo',
  'grupo',
  'qtd_fisica',
  'qtd_aberto',
  'qtde',
  'vlr_un',
  'vlr_tot_est',
  'nro_op',
  'qtd_produzir',
  'num_oc',
  'forn',
  'cod_prod',
  'orig_movto',
  'qtd_movimentada',
  'pedido',
  'cfop',
  'cliente',
  'qtd_faturada',
  'qtd_item',
  'nota',
  'vlr_liq_item',
  'representante',
  'vlr_comissao_rep',
  'quantidade',
  'qtd',
  'estoque',
  'compras',
  'consumo',
  'valor',
]);

const FIELD_MAP = {
  'Produto': 'produto',
  'Desc.completa': 'desc_completa',
  'Qtd.física': 'qtd_fisica',
  'Qtd.fÃsica': 'qtd_fisica',
  'Vlr.tot.est': 'vlr_tot_est',
  'Grupo': 'grupo',
  'Subgrupo': 'subgrupo',
  'Sig.emp': 'sig_emp',
  'Coleção': 'colecao',
  'ColeÃ§Ã£o': 'colecao',
  'Qtd.aberto': 'qtd_aberto',
  'Qtd.movimentada': 'qtd_movimentada',
  'Qtd.faturada': 'qtd_faturada',
  'Qtd.produzir': 'qtd_produzir',
  'Dt.movto': 'dt_movto',
  'Dt.faturam': 'dt_faturam',
  'Cod.prod': 'cod_prod',
};

const pad2 = (n) => String(n).padStart(2, '0');

const dateStr = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

function normalizeValue(field, value) {
  if (value == null || value === '') {
    return null;
  }

  if (value instanceof Date) {
    return dateStr(value);
  }

  if (NUMERIC_FIELDS.has(field)) {
    const n = Number(value);

    return Number.isFinite(n) ? n : 0;
  }

  return String(value).trim();
}

function convertFile(file) {
  const workbook = XLSX.readFile(file, {
    cellDates: true,
  });

  if (!workbook.SheetNames.length) {
    throw new Error('Nenhuma planilha encontrada.');
  }

  const sheetName = workbook.SheetNames[0];

  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(sheet, {
    raw: true,
    defval: null,
  });

  return rows.map((row) => {
    const obj = {};

    for (const [key, value] of Object.entries(row)) {
      const original = String(key).trim();

      const normalizedKey =
        FIELD_MAP[original] ||
        original.toLowerCase();

      obj[normalizedKey] = normalizeValue(
        normalizedKey,
        value
      );
    }

    return obj;
  });
}

const args = process.argv.slice(2);

const once = args.includes('--once');

const folderArg = args.find(
  (arg) => !arg.startsWith('--')
);

const folder = path.resolve(
  folderArg ||
    process.env.DATA_FOLDER ||
    'data-source'
);

const outDir = path.resolve('public/data');

fs.mkdirSync(outDir, {
  recursive: true,
});

if (!fs.existsSync(folder)) {
  fs.mkdirSync(folder, {
    recursive: true,
  });

  console.log(`Pasta criada: ${folder}`);
}

function findDatasetFile(dataset) {
  const target = dataset.toLowerCase();

  const files = fs.readdirSync(folder);

  for (const file of files) {
    const extension = path
      .extname(file)
      .toLowerCase();

    if (!EXTS.includes(extension)) {
      continue;
    }

    const basename = path
      .basename(file, path.extname(file))
      .toLowerCase();

    if (basename === target) {
      return file;
    }
  }

  return null;
}

export function convertAll() {
  console.log('');
  console.log('==========================================');
  console.log('        SMART STOCK - SYNC FOLDER');
  console.log('==========================================');
  console.log(`Origem : ${folder}`);
  console.log(`Destino: ${outDir}`);
  console.log('');

  const counts = {};

  for (const dataset of DATASETS) {
    const filename = findDatasetFile(dataset);

    if (!filename) {
      console.log(
        `- ${dataset}: arquivo não encontrado`
      );

      continue;
    }

    try {
      const source = path.join(
        folder,
        filename
      );

      const rows = convertFile(source);

      const output = path.join(
        outDir,
        `${dataset}.json`
      );

      fs.writeFileSync(
        output,
        JSON.stringify(rows),
        'utf8'
      );

      counts[dataset] = rows.length;

      console.log(
        `✓ ${dataset}: ${rows.length} registros <- ${filename}`
      );

    } catch (error) {
      console.error(
        `✗ ${dataset}: ${error.message}`
      );
    }
  }

  const version = {
    updatedAt: new Date().toISOString(),
    counts,
  };

  fs.writeFileSync(
    path.join(outDir, '_version.json'),
    JSON.stringify(version, null, 2),
    'utf8'
  );

  console.log('');
  console.log('==========================================');
  console.log('          SINCRONIZAÇÃO CONCLUÍDA');
  console.log('==========================================');
  console.log(
    new Date().toLocaleString('pt-BR')
  );
  console.log('');
}

const currentFile = path.resolve(
  fileURLToPath(import.meta.url)
);

const executedFile = path.resolve(
  process.argv[1] || ''
);

if (currentFile === executedFile) {
  convertAll();

  if (once) {
    console.log(
      'Conversão única concluída.'
    );

    process.exit(0);
  }

  console.log(
    `Observando alterações em: ${folder}`
  );

  console.log(
    'Salve um Excel nessa pasta para sincronizar automaticamente.'
  );

  console.log(
    'Pressione Ctrl+C para parar.'
  );

  let timer = null;

  fs.watch(
    folder,
    (_event, filename) => {
      if (
        !filename ||
        filename.startsWith('~$') ||
        !/\.(xlsx|xls|xlsm|csv)$/i.test(filename)
      ) {
        return;
      }

      console.log(
        `Alteração detectada: ${filename}`
      );

      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        convertAll();
        timer = null;
      }, 1000);
    }
  );
}