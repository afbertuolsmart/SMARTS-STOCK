const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(ROOT, "data-source");
const OUTPUT = path.join(ROOT, "public", "data");

if (!fs.existsSync(OUTPUT)) {
  fs.mkdirSync(OUTPUT, { recursive: true });
}

function readExcel(fileName) {
  const filePath = path.join(SOURCE, fileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  return XLSX.utils.sheet_to_json(sheet, {
    defval: null,
    raw: false,
  });
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  let text = String(value).trim();

  // Remove espaços
  text = text.replace(/\s/g, "");

  // Formato brasileiro:
  // 10.222,500 → 10222.500
  if (text.includes(",") && text.includes(".")) {
    text = text.replace(/\./g, "").replace(",", ".");
  }
  // Somente vírgula:
  // 10222,500 → 10222.500
  else if (text.includes(",")) {
    text = text.replace(",", ".");
  }
  // Somente ponto:
  // Mantém como decimal.
  // Ex.: 10222.5 → 10222.5

  const number = Number(text);

  return Number.isFinite(number) ? number : 0;
}

function normalizeQuantidadeBrasileira(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  let text = String(value).trim();

  text = text.replace(/\s/g, "");

  // Formato brasileiro:
  // 31.000 -> 31000
  // 1.500 -> 1500
  // 10.222,500 -> 10222.5
  if (text.includes(".") && text.includes(",")) {
    text = text.replace(/\./g, "").replace(",", ".");
  } else if (text.includes(".")) {
    // No Compra Paraguai, ponto é separador de milhar
    text = text.replace(/\./g, "");
  } else if (text.includes(",")) {
    text = text.replace(",", ".");
  }

  const number = Number(text);

  return Number.isFinite(number) ? number : 0;
}
function normalizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function convertEstoque(fileName, local) {
  const rows = readExcel(fileName);

  return rows.map((r) => ({
    produto: normalizeText(r["Produto"]),
    desc_completa: normalizeText(r["Desc.completa"]),
    qtd_fisica: normalizeNumber(r["Qtd.física"]),
    grupo: normalizeText(r["Grupo"]),
    familia: normalizeText(r["Familia"]),
    local_estoque: local,
  }));
}

function convertCompras() {
  const rows = readExcel("COMPRABASES.xlsx");

  return rows.map((r) => ({
    num_oc: normalizeText(r["Núm.OC"]),
    produto: normalizeText(r["Produto"]),
    desc_completa: normalizeText(r["Desc.completa"]),
    grupo: normalizeText(r["Grupo"]),
    familia: normalizeText(r["Familia"]),
    qtd_aberto: normalizeNumber(r["Qtd.aberto"]),
    vlr_un: normalizeNumber(r["Vlr.un"]),
    dt_prazo_ent: normalizeText(r["Dt.prazo ent"]),
  }));
}

function convertComprasParaguai() {
  const rows = readExcel("COMPRAPARAGUAI.xlsx");

  return rows.map((r) => ({
    produto: normalizeText(r["Produto"]),
    desc_completa: normalizeText(r["Desc.completa"]),
    grupo: normalizeText(r["Grupo"]),
    familia: normalizeText(r["Familia"]),
    qtd_aberto: normalizeQuantidadeBrasileira(r["Qtd.aberto"]),
  }));
}

function convertConsumo() {
  const rows = readExcel("CONSUMOBASES.xlsx");

  return rows.map((r) => ({
    cod_prod: normalizeText(r["Cód.prod"]),
    desc_completa: normalizeText(r["Desc.completa"]),
    grupo: normalizeText(r["Grupo"]),
    descricao: normalizeText(r["Descrição"]),
    orig_movto: normalizeText(r["Orig.movto"]),
    descr_orig_movto: normalizeText(r["Descr.Orig.movto"]),
    qtd_movimentada: normalizeNumber(r["Qtd.movimentada"]),
    dt_movto: normalizeText(r["Dt.movto"]),
  }));
}

function writeJson(fileName, data) {
  const filePath = path.join(OUTPUT, fileName);

  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2),
    "utf8"
  );

  console.log(
    `${fileName}: ${data.length.toLocaleString("pt-BR")} registros`
  );
}

console.log("====================================");
console.log(" SMART GROUP - IMPORTAÇÃO DE BASES");
console.log("====================================");

const estoqueLocal = convertEstoque(
  "ESTOQUEBASESLOCAL.xlsx",
  "Estoque Local"
);

const estoqueParaguai = convertEstoque(
  "ESTOQUEPARAGUAI.xlsx",
  "Paraguai"
);

const estoqueEadi = convertEstoque(
  "ESTOQUEEADI.xlsx",
  "EADI"
);

const compras = convertCompras();
const comprasParaguai = convertComprasParaguai();
const consumo = convertConsumo();

writeJson(
  "ESTOQUEBASESLOCAL.json",
  estoqueLocal
);

writeJson(
  "ESTOQUEPARAGUAI.json",
  estoqueParaguai
);

writeJson(
  "ESTOQUEEADI.json",
  estoqueEadi
);

writeJson(
  "COMPRABASES.json",
  compras
);

writeJson(
  "COMPRAPARAGUAI.json",
  comprasParaguai
);

writeJson(
  "CONSUMOBASES.json",
  consumo
);

console.log("");
console.log("Importação concluída.");