// Recebido como HTML empacotado, feito pela equipe; trazido para o hub sem
// mudança de lógica. Única troca: as imagens vinham de window.__resources e
// agora vêm de RECURSOS (./recursos.js), servidas pelo próprio hub.
// Modelo paramétrico do estande Softplan — três tipologias.
// Medidas em metros, origem no centro da área contratada, y-up.
import * as THREE from 'three';
import { RECURSOS } from './recursos.js';

export const MOD = 0.92;              // módulo octanorm (meio painel de 1,84 m)
let ALT = 3.04;                       // altura da estrutura no build corrente
let BANDA = 0.40;                     // altura da testeira no build corrente

export const TAGLINES = [
  'Vidas transformadas pela tecnologia.',
  'Conectando futuros com o Setor Público.',
  'Tecnologia que conecta o Setor Público à sociedade.',
  'A maior GovTech da América Latina.',
  'Inteligência Artificial para a gestão de cidades inteligentes.',
  'Inteligência Artificial para uma gestão mais ágil, segura e produtiva.',
];

export const CORES = {
  'roxo-80': '#5C5CFF', 'azul-royal': '#2E2ED6', 'azul-80': '#2D2A58',
  'roxo-20': '#F0EAFF', 'roxo-10': '#F7F5FF', branco: '#FFFFFF', 'cinza-20': '#F1F2F7',
};

export const IMAGENS = {
  obras: [RECURSOS['img_obras_jpg'], 'Obras e fiscalização'],
  cidades: [RECURSOS['img_cidades_jpg'], 'Cidades'],
  processos: [RECURSOS['img_processos_jpg'], 'Processos'],
  justica: [RECURSOS['img_justica_jpg'], 'Justiça'],
  cidadaos: [RECURSOS['img_cidadaos_jpg'], 'Cidadãos'],
  sede: [RECURSOS['img_sede_jpg'], 'Sede São José/SC'],
  'gradiente-1': [RECURSOS['img_gradiente_1_png'], 'Gradiente 03'],
  'gradiente-2': [RECURSOS['img_gradiente_2_png'], 'Gradiente 07'],
  'softpoint-duo': [RECURSOS['img_softpoint_duo_png'], 'Softpoint dupla'],
  'softpoint-cascata': [RECURSOS['img_softpoint_cascata_png'], 'Softpoint cascata'],
  grid: [RECURSOS['img_grid_01_png'], 'Grid modular'],
};

const C = {
  roxo10: '#F7F5FF', roxo20: '#F0EAFF', roxo40: '#9A7CFF', roxo80: '#5C5CFF',
  azul60: '#575392', azul80: '#2D2A58', azul100: '#181A27', azulTexto: '#2B2F47',
  cinza20: '#F1F2F7', cinza40: '#DCDEEA', cinza60: '#9196AD', branco: '#FFFFFF',
};

// ---------------------------------------------------------------- materiais
const M = {};
function mat(name, opts) {
  if (!M[name]) { M[name] = new THREE.MeshStandardMaterial(opts); M[name].name = name; }
  return M[name];
}
const alu = () => mat('aluminio', { color: 0xd9dbe4, roughness: 0.35, metalness: 0.35 });
const painelBranco = () => mat('painel-branco', { color: 0xf4f5f9, roughness: 0.75 });
const tampo = () => mat('tampo-branco', { color: 0xffffff, roughness: 0.4 });
const granito = () => mat('tampo-granito', { color: 0xb9bcc4, roughness: 0.55 });
const tela = () => mat('tv-tela', { color: 0x101320, roughness: 0.25 });
const moldura = () => mat('tv-moldura', { color: 0x1b1c22, roughness: 0.6 });
const estofado = () => mat('estofado-claro', { color: 0xf2f0ec, roughness: 0.85 });
const cromado = () => mat('metal-cromado', { color: 0xbfc3cc, roughness: 0.3, metalness: 0.4 });
const vidro = () => mat('vidro', { color: 0xdfe6ea, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.45 });
const vidroSala = () => mat('vidro-sala', { color: 0xdfe6f2, roughness: 0.05, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide });
const perfilPreto = () => mat('perfil-preto', { color: 0x15161c, roughness: 0.4, metalness: 0.2 });
const madeira = () => mat('madeira', { color: 0xb08453, roughness: 0.7 });
const madeiraEsc = () => mat('madeira-escura', { color: 0x3b2a20, roughness: 0.6 });
const tecido = () => mat('tecido-poltrona', { color: 0xcbbba8, roughness: 0.95 });
const neonRoxo = () => mat('neon-roxo', { color: 0xd2c6ff, emissive: 0x9a7cff, emissiveIntensity: 2.4 });
const preto = () => mat('preto', { color: 0x1a1b24, roughness: 0.4 });
const ledClaro = () => mat('led-claro', { color: 0xf0eaff, emissive: 0xcac4ff, emissiveIntensity: 1.1, roughness: 0.3 });
const folhagem = () => mat('folhagem', { color: 0x4f7d55, roughness: 0.8 });
const folhagemEsc = () => mat('folhagem-escura', { color: 0x3a6343, roughness: 0.85 });
const globo = () => mat('globo-luz', { color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.55, roughness: 0.2 });
const led = () => mat('led-roxo', { color: 0x9a7cff, emissive: 0x9a7cff, emissiveIntensity: 0.9, roughness: 0.4 });
const carpete = (tom) => tom === 'grafite'
  ? mat('carpete-grafite', { color: 0x2a2c3a, roughness: 0.95 })
  : (tom === 'madeira'
    ? mat('piso-madeira', { color: 0xd8c3a5, roughness: 0.8 })
    : mat('carpete-claro', { color: 0xe4e5ec, roughness: 0.92 }));
function corSolida(hex) {
  const chave = 'cor-' + hex.replace('#', '');
  return mat(chave, { color: new THREE.Color(hex), roughness: 0.6 });
}

// ---------------------------------------------------------------- assets
const LOGOS = {};
const BITMAPS = {};
const PRODLOGOS = {};
const PRODUTOS_SVG = ['saj-tribunais', 'saj-procuradorias', 'saj-defensorias', '1doc', 'obras', 'saff'];
export async function carregarAssets() {
  const logos = { branco: RECURSOS['logoBranco'], mono: RECURSOS['logoMono'], roxo: RECURSOS['logoRoxo'], s: RECURSOS['simboloS'] };
  const carregar = (url, alvo, chave) => new Promise((res) => {
    const im = new Image();
    im.onload = () => { alvo[chave] = im; res(); };
    im.onerror = () => res();
    im.src = url;
  });
  await Promise.all([
    ...Object.entries(logos).map(([k, u]) => carregar(u, LOGOS, k)),
    ...Object.entries(IMAGENS).map(([k, [u]]) => carregar(u, BITMAPS, k)),
  ]);
  await Promise.all(PRODUTOS_SVG.map(async (p) => {
    try {
      let txt = await (await fetch(RECURSOS['prod_' + p.replace(/\W/g, '_')])).text();
      const vb = txt.match(/viewBox="([^"]+)"/);
      if (vb) {
        const v = vb[1].trim().split(/[\s,]+/).map(Number);
        txt = txt.replace(/<svg([^>]*?)\swidth="[^"]*"/, '<svg$1').replace(/<svg([^>]*?)\sheight="[^"]*"/, '<svg$1')
          .replace('<svg', '<svg width="' + v[2] * 4 + '" height="' + v[3] * 4 + '"');
      }
      await carregar('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(txt), PRODLOGOS, p);
    } catch (e) { /* segue sem o logo */ }
  }));
  try { await document.fonts.load('600 80px Sora'); await document.fonts.load('400 40px Sora'); } catch (e) { /* Segoe UI */ }
}

// registra uma imagem enviada pelo usuário
export function registrarImagem(chave, rotulo, dataURL) {
  return new Promise((res) => {
    const im = new Image();
    im.onload = () => { BITMAPS[chave] = im; IMAGENS[chave] = [dataURL, rotulo]; res(chave); };
    im.onerror = () => res(null);
    im.src = dataURL;
  });
}

// ---------------------------------------------------------------- desenho
function canvasTex(wCm, hCm, draw) {
  const px = Math.min(1600, Math.max(700, Math.round(wCm * 7)));
  const cv = document.createElement('canvas');
  cv.width = px; cv.height = Math.max(24, Math.round(px * hCm / wCm));
  draw(cv.getContext('2d'), cv.width, cv.height);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

function malha(ctx, w, h, passo, cor, lw) {
  ctx.save(); ctx.strokeStyle = cor; ctx.lineWidth = lw;
  const r = passo * 0.32;
  for (let y = -passo; y < h + passo; y += passo) {
    for (let x = -passo; x < w + passo; x += passo) {
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.lineTo(x + passo, y);
      ctx.lineTo(x + passo, y + passo - r);
      ctx.quadraticCurveTo(x + passo, y + passo, x + passo - r, y + passo);
      ctx.lineTo(x, y + passo); ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// Softpoint: cantos superior-esquerdo e inferior-direito arredondados
function softpoint(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function grad(ctx, w, h, stops, diag) {
  const g = diag ? ctx.createLinearGradient(0, 0, w, h) : ctx.createLinearGradient(0, 0, w, 0);
  stops.forEach(([p, c]) => g.addColorStop(p, c));
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}

function tinted(key, cor) {
  const im = LOGOS[key];
  if (!im) return null;
  const cv = document.createElement('canvas');
  cv.width = im.width; cv.height = im.height;
  const c = cv.getContext('2d');
  c.drawImage(im, 0, 0);
  c.globalCompositeOperation = 'source-in';
  c.fillStyle = cor; c.fillRect(0, 0, cv.width, cv.height);
  return cv;
}

// versão do logo por fundo (manual): claro → roxo c/ Softpoint escuro; escuro → roxo c/ Softpoint branco; roxo → monocromática branca
function versaoLogo(fundo) {
  if (claroP(fundo)) return 'roxo';
  if (fundo === 'roxo' || fundo === 'royal') return 'mono';
  return 'escuro';
}
function marca(ctx, cor, cx, cy, largura) {
  const fonte = cor === 'roxo' ? LOGOS.roxo
    : cor === 'escuro' ? LOGOS.branco
    : cor === 'mono' || cor === 'branco' ? (LOGOS.mono || tinted('branco', '#FFFFFF'))
    : tinted('branco', cor);
  if (!fonte) return;
  const h = largura * (fonte.height / fonte.width);
  ctx.drawImage(fonte, cx - largura / 2, cy - h / 2, largura, h);
}

function cover(ctx, im, x, y, w, h) {
  const r = Math.max(w / im.width, h / im.height);
  const dw = im.width * r, dh = im.height * r;
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.drawImage(im, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
}

function texto(ctx, linhas, x, y, size, cor, peso, lh) {
  ctx.fillStyle = cor; ctx.textBaseline = 'top';
  ctx.font = `${peso} ${size}px Sora, "Segoe UI", sans-serif`;
  linhas.forEach((l, i) => ctx.fillText(l, x, y + i * size * (lh || 1.28)));
}

function quebrar(ctx, frase, size, peso, maxW) {
  ctx.font = `${peso} ${size}px Sora, "Segoe UI", sans-serif`;
  const linhas = []; let atual = '';
  String(frase || '').split(/\s+/).forEach((p) => {
    const teste = atual ? atual + ' ' + p : p;
    if (ctx.measureText(teste).width > maxW && atual) { linhas.push(atual); atual = p; }
    else atual = teste;
  });
  if (atual) linhas.push(atual);
  return linhas;
}

// ---------------------------------------------------------------- artes
// Cada arte recebe (ctx, w, h, d) — d é o descritor da superfície.
const FUNDOS = {
  claro: (ctx, w, h) => grad(ctx, w, h, [[0, '#FFFFFF'], [1, C.roxo10]], true),
  gradiente: (ctx, w, h) => grad(ctx, w, h, [[0, '#FBFAFF'], [0.55, C.roxo20], [1, '#B9A6FF']], true),
  roxo: (ctx, w, h) => { ctx.fillStyle = C.roxo80; ctx.fillRect(0, 0, w, h); },
  royal: (ctx, w, h) => { ctx.fillStyle = CORES['azul-royal']; ctx.fillRect(0, 0, w, h); },
  azul: (ctx, w, h) => grad(ctx, w, h, [[0, C.azul80], [1, C.azul100]], true),
};
const claroP = (f) => f === 'claro' || f === 'gradiente';

const ARTES = {
  // parede institucional: marca, frase e placa Softpoint — layout dos mockups
  frase: (ctx, w, h, d) => {
    const fundo = d.fundo || 'claro';
    (FUNDOS[fundo] || FUNDOS.claro)(ctx, w, h);
    const claro = claroP(fundo);
    const tinta = claro ? C.azulTexto : '#FFFFFF';
    const destaque = claro ? C.roxo80 : C.roxo40;
    // placa Softpoint saindo da borda direita
    const s = Math.min(w * 0.52, h * 0.72);
    ctx.save();
    ctx.globalAlpha = claro ? 1 : 0.32;
    ctx.fillStyle = claro ? C.roxo80 : '#FFFFFF';
    softpoint(ctx, w - s * 0.62, h * 0.24, s, s, s * 0.46);
    ctx.fill();
    ctx.globalAlpha = claro ? 0.5 : 0.18;
    ctx.fillStyle = claro ? C.roxo40 : '#FFFFFF';
    softpoint(ctx, w - s * 0.3, h * 0.58, s * 0.7, s * 0.7, s * 0.34);
    ctx.fill();
    ctx.restore();
    const x = w * 0.09;
    if (d.marca !== false) marca(ctx, versaoLogo(fundo), x + w * 0.145, h * 0.17, w * 0.29);
    let size = Math.min(w * 0.052, h * 0.1);
    const frase = d.frase || TAGLINES[4];
    let linhas = quebrar(ctx, frase, size, 600, w * 0.44);
    while (linhas.length * size * 1.34 > h * 0.44 && size > w * 0.024) {
      size *= 0.9;
      linhas = quebrar(ctx, frase, size, 600, w * 0.44);
    }
    const bloco = linhas.length * size * 1.34;
    const topo = Math.max(h * 0.3, h * 0.58 - bloco / 2);
    ctx.fillStyle = destaque;
    ctx.fillRect(x, topo + size * 0.28, 4, bloco - size * 0.4);
    softpoint(ctx, x - 2, topo + size * 0.05, size * 0.22, size * 0.22, size * 0.1); ctx.fill();
    linhas.forEach((l, i) => {
      const ultima = i === linhas.length - 1;
      texto(ctx, [l], x + w * 0.035, topo + i * size * 1.34, size, ultima ? destaque : tinta, ultima ? 600 : 500);
    });
  },
  // parede de produtos do portfólio
  produtos: (ctx, w, h, d) => {
    const fundo = d.fundo || 'claro';
    (FUNDOS[fundo] || FUNDOS.claro)(ctx, w, h);
    const claro = claroP(fundo);
    malha(ctx, w, h, w * 0.24, claro ? 'rgba(154,124,255,.2)' : 'rgba(255,255,255,.16)', 2);
    const tinta = claro ? C.azulTexto : '#FFFFFF';
    const apoio = claro ? C.azul60 : 'rgba(255,255,255,.75)';
    const prods = [
      ['1Doc', 'Gestão de processos administrativos.'],
      ['obras.gov', 'Do orçamento à obra, ponta a ponta.'],
      ['GPLA', 'Licenciamento ambiental.'],
      ['SAFF', 'Processos cofinanciados.'],
      ['SIDER', 'Infraestrutura e rodovias.'],
      ['SAJ', 'Recuperação de recursos do município.'],
    ];
    marca(ctx, versaoLogo(fundo), w * 0.24, h * 0.12, w * 0.3);
    const colW = w * 0.4, x0 = w * 0.09, y0 = h * 0.26, linha = h * 0.115;
    prods.forEach(([nome, desc], i) => {
      const x = x0 + (i % 2) * colW * 1.12;
      const y = y0 + Math.floor(i / 2) * linha * 1.5;
      ctx.strokeStyle = claro ? C.roxo80 : C.roxo40; ctx.lineWidth = 3;
      softpoint(ctx, x, y, w * 0.035, w * 0.035, w * 0.012); ctx.stroke();
      texto(ctx, [nome], x + w * 0.055, y - w * 0.004, w * 0.036, tinta, 600);
      texto(ctx, quebrar(ctx, desc, w * 0.019, 400, colW * 0.78), x + w * 0.055, y + w * 0.042, w * 0.019, apoio, 400, 1.4);
    });
  },
  // marca cheia
  marca: (ctx, w, h, d) => {
    const fundo = d.fundo || 'roxo';
    (FUNDOS[fundo] || FUNDOS.roxo)(ctx, w, h);
    const claro = claroP(fundo);
    malha(ctx, w, h, w * 0.22, claro ? 'rgba(154,124,255,.24)' : 'rgba(255,255,255,.18)', 2);
    const im = tinted('s', claro ? C.roxo80 : '#FFFFFF');
    if (im && h > w * 0.8) { const s = w * 0.3; ctx.drawImage(im, (w - s) / 2, h * 0.26, s, s * (im.height / im.width)); }
    marca(ctx, versaoLogo(fundo), w * 0.5, h > w * 0.8 ? h * 0.72 : h * 0.5, Math.min(w * 0.5, h * 1.6));
  },
  // banda de dados e cases (faixa larga dos renders)
  dados: (ctx, w, h, d) => {
    (FUNDOS[d.fundo || 'azul'])(ctx, w, h);
    const claro = claroP(d.fundo || 'azul');
    const pad = h * 0.09, cardH = h - pad * 2, r = h * 0.07;
    let x = pad;
    const foto = (chave, larg) => {
      const im = BITMAPS[chave];
      ctx.save(); softpoint(ctx, x, pad, larg, cardH, r); ctx.clip();
      if (im) cover(ctx, im, x, pad, larg, cardH); else { ctx.fillStyle = C.cinza40; ctx.fillRect(x, pad, larg, cardH); }
      ctx.restore(); x += larg + pad * 0.6;
    };
    const card = (titulo, valor, larg) => {
      ctx.fillStyle = claro ? 'rgba(92,92,255,.1)' : 'rgba(255,255,255,.12)';
      softpoint(ctx, x, pad, larg, cardH, r); ctx.fill();
      const t = claro ? C.azulTexto : '#FFFFFF';
      texto(ctx, [valor], x + larg * 0.09, pad + cardH * 0.28, h * 0.19, t, 600);
      texto(ctx, quebrar(ctx, titulo, h * 0.085, 400, larg * 0.82), x + larg * 0.09, pad + cardH * 0.58, h * 0.085,
        claro ? C.azul60 : 'rgba(255,255,255,.75)', 400, 1.35);
      x += larg + pad * 0.6;
    };
    foto('obras', w * 0.17);
    card(d.dado1 || 'em rodovias monitoradas', d.valor1 || '215 mil km', w * 0.2);
    card(d.dado2 || 'em receitas próprias', d.valor2 || 'R$ 632 mi', w * 0.2);
    foto('cidades', w * 0.17);
    const im = BITMAPS['softpoint-duo'];
    if (im) { const larg = w - x - pad; cover(ctx, im, x, pad, larg, cardH); }
  },
  // imagem: foto ou grafismo, com frase opcional
  imagem: (ctx, w, h, d) => {
    const im = BITMAPS[d.img];
    if (im) cover(ctx, im, 0, 0, w, h);
    else { FUNDOS.gradiente(ctx, w, h); }
    if (d.frase) {
      const g = ctx.createLinearGradient(0, h * 0.35, 0, h);
      g.addColorStop(0, 'rgba(24,26,39,0)'); g.addColorStop(1, 'rgba(24,26,39,.78)');
      ctx.fillStyle = g; ctx.fillRect(0, h * 0.35, w, h * 0.65);
      const size = Math.min(w * 0.05, h * 0.1);
      const linhas = quebrar(ctx, d.frase, size, 600, w * 0.72);
      texto(ctx, linhas, w * 0.08, h - size * 1.34 * linhas.length - h * 0.08, size, '#FFFFFF', 600);
    }
    if (d.marca) marca(ctx, 'escuro', w * 0.82, h * 0.12, w * 0.24);
  },
  // testeira
  testeira: (ctx, w, h, d) => {
    const fundo = d.fundo || 'gradiente';
    (FUNDOS[fundo] || FUNDOS.gradiente)(ctx, w, h);
    const claro = claroP(fundo);
    if (!claro) malha(ctx, w, h, h * 0.6, 'rgba(255,255,255,.16)', 2);
    if (d.marca !== false) marca(ctx, versaoLogo(fundo), w * 0.5, h * 0.5, Math.min(w * 0.26, h * 3.2));
    if (d.frase) {
      const col = Math.min(w * 0.22, h * 4);
      let size = h * 0.15;
      let linhas = quebrar(ctx, d.frase, size, 600, col);
      while (linhas.length * size * 1.3 > h * 0.8 && size > h * 0.07) { size *= 0.9; linhas = quebrar(ctx, d.frase, size, 600, col); }
      texto(ctx, linhas, w * 0.035, (h - linhas.length * size * 1.3) / 2, size, claro ? C.azulTexto : '#FFFFFF', 600, 1.3);
    }
    if (d.evento) {
      ctx.textAlign = 'right';
      texto(ctx, [d.evento], w * 0.97, h * 0.38, h * 0.24, claro ? C.azulTexto : 'rgba(255,255,255,.9)', 600);
      ctx.textAlign = 'left';
    }
  },
  // frente de balcão
  balcao: (ctx, w, h, d) => {
    const fundo = d.fundo || 'roxo';
    (FUNDOS[fundo] || FUNDOS.roxo)(ctx, w, h);
    const claro = claroP(fundo);
    const tinta = claro ? C.roxo80 : '#FFFFFF';
    ctx.save();
    ctx.globalAlpha = claro ? 0.12 : 0.2;
    ctx.fillStyle = claro ? C.roxo80 : '#FFFFFF';
    softpoint(ctx, w * 0.42, h * 0.1, w * 0.72, w * 0.72, w * 0.33); ctx.fill();
    ctx.restore();
    marca(ctx, versaoLogo(fundo), w * 0.34, h * 0.28, w * 0.44);
    const itens = ['1Doc', 'obras.gov', 'SAJ', 'SAFF', 'GPLA', 'SIDER'];
    const size = w * 0.055;
    itens.slice(0, 6).forEach((t, i) => {
      const x = w * 0.1 + (i % 2) * w * 0.28;
      const y = h * 0.48 + Math.floor(i / 2) * size * 1.7;
      ctx.strokeStyle = claro ? 'rgba(92,92,255,.55)' : 'rgba(255,255,255,.65)'; ctx.lineWidth = w * 0.006;
      softpoint(ctx, x, y + size * 0.1, size * 0.72, size * 0.72, size * 0.26); ctx.stroke();
      texto(ctx, [t], x + size, y, size, tinta, 600);
    });
  },
  cor: (ctx, w, h, d) => { ctx.fillStyle = d.cor || C.branco; ctx.fillRect(0, 0, w, h); },
  // tela digital: totens e arco holográfico
  tela: (ctx, w, h, d) => {
    (FUNDOS[d.fundo || 'azul'] || FUNDOS.azul)(ctx, w, h);
    const s = tinted('s', '#FFFFFF');
    const sw = w * 0.16;
    if (s) ctx.drawImage(s, (w - sw) / 2, h * 0.07, sw, sw * (s.height / s.width));
    marca(ctx, versaoLogo(d.fundo || 'azul'), w * 0.5, h * 0.07 + sw * 1.35, w * 0.56);
    let y = h * 0.07 + sw * 1.9;
    const im = BITMAPS[d.img];
    if (im) {
      const ih = h * 0.42;
      ctx.save(); softpoint(ctx, w * 0.1, y, w * 0.8, ih, w * 0.12); ctx.clip();
      cover(ctx, im, w * 0.1, y, w * 0.8, ih); ctx.restore();
      y += ih + h * 0.04;
    }
    if (d.frase) {
      const size = w * 0.075;
      const linhas = quebrar(ctx, d.frase, size, 600, w * 0.8);
      texto(ctx, linhas, w * 0.1, y, size, '#FFFFFF', 600, 1.3);
    }
    // placas Softpoint em gradiente no pé da tela
    const g = ctx.createLinearGradient(0, h * 0.8, w, h);
    g.addColorStop(0, C.roxo20); g.addColorStop(0.5, C.roxo40); g.addColorStop(1, C.roxo80);
    ctx.fillStyle = g;
    softpoint(ctx, w * 0.34, h * 0.84, w * 0.9, w * 0.9, w * 0.4); ctx.fill();
    ctx.globalAlpha = 0.5;
    softpoint(ctx, -w * 0.2, h * 0.9, w * 0.7, w * 0.7, w * 0.3); ctx.fill();
    ctx.globalAlpha = 1;
  },
  // painel escuro com grid modular (parede de fundo do estúdio)
  grid: (ctx, w, h, d) => {
    ctx.fillStyle = C.azul100; ctx.fillRect(0, 0, w, h);
    const rg = ctx.createRadialGradient(w * 0.85, h * 1.05, 0, w * 0.85, h * 1.05, w * 0.9);
    rg.addColorStop(0, 'rgba(92,92,255,.55)'); rg.addColorStop(0.45, 'rgba(45,42,88,.6)'); rg.addColorStop(1, 'rgba(24,26,39,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
    const rg2 = ctx.createRadialGradient(w * 0.08, -h * 0.05, 0, w * 0.08, -h * 0.05, w * 0.45);
    rg2.addColorStop(0, 'rgba(92,92,255,.35)'); rg2.addColorStop(0.5, 'rgba(45,42,88,.4)'); rg2.addColorStop(1, 'rgba(24,26,39,0)');
    ctx.fillStyle = rg2; ctx.fillRect(0, 0, w, h);
    const im = BITMAPS.grid;
    if (im) { ctx.globalAlpha = 0.3; cover(ctx, im, 0, 0, w, h); ctx.globalAlpha = 1; }
    if (d.frase) {
      const size = Math.min(w * 0.04, h * 0.09);
      texto(ctx, quebrar(ctx, d.frase, size, 600, w * 0.4), w * 0.07, h * 0.18, size, '#FFFFFF', 600, 1.3);
    }
  },
  // backdrop com as marcas de produto
  logos: (ctx, w, h, d) => {
    (FUNDOS[d.fundo || 'azul'] || FUNDOS.azul)(ctx, w, h);
    const rg = ctx.createRadialGradient(w / 2, h * 0.3, 0, w / 2, h * 0.3, w * 0.6);
    rg.addColorStop(0, 'rgba(92,92,255,.35)'); rg.addColorStop(1, 'rgba(45,42,88,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
    marca(ctx, versaoLogo(d.fundo || 'azul'), w / 2, h * 0.2, w * 0.36);
    ctx.fillStyle = 'rgba(247,245,255,.25)'; ctx.fillRect(w * 0.2, h * 0.33, w * 0.6, 3);
    PRODUTOS_SVG.forEach((p, i) => {
      const im = PRODLOGOS[p];
      if (!im) return;
      const lh = h * 0.07, lw = lh * (im.width / im.height);
      const cx = w * (0.22 + (i % 3) * 0.28), cy = h * (0.47 + Math.floor(i / 3) * 0.2);
      const k = Math.min(1, (w * 0.25) / lw);
      ctx.drawImage(im, cx - lw * k / 2, cy - lh * k / 2, lw * k, lh * k);
    });
  },
  // letreiro: eyebrow + título + ícone de microfone
  letreiro: (ctx, w, h, d) => {
    (FUNDOS[d.fundo || 'roxo'] || FUNDOS.roxo)(ctx, w, h);
    const claro = claroP(d.fundo || 'roxo');
    const tinta = claro ? C.azul80 : '#FFFFFF';
    const cx = h * 0.62, cy = h * 0.46, u = h / 256;
    ctx.fillStyle = tinta; ctx.strokeStyle = tinta; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.roundRect(cx - 30 * u, cy - 74 * u, 60 * u, 108 * u, 30 * u); ctx.fill();
    ctx.lineWidth = 10 * u; ctx.beginPath(); ctx.arc(cx, cy - 4 * u, 52 * u, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy + 48 * u); ctx.lineTo(cx, cy + 82 * u); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 32 * u, cy + 84 * u); ctx.lineTo(cx + 32 * u, cy + 84 * u); ctx.stroke();
    ctx.fillStyle = claro ? C.roxo80 : C.roxo40;
    ctx.beginPath(); ctx.arc(cx + 56 * u, cy - 64 * u, 12 * u, 0, 7); ctx.fill();
    const x = cx + 100 * u;
    ctx.save();
    try { ctx.letterSpacing = (6 * u) + 'px'; } catch (e) { /* sem suporte */ }
    texto(ctx, [String(d.eyebrow || 'Estúdio').toUpperCase()], x, h * 0.2, 28 * u, tinta, 600);
    ctx.restore();
    texto(ctx, [d.titulo || 'podcast'], x - 6 * u, h * 0.34, 112 * u, tinta, 600);
  },
  // faixa de testeira: logo + texto em caixa alta (use / para quebrar linha)
  faixa: (ctx, w, h, d) => {
    const fundo = d.fundo || 'royal';
    (FUNDOS[fundo] || FUNDOS.royal)(ctx, w, h);
    const claro = claroP(fundo);
    const frase = String(d.frase || '').trim();
    const lw = Math.min(w * 0.3, h * 2.8);
    if (d.marca !== false) marca(ctx, versaoLogo(fundo), frase ? w * 0.3 : w * 0.5, h * 0.5, lw);
    if (frase) {
      let size = h * 0.13;
      let linhas = frase.indexOf('/') >= 0 ? frase.split('/').map((l) => l.trim()).filter(Boolean) : quebrar(ctx, frase, size, 400, w * 0.2);
      size = Math.min(size, (h * 0.82) / (linhas.length * 1.22));
      ctx.save();
      try { ctx.letterSpacing = (size * 0.1) + 'px'; } catch (e) { /* sem suporte */ }
      texto(ctx, linhas.map((l) => l.toUpperCase()), w * 0.62, (h - linhas.length * size * 1.22) / 2, size, claro ? C.azul80 : '#FFFFFF', 400, 1.22);
      ctx.restore();
    }
  },
  // nicho iluminado: tela escura com fitas de luz em gradiente
  nicho: (ctx, w, h, d) => {
    ctx.fillStyle = '#10111C'; ctx.fillRect(0, 0, w, h);
    const glow = ctx.createRadialGradient(w * 0.5, h * 0.95, 0, w * 0.5, h * 0.95, w * 0.9);
    glow.addColorStop(0, 'rgba(154,124,255,.55)'); glow.addColorStop(1, 'rgba(24,26,39,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
    const fita = (p, c0, c1) => {
      const g = ctx.createLinearGradient(0, h * 0.45, 0, h);
      g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(p[0], p[1]);
      ctx.bezierCurveTo(p[2], p[3], p[4], p[5], p[6], p[7]);
      ctx.bezierCurveTo(p[8], p[9], p[10], p[11], p[12], p[13]);
      ctx.closePath(); ctx.fill();
    };
    fita([0, h * 0.55, w * 0.35, h * 0.7, w * 0.45, h * 0.85, w * 0.5, h, w * 0.2, h, w * 0.05, h * 0.9, 0, h * 0.8], 'rgba(240,234,255,.85)', 'rgba(154,124,255,.9)');
    fita([w, h * 0.5, w * 0.6, h * 0.62, w * 0.55, h * 0.85, w * 0.5, h, w * 0.8, h, w * 0.95, h * 0.9, w, h * 0.78], 'rgba(202,196,255,.9)', 'rgba(92,92,255,.95)');
    const luz = ctx.createLinearGradient(0, h * 0.45, 0, h);
    luz.addColorStop(0, 'rgba(154,124,255,0)'); luz.addColorStop(0.6, 'rgba(154,124,255,.9)'); luz.addColorStop(1, '#FFFFFF');
    ctx.fillStyle = luz; ctx.fillRect(w * 0.5 - w * 0.006, h * 0.45, w * 0.012, h * 0.55);
    const top = h * 0.3, lw = w * 0.3;
    marca(ctx, 'escuro', w * 0.12 + lw / 2, top, lw);
    const size = w * 0.05;
    texto(ctx, ['|  ' + (d.marcas || 'GEP | Just')], w * 0.12 + lw + w * 0.03, top - size * 0.62, size, '#FFFFFF', 600);
    const fs = w * 0.045;
    ctx.save();
    try { ctx.letterSpacing = (fs * 0.12) + 'px'; } catch (e) { /* sem suporte */ }
    texto(ctx, quebrar(ctx, String(d.frase || '').toUpperCase(), fs, 400, w * 0.46), w * 0.12, top + h * 0.06, fs, '#FFFFFF', 400, 1.35);
    ctx.restore();
  },
  // lista de verticais de atuação
  lista: (ctx, w, h, d) => {
    (FUNDOS[d.fundo || 'claro'] || FUNDOS.claro)(ctx, w, h);
    const claro = claroP(d.fundo || 'claro');
    const itens = String(d.itens || 'Cidades, Governo, Justiça, Saúde, Educação').split(',').map((t) => t.trim()).filter(Boolean);
    const size = Math.min(w * 0.034, h * 0.045);
    const x = w * 0.14;
    let y = h * 0.3;
    ctx.save();
    try { ctx.letterSpacing = (size * 0.18) + 'px'; } catch (e) { /* sem suporte */ }
    itens.forEach((t) => { texto(ctx, [t.toUpperCase()], x, y, size, claro ? C.azul60 : 'rgba(255,255,255,.85)', 400); y += size * 2; });
    ctx.restore();
    ctx.fillStyle = claro ? C.roxo80 : C.roxo40;
    ctx.fillRect(x, y + size * 0.4, size * 1.4, 4);
  },
};

export const TIPOS_ARTE = [
  ['frase', 'Marca + frase'],
  ['produtos', 'Portfólio de produtos'],
  ['marca', 'Marca cheia'],
  ['dados', 'Cases e números'],
  ['imagem', 'Imagem'],
  ['balcao', 'Marca + produtos (balcão)'],
  ['testeira', 'Testeira'],
  ['tela', 'Tela digital'],
  ['grid', 'Painel escuro com grid'],
  ['logos', 'Marcas de produto'],
  ['letreiro', 'Letreiro (estúdio)'],
  ['video', 'Vídeo Softpoint (painel LED)'],
  ['faixa', 'Faixa de testeira'],
  ['nicho', 'Nicho iluminado'],
  ['lista', 'Lista de verticais'],
  ['cor', 'Cor sólida'],
];

// ---------------------------------------------------------------- superfícies
// catálogo do build corrente: id -> { rotulo, wCm, hCm, padrao }
let CATALOGO = {};
export function catalogo() { return CATALOGO; }

function descritor(cfg, id, padrao) {
  const salvo = (cfg.superficies || {})[id];
  const base = Object.assign({}, padrao, salvo || {});
  if (base.tipo === 'frase' && !base.frase) base.frase = cfg.frase || TAGLINES[4];
  if (base.tipo === 'testeira' && base.evento === undefined) base.evento = cfg.evento || '';
  return base;
}

function supMat(cfg, id, rotulo, wCm, hCm, padrao) {
  CATALOGO[id] = { rotulo, wCm, hCm, padrao };
  const d = descritor(cfg, id, padrao);
  if (d.tipo === 'cor' && !d.textura) return corSolida(d.cor || '#FFFFFF');
  if (d.tipo === 'video') return videoMat();
  const chave = id + '|' + wCm + 'x' + hCm + '|' + JSON.stringify(d);
  if (!M[chave]) {
    const desenhar = ARTES[d.tipo] || ARTES.cor;
    M[chave] = new THREE.MeshStandardMaterial({
      map: canvasTex(wCm, hCm, (ctx, w, h) => desenhar(ctx, w, h, d)),
      roughness: 0.72,
    });
    M[chave].name = 'arte-' + id;
  }
  return M[chave];
}

let VIDEO_MAT = null;
function videoMat() {
  if (VIDEO_MAT) return VIDEO_MAT;
  const v = document.createElement('video');
  Object.assign(v, { src: RECURSOS['videoSoftpoint'], muted: true, loop: true, playsInline: true, autoplay: true, crossOrigin: 'anonymous' });
  v.play().catch(() => {});
  // quadro estático enquanto o vídeo não decodifica (ou se o navegador não tocar H.264)
  const still = canvasTex(300, 200, (ctx, w, h) => ARTES.marca(ctx, w, h, { fundo: 'azul' }));
  VIDEO_MAT = new THREE.MeshStandardMaterial({ color: 0xffffff, map: still, emissive: 0xffffff, emissiveMap: still, emissiveIntensity: 0.6, roughness: 0.3 });
  VIDEO_MAT.name = 'painel-led-video';
  const trocar = () => {
    if (VIDEO_MAT.map && VIDEO_MAT.map.isVideoTexture) return;
    const t = new THREE.VideoTexture(v); t.colorSpace = THREE.SRGBColorSpace;
    VIDEO_MAT.map = t; VIDEO_MAT.emissiveMap = t; VIDEO_MAT.emissiveIntensity = 0.9; VIDEO_MAT.needsUpdate = true;
  };
  v.addEventListener('playing', trocar);
  v.addEventListener('loadeddata', () => { if (!v.paused) trocar(); });
  return VIDEO_MAT;
}

// ---------------------------------------------------------------- peças
function box(nome, w, h, d, material, x, y, z, ry) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.name = nome; m.position.set(x, y, z);
  if (ry) m.rotation.y = ry;
  return m;
}

// placa de arte clicável
function placa(cfg, id, rotulo, larg, altura, padrao, x, y, z, ry, esp) {
  const m = box('sup-' + id, larg, altura, esp || 0.02, supMat(cfg, id, rotulo, larg * 100, altura * 100, padrao), x, y, z, ry);
  m.userData.sup = id;
  return m;
}

function cil(nome, r1, r2, h, material, x, y, z) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, 40), material);
  m.name = nome; m.position.set(x, y, z);
  return m;
}

// ---------------------------------------------------------------- octanorm
function paredeOcta(cfg, g, nome, rotulo, comprimento, x, z, ry, padraoDe) {
  const PERFIL = 0.045, T = 0.03;
  const grupo = new THREE.Group(); grupo.name = nome;
  const n = Math.max(1, Math.round(comprimento / (MOD * 2)));
  const larg = comprimento / n;
  const hP = ALT - BANDA;
  for (let i = 0; i < n; i++) {
    const px = -comprimento / 2 + larg * (i + 0.5);
    const id = n > 1 ? nome + '-' + (i + 1) : nome;
    const rot = n > 1 ? rotulo + ' · painel ' + (i + 1) : rotulo;
    grupo.add(placa(cfg, id, rot, larg - PERFIL * 2, hP - 0.02, padraoDe(i, n), px, hP / 2, T / 2 + 0.005, 0));
    grupo.add(box(nome + '-verso-' + i, larg - PERFIL * 2, hP, T, painelBranco(), px, hP / 2, 0));
    [-larg / 2 + PERFIL / 2, larg / 2 - PERFIL / 2].forEach((ox, k) => {
      grupo.add(box(nome + '-perfil-' + i + '-' + k, PERFIL, hP + PERFIL, PERFIL * 1.4, alu(), px + ox, (hP + PERFIL) / 2, 0));
    });
  }
  grupo.add(box(nome + '-travessa', comprimento, PERFIL, PERFIL * 1.4, alu(), 0, hP + PERFIL / 2, 0));
  grupo.position.set(x, 0, z); grupo.rotation.y = ry || 0;
  g.add(grupo);
}

function testeiraOcta(cfg, g, id, rotulo, comprimento, x, z, ry, comMarca) {
  const grupo = new THREE.Group(); grupo.name = id;
  grupo.add(placa(cfg, id, rotulo, comprimento - 0.02, BANDA, { tipo: 'testeira', fundo: 'gradiente', marca: comMarca !== false }, 0, 0, 0.035, 0));
  grupo.add(box(id + '-caixa', comprimento, BANDA, 0.06, painelBranco(), 0, 0, 0));
  [-1, 1].forEach((s, i) => grupo.add(box(id + '-borda-' + i, comprimento, 0.045, 0.14, alu(), 0, s * (BANDA / 2 + 0.022), 0)));
  grupo.position.set(x, ALT - BANDA / 2 - 0.045, z); grupo.rotation.y = ry || 0;
  g.add(grupo);
}

// ---------------------------------------------------------------- mobiliário
function balcaoReto(cfg, id, x, z, ry, tampoMat) {
  const g = new THREE.Group(); g.name = id;
  const w = 1.1, d = 0.6, h = 0.98;
  g.add(box(id + '-corpo', w, h, d, painelBranco(), 0, h / 2, 0));
  g.add(placa(cfg, id, 'Balcão de atendimento', w - 0.08, h - 0.14, { tipo: 'balcao', fundo: 'roxo' }, 0, h / 2 - 0.02, d / 2 + 0.012, 0));
  g.add(box(id + '-tampo', w + 0.08, 0.06, d + 0.08, tampoMat || tampo(), 0, h + 0.03, 0));
  g.add(box(id + '-rodape', w - 0.04, 0.06, d - 0.04, alu(), 0, 0.03, 0));
  g.position.set(x, 0, z); g.rotation.y = ry || 0;
  return g;
}

// balcão em V dos renders: duas faces anguladas
function balcaoV(cfg, x, z) {
  const g = new THREE.Group(); g.name = 'balcao-recepcao';
  const h = 1.08, d = 0.75, w = 1.5;
  [-1, 1].forEach((s, i) => {
    const face = new THREE.Group();
    face.add(box('balcao-corpo-' + i, w, h, d, painelBranco(), 0, h / 2, 0));
    face.add(placa(cfg, 'balcao-' + (s < 0 ? 'esq' : 'dir'), 'Balcão · face ' + (s < 0 ? 'esquerda' : 'direita'),
      w - 0.1, h - 0.16, { tipo: 'balcao', fundo: i ? 'claro' : 'roxo' }, 0, h / 2 - 0.02, d / 2 + 0.012, 0));
    face.add(box('balcao-tampo-' + i, w + 0.08, 0.06, d + 0.06, tampo(), 0, h + 0.03, 0));
    face.rotation.y = s * 0.28;
    face.position.x = s * w * 0.47;
    g.add(face);
  });
  g.position.set(x, 0, z);
  return g;
}

function tv(x, y, z, ry, pol) {
  const g = new THREE.Group(); g.name = 'tv';
  const larg = (pol || 55) * 0.0254 * 0.87, alt = larg * 0.5625;
  g.add(box('tv-corpo', larg + 0.06, alt + 0.06, 0.06, moldura(), 0, 0, 0));
  g.add(box('tv-painel', larg, alt, 0.01, tela(), 0, 0, 0.036));
  g.position.set(x, y, z); g.rotation.y = ry || 0;
  return g;
}

function mesaReuniao(x, z) {
  const g = new THREE.Group(); g.name = 'mesa-reuniao';
  g.add(cil('mesa-tampo-vidro', 0.55, 0.55, 0.02, vidro(), 0, 0.74, 0));
  g.add(cil('mesa-base', 0.06, 0.06, 0.72, cromado(), 0, 0.37, 0));
  g.add(cil('mesa-pe', 0.3, 0.3, 0.03, cromado(), 0, 0.015, 0));
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const c = new THREE.Group(); c.name = 'cadeira-' + (i + 1);
    c.add(box('cadeira-assento-' + i, 0.46, 0.05, 0.46, cromado(), 0, 0.45, 0));
    c.add(box('cadeira-encosto-' + i, 0.46, 0.42, 0.05, cromado(), 0, 0.68, -0.21));
    [-0.2, 0.2].forEach((ox, k) => [-0.2, 0.2].forEach((oz, j) => {
      c.add(box('cadeira-pe-' + i + k + j, 0.03, 0.45, 0.03, cromado(), ox, 0.225, oz));
    }));
    c.position.set(Math.cos(a) * 0.86, 0, Math.sin(a) * 0.86);
    c.rotation.y = -a + Math.PI / 2;
    g.add(c);
  }
  g.position.set(x, 0, z);
  return g;
}

function mesaAlta(x, z) {
  const g = new THREE.Group(); g.name = 'mesa-alta';
  g.add(cil('mesa-alta-tampo', 0.34, 0.34, 0.04, tampo(), 0, 1.08, 0));
  g.add(cil('mesa-alta-coluna', 0.05, 0.05, 1.06, cromado(), 0, 0.53, 0));
  g.add(cil('mesa-alta-base', 0.3, 0.3, 0.03, cromado(), 0, 0.015, 0));
  [0, 1, 2].forEach((i) => {
    const a = (i / 3) * Math.PI * 2 + 0.6;
    const s = new THREE.Group(); s.name = 'banqueta-' + (i + 1);
    s.add(cil('banqueta-assento-' + i, 0.19, 0.19, 0.09, estofado(), 0, 0.74, 0));
    s.add(cil('banqueta-coluna-' + i, 0.04, 0.04, 0.72, cromado(), 0, 0.36, 0));
    s.add(cil('banqueta-base-' + i, 0.22, 0.22, 0.03, cromado(), 0, 0.015, 0));
    s.position.set(Math.cos(a) * 0.78, 0, Math.sin(a) * 0.78);
    g.add(s);
  });
  g.position.set(x, 0, z);
  return g;
}

function lounge(x, z, ry) {
  const g = new THREE.Group(); g.name = 'lounge';
  g.add(box('sofa-assento', 1.7, 0.36, 0.8, estofado(), 0, 0.26, 0));
  g.add(box('sofa-encosto', 1.7, 0.5, 0.16, estofado(), 0, 0.62, -0.32));
  [-1, 1].forEach((s, i) => g.add(box('sofa-braco-' + i, 0.14, 0.52, 0.8, estofado(), s * 0.78, 0.3, 0)));
  [-0.45, 0.45].forEach((px, i) => g.add(cil('puff-' + (i + 1), 0.24, 0.24, 0.44, tampo(), px, 0.22, 0.95)));
  g.position.set(x, 0, z); g.rotation.y = ry || 0;
  return g;
}

// arquibancada acolchoada dos renders
function arquibancada(x, z, ry) {
  const g = new THREE.Group(); g.name = 'arquibancada';
  for (let i = 0; i < 3; i++) {
    g.add(box('degrau-' + (i + 1), 2.2, 0.14, 0.5 - i * 0.02, estofado(), 0, 0.07 + i * 0.14, -i * 0.46));
  }
  [-0.6, 0.15, 0.9].forEach((px, i) => g.add(box('puff-cubo-' + (i + 1), 0.45, 0.42, 0.45, tampo(), px, 0.21, 0.75)));
  g.position.set(x, 0, z); g.rotation.y = ry || 0;
  return g;
}

function spot(x, z, y) {
  const g = new THREE.Group(); g.name = 'spot';
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.16, 20), alu());
  b.name = 'spot-corpo'; b.rotation.x = Math.PI / 2.6; g.add(b);
  g.add(box('spot-haste', 0.03, 0.14, 0.03, alu(), 0, 0.09, 0));
  g.position.set(x, y, z);
  return g;
}

// ---------------------------------------------------------------- tipologias
function shellOctanorm(cfg, g) {
  const W = cfg.largura, D = cfg.profundidade, T = 0.03;
  if (!cfg.ilha) {
    paredeOcta(cfg, g, 'fundo', 'Parede de fundo', W, 0, -D / 2 + T, 0, (i, n) => {
      if (n === 1 || i === 0) return { tipo: 'frase', fundo: 'claro' };
      if (i === n - 1) return { tipo: 'produtos', fundo: 'claro' };
      return { tipo: 'marca', fundo: 'gradiente' };
    });
    [-1, 1].forEach((s) => paredeOcta(cfg, g, 'lateral-' + (s < 0 ? 'esq' : 'dir'),
      'Parede lateral ' + (s < 0 ? 'esquerda' : 'direita'), D, s * (W / 2 - T), 0, s * Math.PI / 2,
      () => ({ tipo: 'cor', cor: '#F4F5F9' })));
    if (cfg.testeira) {
      testeiraOcta(cfg, g, 'testeira', 'Testeira frontal', W, 0, D / 2 - 0.05, 0, true);
      if (D > 2.4) [-1, 1].forEach((s) => testeiraOcta(cfg, g, 'testeira-lateral-' + (s < 0 ? 'esq' : 'dir'),
        'Testeira lateral ' + (s < 0 ? 'esquerda' : 'direita'), D * 0.5, s * (W / 2 - 0.06), D * 0.25, s * Math.PI / 2, false));
    }
  } else {
    const nw = Math.min(W * 0.42, 3.68), nd = Math.min(D * 0.3, 1.84);
    paredeOcta(cfg, g, 'nucleo-a', 'Núcleo · face A', nw, 0, -nd / 2, Math.PI, () => ({ tipo: 'frase', fundo: 'claro' }));
    paredeOcta(cfg, g, 'nucleo-b', 'Núcleo · face B', nw, 0, nd / 2, 0, () => ({ tipo: 'produtos', fundo: 'claro' }));
    if (cfg.testeira) {
      testeiraOcta(cfg, g, 'testeira-a', 'Testeira · face A', nw, 0, -nd / 2 - 0.08, Math.PI, true);
      testeiraOcta(cfg, g, 'testeira-b', 'Testeira · face B', nw, 0, nd / 2 + 0.08, 0, true);
    }
  }
  if (cfg.spots && !cfg.ilha) {
    const n = Math.max(2, Math.round(W / 1.6));
    for (let i = 0; i < n; i++) g.add(spot(-W / 2 + (W / n) * (i + 0.5), -D / 2 + 0.35, ALT - BANDA - 0.12));
  }
}

// Mockup 1: parede única em marcenaria, moldura branca e balcão na frente
function shellMarcenaria(cfg, g) {
  const W = cfg.largura, D = cfg.profundidade;
  const larg = Math.min(W - 0.2, 3.6), h = Math.min(ALT, 2.9), mold = 0.22;
  const grupo = new THREE.Group(); grupo.name = 'parede-marcenaria';
  grupo.add(box('moldura-corpo', larg, h, 0.4, painelBranco(), 0, h / 2, 0));
  grupo.add(placa(cfg, 'fundo', 'Parede de fundo', larg - mold * 2, h - mold * 2,
    { tipo: 'frase', fundo: 'claro' }, 0, h / 2, 0.205, 0));
  [-1, 1].forEach((s, i) => grupo.add(box('moldura-lat-' + i, mold, h, 0.42, painelBranco(), s * (larg / 2 - mold / 2), h / 2, 0.01)));
  grupo.add(box('moldura-topo', larg, mold, 0.42, painelBranco(), 0, h - mold / 2, 0.01));
  grupo.add(box('moldura-base', larg, mold * 0.6, 0.42, painelBranco(), 0, mold * 0.3, 0.01));
  grupo.position.set(0, 0, -D / 2 + 0.25);
  g.add(grupo);
  const nSpots = Math.max(2, Math.round(larg / 1.2));
  for (let i = 0; i < nSpots; i++) g.add(spot(-larg / 2 + (larg / nSpots) * (i + 0.5), -D / 2 + 0.52, h - mold - 0.08));
  if (cfg.balcao) g.add(balcaoReto(cfg, 'balcao', -W / 2 + 0.85, D / 2 - 0.75, 0, granito()));
  if (cfg.mesaReuniao) g.add(mesaReuniao(W * 0.14, D * 0.04));
}

// Mockups 2–4: caixa fechada com testeira envolvente, painel retroiluminado e banda de dados
function shellBox(cfg, g) {
  const W = cfg.largura, D = cfg.profundidade;
  const corEst = CORES[cfg.corEstrutura] || CORES['azul-royal'];
  const est = corSolida(corEst);
  const t = 0.18;              // espessura das paredes
  const hP = ALT - BANDA;      // altura livre sob a testeira

  // paredes estruturais: fundo + lateral esquerda (frente e lateral direita abertas)
  g.add(box('estrutura-fundo', W, ALT, t, est, 0, ALT / 2, -D / 2 + t / 2));
  g.add(box('estrutura-lateral', t, ALT, D, est, -W / 2 + t / 2, ALT / 2, 0));
  // faces internas clicáveis
  g.add(placa(cfg, 'fundo', 'Parede de fundo', W - t * 2.2, hP - 0.1, { tipo: 'cor', cor: corEst }, 0, hP / 2, -D / 2 + t + 0.011, 0));
  g.add(placa(cfg, 'lateral-esq', 'Parede lateral esquerda', D - t * 2.2, hP - 0.1, { tipo: 'cor', cor: corEst }, -W / 2 + t + 0.011, hP / 2, 0, Math.PI / 2));
  // testeira envolvente em L
  g.add(box('testeira-caixa-frontal', W, BANDA, t * 1.6, est, 0, ALT - BANDA / 2, D / 2 - t * 0.8));
  g.add(box('testeira-caixa-lateral', t * 1.6, BANDA, D, est, -W / 2 + t * 0.8, ALT - BANDA / 2, 0));
  g.add(placa(cfg, 'testeira', 'Testeira frontal', W * 0.86, BANDA * 0.62,
    { tipo: 'testeira', fundo: 'royal' }, 0, ALT - BANDA / 2, D / 2 + t * 0.06, 0));
  g.add(placa(cfg, 'testeira-lateral', 'Testeira lateral', D * 0.6, BANDA * 0.62,
    { tipo: 'testeira', fundo: 'royal', marca: true }, -W / 2 + t * 0.02, ALT - BANDA / 2, 0, -Math.PI / 2));
  // forro + LED na aresta interna da testeira
  g.add(box('forro', W - t, 0.08, D - t, corSolida('#F4F5F9'), 0, ALT - BANDA - 0.04, 0));
  g.add(box('led-frontal', W - t, 0.05, 0.05, led(), 0, ALT - BANDA - 0.02, D / 2 - t));
  g.add(box('led-lateral', 0.05, 0.05, D - t, led(), -W / 2 + t, ALT - BANDA - 0.02, 0));
  // ripado do forro
  const nRip = Math.max(4, Math.round((W - t) / 0.32));
  for (let i = 0; i < nRip; i++) {
    g.add(box('ripa-' + (i + 1), 0.1, 0.1, Math.min(D * 0.36, 1.5), corSolida('#F4F5F9'),
      -W / 2 + t + ((W - t * 2) / nRip) * (i + 0.5), ALT - BANDA - 0.16, -D / 2 + Math.min(D * 0.36, 1.5) / 2 + t));
  }
  // painel retroiluminado vertical, canto esquerdo do fundo
  const pv = Math.min(1.3, W * 0.28), ph = Math.min(hP * 0.78, 2.4);
  g.add(box('painel-vertical-caixa', pv + 0.1, ph + 0.1, 0.1, corSolida('#FFFFFF'), -W / 2 + pv / 2 + 0.5, hP * 0.52, -D / 2 + t + 0.05));
  g.add(placa(cfg, 'painel-vertical', 'Painel retroiluminado', pv, ph,
    { tipo: 'imagem', img: 'softpoint-cascata', frase: cfg.frase || TAGLINES[5] },
    -W / 2 + pv / 2 + 0.5, hP * 0.52, -D / 2 + t + 0.105, 0));
  // banda de dados no alto do fundo
  const bw = W - (pv + 1.1), bh = Math.min(0.95, hP * 0.3);
  const bx = W / 2 - bw / 2 - 0.4;
  g.add(box('banda-caixa', bw + 0.12, bh + 0.12, 0.1, corSolida('#FFFFFF'), bx, hP - bh / 2 - 0.22, -D / 2 + t + 0.05));
  g.add(placa(cfg, 'banda-dados', 'Banda de cases e números', bw, bh,
    { tipo: 'dados', fundo: 'azul' }, bx, hP - bh / 2 - 0.22, -D / 2 + t + 0.105, 0));
  // mobiliário fixo da tipologia
  if (cfg.balcao) g.add(balcaoV(cfg, W / 2 - 1.5, D / 2 - 1.5));
  if (cfg.lounge) g.add(arquibancada(-W / 2 + 1.6, -D / 2 + 1.5, 0));
  if (cfg.mesaAlta) g.add(mesaAlta(-W * 0.02, D * 0.12));
  if (cfg.totens) {
    [-0.55, 0.55].forEach((s, i) => {
      const tw = 0.62, th = Math.min(1.7, hP * 0.62);
      const x = W * 0.08 + s * 0.75;
      g.add(box('totem-caixa-' + i, tw + 0.06, th + 0.06, 0.12, corSolida('#FFFFFF'), x, th / 2 + 0.55, -D * 0.06));
      g.add(placa(cfg, 'totem-' + (i + 1), 'Totem ' + (i + 1), tw, th,
        { tipo: 'imagem', img: 'gradiente-' + (i + 1), frase: i ? 'Softplan chega à Argentina' : 'Presença em 15 estados' },
        x, th / 2 + 0.55, -D * 0.06 + 0.065, 0));
    });
  }
  if (cfg.spots) {
    const n = Math.max(3, Math.round(W / 1.2));
    for (let i = 0; i < n; i++) g.add(spot(-W / 2 + (W / n) * (i + 0.5), -D / 2 + 0.55, hP - 0.1));
  }
}

// Pórtico: dois pilares altos, viga de marca vazada e parede de fundo cheia
function shellPortico(cfg, g) {
  const W = cfg.largura, D = cfg.profundidade;
  const corEst = CORES[cfg.corEstrutura] || CORES['azul-80'];
  const est = corSolida(corEst);
  const pil = Math.min(0.55, W * 0.09), vig = BANDA, hP = ALT - vig;

  // parede de fundo inteira, arte em três faixas verticais
  const pw = W - pil * 2;
  g.add(box('fundo-caixa', pw, hP, 0.16, corSolida('#F4F5F9'), 0, hP / 2, -D / 2 + 0.08));
  const faixas = [
    ['fundo-1', 'Fundo · faixa esquerda', { tipo: 'imagem', img: 'cidades', frase: cfg.frase || TAGLINES[2] }, 0.42],
    ['fundo-2', 'Fundo · faixa central', { tipo: 'frase', fundo: 'claro' }, 0.34],
    ['fundo-3', 'Fundo · faixa direita', { tipo: 'marca', fundo: 'roxo' }, 0.24],
  ];
  let cx = -pw / 2;
  faixas.forEach(([id, rot, padrao, frac]) => {
    const larg = pw * frac;
    g.add(placa(cfg, id, rot, larg - 0.04, hP - 0.12, padrao, cx + larg / 2, hP / 2, -D / 2 + 0.165, 0));
    cx += larg;
  });

  // pilares e viga
  [-1, 1].forEach((s, i) => {
    g.add(box('pilar-' + i, pil, ALT, pil * 1.6, est, s * (W / 2 - pil / 2), ALT / 2, D / 2 - pil * 0.8));
    g.add(box('pilar-fundo-' + i, pil, ALT, pil * 1.6, est, s * (W / 2 - pil / 2), ALT / 2, -D / 2 + pil * 0.8));
    g.add(box('longarina-' + i, pil * 0.5, pil * 0.6, D - pil * 1.6, est, s * (W / 2 - pil / 2), ALT - pil * 0.4, 0));
  });
  g.add(box('viga', W, vig, pil * 1.6, est, 0, ALT - vig / 2, D / 2 - pil * 0.8));
  g.add(placa(cfg, 'testeira', 'Viga frontal', W - pil * 2.4, vig * 0.6,
    { tipo: 'testeira', fundo: 'royal' }, 0, ALT - vig / 2, D / 2 - pil * 0.8 + pil * 0.82, 0));
  g.add(box('viga-fundo', W, vig, pil * 1.2, est, 0, ALT - vig / 2, -D / 2 + pil * 0.6));
  g.add(box('led-viga', W - pil * 2, 0.05, 0.05, led(), 0, ALT - vig - 0.04, D / 2 - pil * 1.5));

  if (cfg.balcao) g.add(balcaoV(cfg, W / 2 - 1.6, D / 2 - 1.4));
  if (cfg.mesaAlta) g.add(mesaAlta(-W * 0.18, D * 0.1));
  if (cfg.lounge) g.add(lounge(W / 2 - 1.4, -D / 2 + 1.5, Math.PI));
  if (cfg.spots) {
    const n = Math.max(3, Math.round(W / 1.3));
    for (let i = 0; i < n; i++) g.add(spot(-W / 2 + (W / n) * (i + 0.5), -D / 2 + 0.6, hP - 0.1));
  }
}

// Pergolado: lounge aberto, forro ripado suspenso e parede baixa em L
function shellPergolado(cfg, g) {
  const W = cfg.largura, D = cfg.profundidade;
  const corEst = CORES[cfg.corEstrutura] || CORES['roxo-80'];
  const col = 0.14, hMur = Math.min(1.5, ALT * 0.45);

  // mureta de fundo com arte e mureta lateral menor
  g.add(box('mureta-fundo', W, hMur, 0.16, corSolida('#F4F5F9'), 0, hMur / 2, -D / 2 + 0.08));
  g.add(placa(cfg, 'fundo', 'Mureta de fundo', W - 0.2, hMur - 0.14,
    { tipo: 'frase', fundo: 'gradiente' }, 0, hMur / 2, -D / 2 + 0.165, 0));
  g.add(box('mureta-lateral', 0.16, hMur, D * 0.5, corSolida('#F4F5F9'), -W / 2 + 0.08, hMur / 2, -D * 0.2));
  g.add(placa(cfg, 'lateral-esq', 'Mureta lateral', D * 0.5 - 0.2, hMur - 0.14,
    { tipo: 'marca', fundo: 'roxo' }, -W / 2 + 0.165, hMur / 2, -D * 0.2, Math.PI / 2));

  // painel-bandeira suspenso, dupla face
  const bw = Math.min(2.6, W * 0.42), bh = Math.min(1.5, ALT - hMur - 0.6);
  const by = ALT - bh / 2 - 0.25;
  g.add(box('bandeira-caixa', bw + 0.1, bh + 0.1, 0.16, corSolida(corEst), W * 0.16, by, -D * 0.1));
  g.add(placa(cfg, 'bandeira-frente', 'Painel suspenso · frente', bw, bh,
    { tipo: 'marca', fundo: 'roxo' }, W * 0.16, by, -D * 0.1 + 0.085, 0));
  g.add(placa(cfg, 'bandeira-fundo', 'Painel suspenso · verso', bw, bh,
    { tipo: 'imagem', img: 'softpoint-duo' }, W * 0.16, by, -D * 0.1 - 0.085, Math.PI));

  // pergolado: quatro colunas + ripado
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz], i) => {
    g.add(box('coluna-' + i, col, ALT, col, corSolida(corEst),
      sx * (W / 2 - 0.35), ALT / 2, sz * (D / 2 - 0.35)));
  });
  const nRip = Math.max(6, Math.round((D - 0.7) / 0.34));
  for (let i = 0; i < nRip; i++) {
    g.add(box('ripa-' + (i + 1), W - 0.7, 0.07, 0.09, corSolida('#F4F5F9'),
      0, ALT - 0.07, -D / 2 + 0.35 + ((D - 0.7) / nRip) * (i + 0.5)));
  }
  [-1, 1].forEach((s, i) => g.add(box('travessa-' + i, 0.09, 0.1, D - 0.7, corSolida(corEst), s * (W / 2 - 0.35), ALT - 0.17, 0)));

  if (cfg.balcao) g.add(balcaoReto(cfg, 'balcao', -W / 2 + 1.0, D / 2 - 0.9, 0, granito()));
  if (cfg.lounge) g.add(lounge(W * 0.12, D * 0.16, Math.PI * 0.85));
  if (cfg.mesaAlta) g.add(mesaAlta(-W * 0.24, -D * 0.12));
  if (cfg.mesaReuniao) g.add(mesaReuniao(W * 0.24, -D * 0.16));
  if (cfg.spots) {
    const n = Math.max(2, Math.round(W / 1.8));
    for (let i = 0; i < n; i++) g.add(spot(-W / 2 + (W / n) * (i + 0.5), -D / 2 + 0.5, ALT - 0.22));
  }
}

// Quiosque: torre central de quatro faces, para 2×2 e 3×3
function shellQuiosque(cfg, g) {
  const W = cfg.largura, D = cfg.profundidade;
  const corEst = CORES[cfg.corEstrutura] || CORES['azul-royal'];
  const lado = Math.min(W, D) * 0.46, hT = ALT - BANDA;

  g.add(box('torre-corpo', lado, hT, lado, corSolida('#F4F5F9'), 0, hT / 2, 0));
  const faces = [
    ['face-frente', 'Torre · face frontal', { tipo: 'frase', fundo: 'claro' }, 0, lado / 2 + 0.011, 0],
    ['face-dir', 'Torre · face direita', { tipo: 'produtos', fundo: 'claro' }, lado / 2 + 0.011, 0, Math.PI / 2],
    ['face-fundo', 'Torre · face de fundo', { tipo: 'imagem', img: 'softpoint-cascata' }, 0, -lado / 2 - 0.011, Math.PI],
    ['face-esq', 'Torre · face esquerda', { tipo: 'marca', fundo: 'azul' }, -lado / 2 - 0.011, 0, -Math.PI / 2],
  ];
  faces.forEach(([id, rot, padrao, x, z, ry]) => {
    g.add(placa(cfg, id, rot, lado - 0.08, hT - 0.12, padrao, x, hT / 2, z, ry));
  });

  // coroa de testeira nos quatro lados
  const cw = lado + 0.5;
  g.add(box('coroa-corpo', cw, BANDA, cw, corSolida(corEst), 0, ALT - BANDA / 2, 0));
  [[0, 1, 0], [1, 0, Math.PI / 2], [0, -1, Math.PI], [-1, 0, -Math.PI / 2]].forEach(([sx, sz, ry], i) => {
    g.add(placa(cfg, 'testeira-' + (i + 1), 'Testeira · lado ' + (i + 1), cw - 0.2, BANDA * 0.58,
      { tipo: 'testeira', fundo: 'royal' }, sx * (cw / 2 + 0.011), ALT - BANDA / 2, sz * (cw / 2 + 0.011), ry));
  });
  g.add(box('led-coroa', cw + 0.04, 0.05, cw + 0.04, led(), 0, ALT - BANDA - 0.03, 0));

  if (cfg.balcao) g.add(balcaoReto(cfg, 'balcao', 0, Math.min(lado / 2 + 0.85, D / 2 - 0.38), 0, granito()));
  if (cfg.mesaAlta && W * D >= 9) g.add(mesaAlta(-W / 2 + 1.05, -D / 2 + 1.05));
  if (cfg.spots) [-1, 1].forEach((s) => g.add(spot(s * (lado * 0.3), lado / 2 + 0.22, ALT - BANDA - 0.06)));
}


// ---------------------------------------------------------------- arcos
function arcoU(w, h, t) {
  const s = new THREE.Shape();
  const R = w / 2, r = R - t, cy = h - R;
  s.moveTo(-R, 0); s.lineTo(-R, cy);
  s.absarc(0, cy, R, Math.PI, 0, true);
  s.lineTo(R, 0); s.lineTo(r, 0); s.lineTo(r, cy);
  s.absarc(0, cy, r, 0, Math.PI, false);
  s.lineTo(-r, 0); s.closePath();
  return s;
}
function extr(nome, shape, prof, material) {
  const geo = new THREE.ExtrudeGeometry(shape, { depth: prof, bevelEnabled: false, curveSegments: 40 });
  geo.translate(0, 0, -prof / 2);
  const m = new THREE.Mesh(geo, material); m.name = nome;
  return m;
}
function placaArco(cfg, id, rotulo, w, h, padrao) {
  const s = new THREE.Shape();
  const R = w / 2, cy = h - R;
  s.moveTo(-R, 0); s.lineTo(-R, cy); s.absarc(0, cy, R, Math.PI, 0, true); s.lineTo(R, 0); s.closePath();
  const geo = new THREE.ShapeGeometry(s, 40);
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + R) / w, pos.getY(i) / h);
  const m = new THREE.Mesh(geo, supMat(cfg, id, rotulo, w * 100, h * 100, padrao));
  m.name = 'sup-' + id; m.userData.sup = id;
  return m;
}
// arco com moldura e fios de LED nas bordas interna e externa
function arco(nome, w, h, t, prof, material) {
  const g = new THREE.Group(); g.name = nome;
  g.add(extr(nome + '-moldura', arcoU(w, h, t), prof, material));
  const r = w / 2 - t;
  const ledI = extr(nome + '-led-interno', arcoU(2 * (r + 0.02), h - t + 0.02, 0.05), 0.02, ledClaro());
  ledI.position.z = prof / 2 + 0.01; g.add(ledI);
  const ledE = extr(nome + '-led-externo', arcoU(w + 0.04, h + 0.02, 0.05), 0.02, ledClaro());
  ledE.position.z = prof / 2 + 0.01; g.add(ledE);
  return g;
}

function planta(nome, x, z, esc, vasoMat) {
  const g = new THREE.Group(); g.name = nome;
  const k = esc || 1;
  g.add(cil(nome + '-vaso', 0.26 * k, 0.21 * k, 0.5 * k, vasoMat || tampo(), 0, 0.25 * k, 0));
  const folhas = [[0, 1.05, 0, 0.42], [0.22, 0.85, 0.1, 0.34], [-0.2, 0.9, -0.08, 0.36], [0.05, 0.78, -0.24, 0.3], [-0.08, 1.3, 0.1, 0.3]];
  folhas.forEach(([fx, fy, fz, fr], i) => {
    const f = new THREE.Mesh(new THREE.SphereGeometry(fr * k, 16, 12), i % 2 ? folhagemEsc() : folhagem());
    f.name = nome + '-folhagem-' + (i + 1);
    f.scale.set(1, 1.35, 0.8);
    f.position.set(fx * k, fy * k, fz * k);
    g.add(f);
  });
  g.position.set(x, 0, z);
  return g;
}

function jardimSuspenso(x, z, teto, pendentes) {
  const g = new THREE.Group(); g.name = 'jardim-suspenso';
  const y = teto - 0.55;
  g.add(cil('jardim-anel', 0.95, 0.95, 0.16, tampo(), 0, y, 0));
  g.add(cil('jardim-folhagem', 0.88, 0.7, 0.5, folhagem(), 0, y - 0.32, 0));
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.02, 0.55 + (i % 3) * 0.18, 8), folhagemEsc());
    p.name = 'jardim-pendente-' + (i + 1);
    p.position.set(Math.cos(a) * 0.78, y - 0.6 - (i % 3) * 0.09, Math.sin(a) * 0.78);
    g.add(p);
  }
  [-0.6, 0.6].forEach((ox, i) => g.add(cil('jardim-cabo-' + i, 0.008, 0.008, 0.5, cromado(), ox, teto - 0.25, 0)));
  if (pendentes) {
    [[1.25, -1.1, 0.2], [1.55, -1.45, -0.25], [-1.3, -1.25, 0.3]].forEach(([ox, oy, oz], i) => {
      g.add(cil('pendente-cabo-' + i, 0.006, 0.006, -oy, cromado(), ox, teto + oy / 2, oz));
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 16), globo());
      b.name = 'pendente-globo-' + (i + 1); b.position.set(ox, teto + oy - 0.17, oz);
      g.add(b);
    });
  }
  g.position.set(x, 0, z);
  return g;
}

function totemDigital(cfg, id, rotulo, x, z, ry, padrao) {
  const g = new THREE.Group(); g.name = id;
  const w = 0.8, h = 1.95, base = 0.22;
  g.add(box(id + '-corpo', w + 0.06, h + 0.06, 0.14, moldura(), 0, base + h / 2, 0));
  g.add(placa(cfg, id, rotulo, w, h, padrao, 0, base + h / 2, 0.071, 0));
  g.add(placa(cfg, id + '-verso', rotulo + ' · verso', w, h, { tipo: 'marca', fundo: 'azul' }, 0, base + h / 2, -0.071, Math.PI));
  g.add(box(id + '-pe', 0.3, base, 0.3, moldura(), 0, base / 2, 0));
  g.position.set(x, 0, z); g.rotation.y = ry || 0;
  return g;
}

// Esquina com arcos: testeira azul em quatro lados, arco de entrada com LED,
// arco holográfico na quina, totens digitais, jardim suspenso e plantas
function shellArcos(cfg, g) {
  const W = cfg.largura, D = cfg.profundidade;
  const corEst = CORES[cfg.corEstrutura] || CORES['azul-royal'];
  const est = corSolida(corEst);
  const t = 0.3, hP = ALT - BANDA;

  // testeira nos quatro lados
  g.add(box('banda-frente', W, BANDA, t, est, 0, ALT - BANDA / 2, D / 2 - t / 2));
  g.add(box('banda-fundo', W, BANDA, t, est, 0, ALT - BANDA / 2, -D / 2 + t / 2));
  g.add(box('banda-dir', t, BANDA, D, est, W / 2 - t / 2, ALT - BANDA / 2, 0));
  g.add(box('banda-esq', t, BANDA, D, est, -W / 2 + t / 2, ALT - BANDA / 2, 0));
  if (cfg.testeira !== false) {
    g.add(placa(cfg, 'testeira', 'Testeira frontal', W - 0.3, BANDA - 0.14,
      { tipo: 'testeira', fundo: 'royal', frase: 'Pessoas, processos e tecnologia para um Brasil mais eficiente.' },
      0, ALT - BANDA / 2, D / 2 + 0.011, 0));
    g.add(placa(cfg, 'testeira-lateral', 'Testeira lateral', D - 0.3, BANDA - 0.14,
      { tipo: 'testeira', fundo: 'royal', frase: 'Tecnologia que impulsiona o hoje e o amanhã.' },
      W / 2 + 0.011, ALT - BANDA / 2, 0, Math.PI / 2));
  }
  g.add(box('forro', W - t * 2, 0.06, D - t * 2, corSolida('#F4F5F9'), 0, hP + 0.03, 0));
  g.add(box('led-banda-frente', W - t * 2, 0.04, 0.04, ledClaro(), 0, hP - 0.02, D / 2 - t));
  g.add(box('led-banda-dir', 0.04, 0.04, D - t * 2, ledClaro(), W / 2 - t, hP - 0.02, 0));

  // colunas nas quinas
  [[-1, 1], [-1, -1], [1, -1], [1, 1]].forEach(([sx, sz], i) => {
    if (i === 3 && cfg.holograma) return; // o arco holográfico é a quina
    g.add(box('coluna-' + i, t, hP, t, est, sx * (W / 2 - t / 2), hP / 2, sz * (D / 2 - t / 2)));
  });

  // paredes: fundo, lateral esquerda e lateral direita parcial com lista
  g.add(box('parede-fundo', W - t * 2, hP, 0.16, corSolida('#F4F5F9'), 0, hP / 2, -D / 2 + t / 2));
  g.add(placa(cfg, 'fundo', 'Parede de fundo', W - t * 2 - 0.1, hP - 0.1,
    { tipo: 'frase', fundo: 'claro' }, 0, hP / 2, -D / 2 + t / 2 + 0.091, 0));
  g.add(box('parede-esq', 0.16, hP, D - t * 2, corSolida('#F4F5F9'), -W / 2 + t / 2, hP / 2, 0));
  g.add(placa(cfg, 'lateral-esq', 'Parede lateral esquerda', D - t * 2 - 0.1, hP - 0.1,
    { tipo: 'marca', fundo: 'azul' }, -W / 2 + t / 2 + 0.091, hP / 2, 0, Math.PI / 2));
  const L = D - 1.8;
  g.add(box('parede-dir', 0.16, hP, L, corSolida('#FFFFFF'), W / 2 - t / 2, hP / 2, -D / 2 + t + L / 2 - t / 2));
  g.add(placa(cfg, 'lateral-dir', 'Parede lateral direita', L - 0.2, hP - 0.1,
    { tipo: 'lista', fundo: 'claro' }, W / 2 - t / 2 + 0.091, hP / 2, -D / 2 + t + L / 2 - t / 2, Math.PI / 2));

  // arco de entrada na frente + arco-nicho no fundo
  const ax = -W * 0.12;
  const aw = Math.min(1.9, W * 0.3), ah = hP - 0.05;
  const entrada = arco('arco-entrada', aw, ah, 0.22, 0.4, est);
  entrada.position.set(ax, 0, D / 2 - 0.35);
  g.add(entrada);
  const nicho = arco('arco-nicho', aw + 0.3, ah - 0.35, 0.18, 0.2, corSolida('#FFFFFF'));
  nicho.position.set(ax, 0, -D / 2 + t + 0.2);
  g.add(nicho);
  const niM = placaArco(cfg, 'nicho', 'Nicho do fundo', aw + 0.3 - 0.36, ah - 0.35 - 0.18, { tipo: 'imagem', img: 'gradiente-1' });
  niM.position.set(ax, 0, -D / 2 + t + 0.105);
  g.add(niM);

  // ripado branco à direita do arco
  for (let i = 0; i < 5; i++) {
    g.add(box('ripa-' + (i + 1), 0.07, hP, 0.07, corSolida('#FFFFFF'), ax + aw / 2 + 0.2 + i * 0.17, hP / 2, D / 2 - 0.3));
  }

  // arco holográfico na quina frente-direita
  if (cfg.holograma) {
    const hw = 1.15, hh = hP + 0.02;
    const hg = new THREE.Group(); hg.name = 'arco-holografico';
    const fr = arco('holo-moldura', hw, hh, 0.12, 0.3, est);
    hg.add(fr);
    const tela = placaArco(cfg, 'holograma', 'Arco holográfico', hw - 0.24, hh - 0.12,
      { tipo: 'tela', fundo: 'azul', img: 'cidadaos' });
    tela.position.z = 0.02;
    hg.add(tela);
    const anel = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.025, 12, 48), ledClaro());
    anel.name = 'holo-anel'; anel.rotation.x = -Math.PI / 2; anel.position.set(0, 0.03, 0.42);
    hg.add(anel);
    hg.position.set(W / 2 - 0.4, 0, D / 2 - 0.4);
    hg.rotation.y = Math.PI / 4;
    g.add(hg);
  }

  // totens digitais
  if (cfg.totens) {
    g.add(totemDigital(cfg, 'totem-1', 'Totem digital 1', -W / 2 + 0.85, D / 2 - 0.55, 0.12,
      { tipo: 'tela', fundo: 'azul', frase: 'Tecnologia que impulsiona o hoje e o amanhã.' }));
    if (W >= 7) g.add(totemDigital(cfg, 'totem-2', 'Totem digital 2', W / 2 - 1.95, D / 2 - 0.6, -0.12,
      { tipo: 'tela', fundo: 'azul', frase: cfg.frase || TAGLINES[1] }));
  }

  if (cfg.jardim) g.add(jardimSuspenso(W * 0.1, -D * 0.04, hP, true));
  if (cfg.plantas) {
    g.add(planta('planta-1', -W / 2 + 0.55, D / 2 - 1.45, 1));
    g.add(planta('planta-2', W / 2 - 0.5, D / 2 - 1.35, 0.95));
    g.add(planta('planta-3', ax + aw / 2 + 1.35, D / 2 - 0.9, 1.1));
    g.add(planta('planta-4', W / 2 - 0.6, -D / 2 + 0.7, 0.9));
  }
  if (cfg.balcao) g.add(balcaoReto(cfg, 'balcao', W * 0.2, -D / 2 + 1.15, 0, tampo()));
  if (cfg.mesaAlta) g.add(mesaAlta(-W * 0.3, -D * 0.12));

  // LED no rodapé dos lados abertos
  g.add(box('led-piso-frente', W, 0.03, 0.04, ledClaro(), 0, 0.015, D / 2 - 0.02));
  g.add(box('led-piso-dir', 0.04, 0.03, D, ledClaro(), W / 2 - 0.02, 0.015, 0));
}


// ---------------------------------------------------------------- estúdio de podcast
function haste(parent, nome, a, b, r, m) {
  const dir = b.clone().sub(a), len = dir.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 12), m);
  mesh.name = nome;
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  parent.add(mesh);
  return mesh;
}
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

function poltrona(nome, x, y, z, tx, tz, lado) {
  const c = new THREE.Group(); c.name = nome;
  c.position.set(x, y, z); c.rotation.y = Math.atan2(tx - x, tz - z);
  [[-0.32, -0.3], [0.32, -0.3], [-0.32, 0.3], [0.32, 0.3]].forEach(([lx, lz], i) =>
    haste(c, nome + '-pe-' + i, V3(lx * 1.12, 0, lz * 1.12), V3(lx, 0.17, lz), 0.018, madeiraEsc()));
  c.add(box(nome + '-base', 0.8, 0.2, 0.76, tecido(), 0, 0.27, 0));
  c.add(box(nome + '-assento', 0.56, 0.12, 0.6, tecido(), 0, 0.43, 0.06));
  const enc = box(nome + '-encosto', 0.8, 0.5, 0.16, tecido(), 0, 0.6, -0.3); enc.rotation.x = -0.12; c.add(enc);
  [-1, 1].forEach((s, i) => {
    c.add(box(nome + '-braco-' + i, 0.12, 0.3, 0.7, tecido(), s * 0.34, 0.5, 0.02));
    const bt = cil(nome + '-braco-topo-' + i, 0.06, 0.06, 0.7, tecido(), s * 0.34, 0.65, 0.02); bt.rotation.x = Math.PI / 2; c.add(bt);
  });
  const al = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 16), mat('almofada-roxo', { color: 0x5c5cff, roughness: 0.9 }));
  al.name = nome + '-almofada'; al.scale.set(1, 0.9, 0.35); al.position.set(0.06 * lado, 0.64, -0.17); al.rotation.set(-0.25, 0, 0.15 * lado);
  c.add(al);
  const px = 0.55 * lado, pz = 0.45;
  for (let i = 0; i < 3; i++) {
    const a = i * 2 * Math.PI / 3;
    haste(c, nome + '-tripe-' + i, V3(px + Math.cos(a) * 0.22, 0, pz + Math.sin(a) * 0.22), V3(px, 0.14, pz), 0.008, preto());
  }
  haste(c, nome + '-pedestal', V3(px, 0.14, pz), V3(px, 1.15, pz), 0.012, preto());
  haste(c, nome + '-braco-mic', V3(px, 1.15, pz), V3(0.1 * lado, 1.1, 0.3), 0.009, preto());
  haste(c, nome + '-mic', V3(0.1 * lado, 1.1, 0.3), V3(0.02 * lado, 1.08, 0.17), 0.026, preto());
  const esp = new THREE.Mesh(new THREE.SphereGeometry(0.042, 24, 16), mat('espuma-mic', { color: 0x222228, roughness: 1 }));
  esp.name = nome + '-espuma'; esp.position.set(0, 1.075, 0.14); c.add(esp);
  return c;
}

// letra-caixa: camadas do logo com face iluminada e halo
let LETRA = null;
function letraCaixa(nome, w, x, y, z, ry) {
  if (!LETRA) {
    const src = tinted('branco', '#FFFFFF');
    if (!src) return new THREE.Group();
    const face = new THREE.CanvasTexture(src); face.colorSpace = THREE.SRGBColorSpace; face.anisotropy = 8;
    const pad = 40, hc = document.createElement('canvas');
    hc.width = src.width + pad * 2; hc.height = src.height + pad * 2;
    const hg = hc.getContext('2d');
    hg.filter = 'blur(14px)'; hg.drawImage(src, pad, pad); hg.drawImage(src, pad, pad);
    hg.filter = 'none'; hg.globalCompositeOperation = 'source-in'; hg.fillStyle = '#E4DCFF'; hg.fillRect(0, 0, hc.width, hc.height);
    const halo = new THREE.CanvasTexture(hc); halo.colorSpace = THREE.SRGBColorSpace;
    LETRA = {
      lado: mat('letra-caixa-lateral', { color: 0xe6e3f2, map: face, alphaTest: 0.5, emissive: 0x9a7cff, emissiveIntensity: 0.35, roughness: 0.4 }),
      face: mat('letra-caixa-face', { color: 0xffffff, map: face, emissive: 0xffffff, emissiveMap: face, emissiveIntensity: 1.5, alphaTest: 0.5 }),
      halo: mat('letra-caixa-halo', { color: 0x9a7cff, map: halo, emissive: 0xb7a4ff, emissiveMap: halo, emissiveIntensity: 1.3, transparent: true, depthWrite: false }),
      sx: hc.width / src.width, sy: hc.height / src.height, ar: src.height / src.width,
    };
  }
  const g = new THREE.Group(); g.name = nome;
  const h = w * LETRA.ar, n = 10, prof = 0.045;
  const geo = new THREE.PlaneGeometry(w, h);
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(geo, i === n - 1 ? LETRA.face : LETRA.lado);
    m.name = nome + (i === n - 1 ? '-face' : '-camada-' + i);
    m.position.z = 0.004 + prof * i / (n - 1); g.add(m);
  }
  const hm = new THREE.Mesh(new THREE.PlaneGeometry(w * LETRA.sx, h * LETRA.sy), LETRA.halo);
  hm.name = nome + '-halo'; hm.position.z = 0.002; g.add(hm);
  g.position.set(x, y, z); g.rotation.y = ry || 0;
  return g;
}

function shellEstudio(cfg, g) {
  const W = cfg.largura, D = cfg.profundidade;
  const X0 = -W / 2, X1 = W / 2, ZB = -D / 2, ZF = D / 2;
  const FH = 0.1, WH = ALT - BANDA;
  const RX1 = X0 + Math.min(2.6, W * 0.43);   // lado direito do estúdio
  const RZF = ZF - 0.55;                        // frente do estúdio (floreira na frente)
  const RF = FH + 0.3;                          // tablado do estúdio
  const bb = (nome, m, x0, x1, y0, y1, z0, z1) => box(nome, x1 - x0, y1 - y0, z1 - z0, m, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);

  // tablado geral + LED nos lados abertos
  g.add(bb('tablado', madeira(), X0, X1, 0, FH, ZB, ZF));
  g.add(bb('led-piso-frente', ledClaro(), RX1, X1, 0.02, 0.05, ZF, ZF + 0.02));
  g.add(bb('led-piso-lateral', ledClaro(), X1, X1 + 0.02, 0.02, 0.05, ZB, ZF));

  // floreira de capim na frente do estúdio
  g.add(bb('floreira', madeira(), X0, RX1 + 0.1, FH, FH + 0.2, RZF + 0.05, ZF));
  g.add(bb('floreira-terra', mat('terra', { color: 0x3a2e24, roughness: 1 }), X0 + 0.04, RX1 + 0.06, FH + 0.2, FH + 0.201, RZF + 0.09, ZF - 0.04));
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const lamina = new THREE.ConeGeometry(0.018, 0.34, 4);
  const nT = Math.round((RX1 - X0) / 0.1);
  for (let i = 0; i < nT; i++) {
    const tufo = new THREE.Group(); tufo.name = 'capim-' + i;
    tufo.position.set(X0 + 0.12 + (RX1 - X0 - 0.1) * (i / (nT - 1)), FH + 0.2, RZF + 0.15 + rnd() * (ZF - RZF - 0.3));
    for (let k = 0; k < 5; k++) {
      const b = new THREE.Mesh(lamina, folhagem()); b.name = 'capim-folha';
      b.position.y = 0.14 + rnd() * 0.06; b.scale.y = 0.7 + rnd() * 0.8;
      b.rotation.set((rnd() - 0.5) * 0.9, rnd() * 6, (rnd() - 0.5) * 0.9);
      tufo.add(b);
    }
    g.add(tufo);
  }

  // parede de fundo e parede ripada de madeira
  g.add(bb('parede-fundo', corSolida(CORES['roxo-80']), X0, X1, FH, WH, ZB - 0.1, ZB));
  g.add(placa(cfg, 'fundo', 'Parede de fundo', X1 - 0.12 - X0, WH - FH,
    { tipo: 'grid' }, X0 + (X1 - 0.12 - X0) / 2, FH + (WH - FH) / 2, ZB + 0.011, 0, 0.02));
  const rz1 = ZB + Math.min(0.95, D * 0.26);
  g.add(bb('parede-madeira', madeira(), X1 - 0.12, X1, FH, WH, ZB, rz1));
  const nR = Math.max(4, Math.round((rz1 - ZB) / 0.105));
  for (let i = 0; i < nR; i++) {
    const z = ZB + 0.06 + i * 0.105;
    if (z + 0.05 > rz1) break;
    g.add(bb('ripa-' + i, madeira(), X1, X1 + 0.03, FH, WH, z, z + 0.05));
  }

  // estúdio: tablado, degraus, vidro e montantes
  const DZ1 = RZF - 0.05, DZ0 = DZ1 - Math.min(0.87, (RZF - ZB) * 0.3);
  g.add(bb('tablado-estudio', madeira(), X0 + 0.01, RX1 - 0.01, FH, RF, ZB, RZF - 0.01));
  g.add(bb('led-tablado', mat('led-roxo-suave', { color: 0x7a7aff, emissive: 0x6b6bff, emissiveIntensity: 1.6 }), RX1 - 0.012, RX1 - 0.008, RF - 0.03, RF - 0.01, DZ0, DZ1));
  g.add(bb('degrau-1', madeira(), RX1, RX1 + 0.6, FH, FH + 0.1, DZ0, DZ1));
  g.add(bb('degrau-2', madeira(), RX1, RX1 + 0.3, FH + 0.1, FH + 0.2, DZ0, DZ1));
  g.add(bb('led-degrau-1', ledClaro(), RX1 + 0.6, RX1 + 0.605, FH + 0.07, FH + 0.09, DZ0, DZ1));
  g.add(bb('led-degrau-2', ledClaro(), RX1 + 0.3, RX1 + 0.305, FH + 0.17, FH + 0.19, DZ0, DZ1));
  const montante = (nome, x, z) => g.add(bb(nome, perfilPreto(), x - 0.035, x + 0.035, FH, WH, z - 0.035, z + 0.035));
  const nF = Math.max(2, Math.round((RX1 - X0) / 0.65));
  for (let i = 0; i <= nF; i++) montante('montante-frente-' + i, X0 + (RX1 - X0) * i / nF, RZF);
  g.add(bb('vidro-frente', vidroSala(), X0, RX1, FH, WH, RZF - 0.005, RZF + 0.005));
  g.add(bb('trilho-frente', perfilPreto(), X0, RX1, FH, FH + 0.06, RZF - 0.03, RZF + 0.03));
  [ZB + (DZ0 - ZB) * 0.4, ZB + (DZ0 - ZB) * 0.75, DZ0 - 0.035].forEach((z, i) => montante('montante-dir-' + i, RX1, z));
  g.add(bb('vidro-direita', vidroSala(), RX1 - 0.005, RX1 + 0.005, FH, WH, ZB, DZ0));
  g.add(bb('vidro-bandeira', vidroSala(), RX1 - 0.005, RX1 + 0.005, Math.min(2.3, WH - 0.3), WH, DZ0, RZF));
  g.add(bb('travessa-porta', perfilPreto(), RX1 - 0.035, RX1 + 0.035, Math.min(2.27, WH - 0.33), Math.min(2.33, WH - 0.27), DZ0, RZF));
  for (let i = 0; i <= nF; i++) [0.7, 1.9].forEach((y) => {
    const x = X0 + (RX1 - X0) * i / nF;
    g.add(bb('grampo', perfilPreto(), x - 0.05, x + 0.05, y, y + 0.05, RZF + 0.035, RZF + 0.06));
  });

  // parede lateral maciça: marcas por dentro, painel de LED por fora
  const WZ1 = ZB + (RZF - ZB) * 0.78;
  g.add(bb('parede-lateral', corSolida(CORES['azul-80']), X0 - 0.05, X0 + 0.06, FH, WH, ZB, WZ1));
  montante('montante-esq-parede', X0, WZ1 + 0.035);
  montante('montante-esq-meio', X0, (WZ1 + RZF) / 2);
  g.add(bb('vidro-esquerda', vidroSala(), X0 - 0.005, X0 + 0.005, FH, WH, WZ1, RZF));
  const bw = WZ1 - ZB, bh = WH - RF;
  g.add(placa(cfg, 'backdrop', 'Backdrop do estúdio', bw, bh, { tipo: 'logos', fundo: 'azul' },
    X0 + 0.071, RF + bh / 2, ZB + bw / 2, Math.PI / 2));
  const lz0 = ZB + 0.15, lz1 = WZ1 - 0.15, ly0 = 0.55, ly1 = Math.min(2.6, WH - 0.2);
  g.add(bb('painel-led-moldura', preto(), X0 - 0.1, X0 - 0.05, ly0 - 0.04, ly1 + 0.04, lz0 - 0.04, lz1 + 0.04));
  g.add(placa(cfg, 'painel-led', 'Painel de LED externo', lz1 - lz0, ly1 - ly0, { tipo: 'video' },
    X0 - 0.111, (ly0 + ly1) / 2, (lz0 + lz1) / 2, -Math.PI / 2));

  // set de podcast
  const TX = X0 + Math.min(1.0, (RX1 - X0) * 0.38), TZ = ZB + (RZF - ZB) * 0.54;
  const dz = Math.min(0.8, (RZF - ZB) * 0.26);
  g.add(poltrona('poltrona-1', TX - 0.3, RF, TZ - dz, TX, TZ, 1));
  g.add(poltrona('poltrona-2', TX - 0.3, RF, TZ + dz, TX, TZ, -1));
  const mesa = new THREE.Group(); mesa.name = 'mesinha'; mesa.position.set(TX, RF, TZ);
  mesa.add(cil('mesinha-tampo', 0.3, 0.3, 0.025, mat('tampo-escuro', { color: 0x2b2622, roughness: 0.5 }), 0, 0.5, 0));
  for (let i = 0; i < 3; i++) {
    const a = i * 2 * Math.PI / 3;
    haste(mesa, 'mesinha-perna-' + i, V3(Math.cos(a) * 0.24, 0.008, Math.sin(a) * 0.24), V3(Math.cos(a) * 0.26, 0.49, Math.sin(a) * 0.26), 0.007, preto());
  }
  g.add(mesa);
  if (cfg.plantas) { const p = planta('planta-estudio', RX1 - 0.4, ZB + 0.45, 0.85); p.position.y = RF; g.add(p); }

  // testeiras roxas do estúdio (sem forro) e do fundo
  const roxoT = corSolida(CORES['roxo-80']);
  const tH = BANDA;
  g.add(bb('testeira-estudio-frente', roxoT, X0 - 0.05, RX1 + 0.05, WH, WH + tH, RZF - 0.05, RZF + 0.05));
  g.add(bb('testeira-estudio-fundo', roxoT, X0 - 0.05, RX1 + 0.05, WH, WH + tH, ZB - 0.1, ZB));
  g.add(bb('testeira-estudio-esq', roxoT, X0 - 0.05, X0 + 0.05, WH, WH + tH, ZB, RZF - 0.05));
  g.add(bb('testeira-estudio-dir', roxoT, RX1 - 0.05, RX1 + 0.05, WH, WH + tH, ZB, RZF - 0.05));
  g.add(placa(cfg, 'letreiro', 'Letreiro do estúdio', Math.min(1.9, RX1 - X0 - 0.2), Math.min(1.9, RX1 - X0 - 0.2) / 4,
    { tipo: 'letreiro', fundo: 'roxo' }, (X0 + RX1) / 2, WH + tH / 2, RZF + 0.061, 0));
  g.add(bb('testeira-fundo', roxoT, RX1 + 0.05, X1 + 0.03, WH, WH + tH - 0.1, ZB - 0.1, rz1));
  g.add(bb('forro-fundo', corSolida(CORES['azul-80']), RX1 + 0.05, X1, WH - 0.02, WH, ZB, rz1));
  if (cfg.testeira !== false) {
    g.add(letraCaixa('logo-testeira-fundo', Math.min(1.6, (X1 - RX1) * 0.5), (RX1 + X1) / 2 + 0.2, WH + (tH - 0.1) / 2, rz1, 0));
    g.add(letraCaixa('logo-testeira-lateral', Math.min(1.7, (RZF - ZB) * 0.5), X0 - 0.05, WH + tH / 2, (ZB + RZF) / 2, -Math.PI / 2));
  }
  // neon nas bordas superiores e no teto do estúdio
  const yS = WH + tH + 0.014, yB = WH + tH - 0.1 + 0.014;
  haste(g, 'neon-estudio-frente', V3(X0 - 0.05, yS, RZF + 0.05), V3(RX1 + 0.05, yS, RZF + 0.05), 0.013, neonRoxo());
  haste(g, 'neon-estudio-esq', V3(X0 - 0.05, yS, ZB - 0.1), V3(X0 - 0.05, yS, RZF + 0.05), 0.013, neonRoxo());
  haste(g, 'neon-estudio-dir', V3(RX1 + 0.05, yS, rz1), V3(RX1 + 0.05, yS, RZF + 0.05), 0.013, neonRoxo());
  haste(g, 'neon-fundo-frente', V3(RX1 + 0.05, yB, rz1), V3(X1 + 0.03, yB, rz1), 0.013, neonRoxo());
  haste(g, 'neon-fundo-dir', V3(X1 + 0.03, yB, ZB - 0.1), V3(X1 + 0.03, yB, rz1), 0.013, neonRoxo());
  const yc = WH + 0.12, cx0 = X0 + 0.065, cx1 = RX1 - 0.065, cz0 = ZB + 0.015, cz1 = RZF - 0.065;
  haste(g, 'neon-teto-frente', V3(cx0, yc, cz1), V3(cx1, yc, cz1), 0.013, neonRoxo());
  haste(g, 'neon-teto-fundo', V3(cx0, yc, cz0), V3(cx1, yc, cz0), 0.013, neonRoxo());
  haste(g, 'neon-teto-esq', V3(cx0, yc, cz0), V3(cx0, yc, cz1), 0.013, neonRoxo());
  haste(g, 'neon-teto-dir', V3(cx1, yc, cz0), V3(cx1, yc, cz1), 0.013, neonRoxo());
  if (cfg.spots) {
    const n = Math.max(2, Math.round((X1 - RX1) / 1.1));
    for (let i = 0; i < n; i++) g.add(cil('spot-embutido-' + i, 0.07, 0.07, 0.01, ledClaro(), RX1 + (X1 - RX1) * (i + 0.5) / n, WH - 0.025, (ZB + rz1) / 2));
  }

  // balcão de café
  if (cfg.balcao) {
    const bx0 = RX1 + 0.1, bx1 = Math.min(RX1 + 1.55, X1 - 1.6);
    const bz1 = ZB + 0.55;
    g.add(bb('balcao-corpo', corSolida(CORES['azul-100'] || '#181A27'), bx0, bx1, FH, 1.02, ZB, bz1));
    g.add(placa(cfg, 'balcao', 'Balcão de café', bx1 - bx0 - 0.08, 0.8, { tipo: 'marca', fundo: 'azul' },
      (bx0 + bx1) / 2, FH + 0.46, bz1 + 0.011, 0));
    g.add(bb('balcao-tampo', corSolida(CORES['azul-80']), bx0 - 0.03, bx1 + 0.03, 1.02, 1.06, ZB, bz1 + 0.03));
    g.add(bb('cafeteira', preto(), bx1 - 0.3, bx1 - 0.05, 1.06, 1.4, ZB + 0.05, ZB + 0.35));
    g.add(bb('porta-copos', tampo(), bx1 - 0.8, bx1 - 0.55, 1.06, 1.14, ZB + 0.1, ZB + 0.28));
  }
  // totens de autoatendimento
  if (cfg.totens) {
    [X1 - 1.28, X1 - 0.58].forEach((x, i) => {
      const k = new THREE.Group(); k.name = 'totem-' + (i + 1); k.position.set(x, FH, ZB + 0.22);
      k.add(box('totem-base-' + i, 0.56, 0.04, 0.34, preto(), 0, 0.02, 0));
      k.add(box('totem-corpo-' + i, 0.5, 1.72, 0.12, preto(), 0, 0.9, 0));
      k.add(placa(cfg, 'totem-' + (i + 1), 'Totem ' + (i + 1), 0.42, 0.75,
        { tipo: 'tela', fundo: 'azul', frase: 'Bem-vindo' }, 0, 1.36, 0.071, 0));
      k.add(cil('totem-leitor-' + i, 0.035, 0.035, 0.01, mat('leitor-roxo', { color: 0x9a7cff, emissive: 0x9a7cff, emissiveIntensity: 0.8 }), 0, 0.88, 0.062));
      g.add(k);
    });
  }
  if (cfg.mesaAlta) g.add(mesaAlta(X1 - 1.3, ZB + (ZF - ZB) * 0.7));
  // extintor
  g.add(cil('extintor', 0.07, 0.07, 0.45, mat('vermelho-extintor', { color: 0xb91c1c, roughness: 0.4 }), X1 - 0.3, FH + 0.25, rz1 + 0.15));
}


// ---------------------------------------------------------------- ilha com volume e arcos
function rrect(x0, z0, x1, z1, r) {
  const sh = new THREE.Shape();
  sh.moveTo(x0 + r, -z0); sh.lineTo(x1 - r, -z0);
  sh.quadraticCurveTo(x1, -z0, x1, -(z0 + r));
  sh.lineTo(x1, -(z1 - r)); sh.quadraticCurveTo(x1, -z1, x1 - r, -z1);
  sh.lineTo(x0 + r, -z1); sh.quadraticCurveTo(x0, -z1, x0, -(z1 - r));
  sh.lineTo(x0, -(z0 + r)); sh.quadraticCurveTo(x0, -z0, x0 + r, -z0);
  return sh;
}
function laje(nome, shape, alt, material, y) {
  const geo = new THREE.ExtrudeGeometry(shape, { depth: alt, bevelEnabled: false, curveSegments: 24 });
  geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, material); m.name = nome; m.position.y = y;
  return m;
}

function shellIlhaVolume(cfg, g) {
  const W = cfg.largura, D = cfg.profundidade;
  const est = corSolida(CORES[cfg.corEstrutura] || CORES['azul-royal']);
  const branco = corSolida('#FFFFFF');
  const cinza = mat('caixa-cinza', { color: 0x9fa3b9, roughness: 0.5 });
  const vaso = mat('vaso-cinza', { color: 0x8a8c99, roughness: 0.6 });
  const FH = 0.12;

  // tablado branco com LED no perímetro
  g.add(box('tablado', W, FH, D, branco, 0, FH / 2, 0));
  g.add(box('led-tablado-frente', W, 0.03, 0.03, ledClaro(), 0, 0.03, D / 2 + 0.015));
  g.add(box('led-tablado-fundo', W, 0.03, 0.03, ledClaro(), 0, 0.03, -D / 2 - 0.015));
  g.add(box('led-tablado-esq', 0.03, 0.03, D, ledClaro(), -W / 2 - 0.015, 0.03, 0));
  g.add(box('led-tablado-dir', 0.03, 0.03, D, ledClaro(), W / 2 + 0.015, 0.03, 0));

  const s = new THREE.Group(); s.name = 'ilha-volume'; s.position.y = FH; g.add(s);
  const hP = ALT - BANDA - FH, R = Math.min(0.9, W * 0.15, D * 0.15), t = 0.3;
  const rIn = Math.max(0.1, R - t);

  // testeira contínua com cantos arredondados + forro branco
  if (BANDA > 0) {
    const anel = rrect(-W / 2, -D / 2, W / 2, D / 2, R);
    anel.holes.push(rrect(-W / 2 + t, -D / 2 + t, W / 2 - t, D / 2 - t, rIn));
    s.add(laje('testeira-anel', anel, BANDA, est, hP));
    const yF = hP + BANDA / 2, hF = BANDA - 0.16;
    const lema = 'Pessoas / processos / tecnologia / para um Brasil / mais eficiente';
    [
      ['testeira', 'Testeira · frente', W - 2 * R - 0.2, 0, D / 2 + 0.011, 0, lema],
      ['testeira-dir', 'Testeira · lateral direita', D - 2 * R - 0.2, W / 2 + 0.011, 0, Math.PI / 2, ''],
      ['testeira-fundo', 'Testeira · fundo', W - 2 * R - 0.2, 0, -D / 2 - 0.011, Math.PI, lema],
      ['testeira-esq', 'Testeira · lateral esquerda', D - 2 * R - 0.2, -W / 2 - 0.011, 0, -Math.PI / 2, ''],
    ].forEach(([id, rot, lw, x, z, ry, frase]) => {
      s.add(placa(cfg, id, rot, lw, hF, { tipo: 'faixa', fundo: 'royal', frase }, x, yF, z, ry, 0.01));
    });
    if (cfg.spots) {
      const top = hP + BANDA + 0.02;
      const nx = Math.max(2, Math.round(W / 2)), nz = Math.max(2, Math.round(D / 2));
      for (let i = 0; i < nx; i++) {
        const x = -W / 2 + R + (W - 2 * R) * (i + 0.5) / nx;
        s.add(spot(x, D / 2 - 0.15, top)); s.add(spot(x, -D / 2 + 0.15, top));
      }
      for (let i = 0; i < nz; i++) {
        const z = -D / 2 + R + (D - 2 * R) * (i + 0.5) / nz;
        s.add(spot(W / 2 - 0.15, z, top)); s.add(spot(-W / 2 + 0.15, z, top));
      }
    }
  }
  s.add(laje('forro', rrect(-W / 2 + t, -D / 2 + t, W / 2 - t, D / 2 - t, rIn), 0.05, branco, hP - 0.05));

  // colunas ripadas brancas nos cantos abertos + caixas cinza
  const coluna = (nome, x, z) => {
    for (let k = 0; k < 3; k++) s.add(box(nome + '-ripa-' + k, 0.05, hP, 0.05, branco, x + (k - 1) * 0.09, hP / 2, z));
  };
  coluna('coluna-frente-esq', -W / 2 + 0.2, D / 2 - 0.2);
  coluna('coluna-fundo-esq', -W / 2 + 0.2, -D / 2 + 0.2);
  coluna('coluna-fundo-dir', W / 2 - 0.2, -D / 2 + 0.2);
  s.add(box('caixa-cinza-frente', 0.42, 0.95, 0.16, cinza, -W / 2 + 0.2, 1.35, D / 2 - 0.08));
  s.add(box('caixa-cinza-lateral', 0.16, 0.95, 0.42, cinza, W / 2 - 0.08, 1.35, -D / 2 + 0.6));

  // volume fechado de canto (frente-direita), quina arredondada
  const ins = 0.22, vw = Math.min(2.4, W * 0.4), vd = Math.min(2.4, D * 0.46), rv = Math.min(0.7, vw * 0.3);
  const xb = W / 2 - ins, xa = xb - vw, zb = D / 2 - ins, za = zb - vd;
  const vs = new THREE.Shape();
  vs.moveTo(xa, -za); vs.lineTo(xb, -za); vs.lineTo(xb, -(zb - rv));
  vs.quadraticCurveTo(xb, -zb, xb - rv, -zb); vs.lineTo(xa, -zb); vs.closePath();
  s.add(laje('volume', vs, hP, est, 0));

  // nicho em arco com moldura branca iluminada
  const nwid = Math.min(1.3, xb - rv - xa - 0.3), nh = hP - 0.45, nx = (xa + xb - rv) / 2;
  const mold = arco('nicho-moldura', nwid + 0.16, nh + 0.08, 0.08, 0.1, branco);
  mold.position.set(nx, 0, zb + 0.05); s.add(mold);
  const telaN = placaArco(cfg, 'nicho', 'Nicho iluminado', nwid, nh,
    { tipo: 'nicho', frase: 'Tecnologia que impulsiona o hoje e o amanhã', marcas: 'GEP | Just' });
  telaN.position.set(nx, 0, zb + 0.012); s.add(telaN);

  // tela na face lateral do volume
  if (cfg.totens) {
    const tz = (za + zb - rv) / 2;
    s.add(box('tablet-moldura', 0.08, 1.05, 0.64, cinza, xb + 0.04, 1.45, tz));
    s.add(placa(cfg, 'tablet', 'Tela lateral do volume', 0.54, 0.94,
      { tipo: 'tela', fundo: 'azul', frase: 'Bem-vindo' }, xb + 0.081, 1.45, tz, Math.PI / 2, 0.01));
  }

  // frente: arco de entrada, ripado, totem e planta
  const ax = Math.max(-W / 2 + 1.0, xa - 2.25);
  const a1 = arco('arco-entrada', 1.4, hP - 0.15, 0.2, 0.35, est);
  a1.position.set(ax, 0, D / 2 - 0.45); s.add(a1);
  coluna('ripado-frente', xa - 1.4, D / 2 - 0.45);
  if (cfg.totens) {
    const k = new THREE.Group(); k.name = 'totem'; k.position.set(xa - 0.85, 0, D / 2 - 0.5);
    k.add(box('totem-pe', 0.34, 0.25, 0.3, cinza, 0, 0.125, 0));
    k.add(box('totem-corpo', 0.72, 1.75, 0.12, mat('totem-claro', { color: 0xe6e7ee, roughness: 0.4 }), 0, 1.125, 0));
    k.add(placa(cfg, 'totem', 'Totem digital', 0.56, 1.1,
      { tipo: 'tela', fundo: 'azul', frase: 'Tecnologia que impulsiona o hoje e o amanhã.' }, 0, 1.25, 0.066, 0, 0.01));
    s.add(k);
  }
  if (cfg.plantas) {
    s.add(planta('planta-frente', xa - 0.3, D / 2 - 0.35, 1.25, vaso));
    s.add(planta('planta-canto', -W / 2 + 0.55, D / 2 - 1.0, 1.15, vaso));
    s.add(planta('planta-fundo', W / 2 - 0.55, -D / 2 + 0.55, 1.2, vaso));
  }

  // fundo: parede azul com TV dupla e apoio branco
  const bwX = 0.25, bwZ = -D / 2 + 0.4, bwW = 1.5;
  s.add(box('parede-tv', bwW, hP, 0.3, est, bwX, hP / 2, bwZ));
  if (cfg.tv) {
    s.add(box('tv-moldura', 1.34, 0.46, 0.05, moldura(), bwX, 1.75, bwZ + 0.175));
    ['justica', 'processos'].forEach((img, i) => s.add(placa(cfg, 'tv-' + (i + 1), 'TV · tela ' + (i + 1), 0.64, 0.4,
      { tipo: 'imagem', img }, bwX + (i ? 0.33 : -0.33), 1.75, bwZ + 0.206, 0, 0.01)));
  }
  if (cfg.mesaAlta) {
    const lx = bwX + bwW / 2 + 0.5, lz = bwZ + 0.6;
    s.add(box('apoio-coluna', 0.06, 1.05, 0.36, branco, lx + 0.2, 0.525, lz));
    s.add(box('apoio-tampo', 0.5, 0.04, 0.4, branco, lx, 1.07, lz));
  }
  // segundo arco, de lado, ao fundo
  const a2 = arco('arco-fundo', 1.4, hP - 0.15, 0.2, 0.35, est);
  a2.position.set(W / 2 - 0.9, 0, za - 0.85); a2.rotation.y = Math.PI / 2; s.add(a2);

  // jardim vertical, anel suspenso e pendentes
  const px = -0.7, pz = 0.25;
  if (cfg.jardim) {
    const gx0 = -W / 2 + 0.3, gx1 = bwX - bwW / 2 - 0.1, gz = -D / 2 + 0.2;
    s.add(box('jardim-vertical', gx1 - gx0, hP, 0.12, folhagemEsc(), (gx0 + gx1) / 2, hP / 2, gz));
    let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const geoF = new THREE.SphereGeometry(1, 10, 8);
    const n = Math.round((gx1 - gx0) * hP * 14);
    for (let i = 0; i < n; i++) {
      const f = new THREE.Mesh(geoF, i % 3 ? folhagem() : folhagemEsc()); f.name = 'jardim-folha';
      const r = 0.1 + rnd() * 0.1;
      f.scale.set(r * 1.3, r, r * 0.45);
      f.position.set(gx0 + rnd() * (gx1 - gx0), 0.1 + rnd() * (hP - 0.2), gz + 0.07 + rnd() * 0.05);
      f.rotation.z = rnd() * 3;
      s.add(f);
    }
    const yA = hP - 0.7;
    const anelJ = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.07, 12, 48), est);
    anelJ.name = 'anel-suspenso'; anelJ.rotation.x = Math.PI / 2; anelJ.position.set(px, yA, pz); s.add(anelJ);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const p = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.5 + (i % 3) * 0.2, 6), folhagem());
      p.name = 'anel-pendente-' + i; p.rotation.x = Math.PI;
      p.position.set(px + Math.cos(a) * 0.75, yA - 0.3 - (i % 3) * 0.1, pz + Math.sin(a) * 0.75);
      s.add(p);
    }
    [0, 2, 4].forEach((i) => {
      const a = (i / 6) * Math.PI * 2;
      s.add(cil('anel-cabo-' + i, 0.006, 0.006, hP - yA, cromado(), px + Math.cos(a) * 0.75, (hP + yA) / 2, pz + Math.sin(a) * 0.75));
    });
    [[0.35, 1.0, -0.2], [-0.3, 1.25, 0.25], [0.05, 1.5, 0.45]].forEach(([ox, oy, oz], i) => {
      s.add(cil('pendente-cabo-' + i, 0.005, 0.005, oy, cromado(), px + ox, hP - oy / 2, pz + oz));
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 16), globo());
      b.name = 'pendente-globo-' + (i + 1); b.position.set(px + ox, hP - oy - 0.17, pz + oz); s.add(b);
    });
  }

  // balcão listrado azul e branco
  if (cfg.balcao) {
    const bx = -W / 2 + 1.35, bz = -D / 2 + 1.45, bw = 1.8;
    s.add(box('balcao-corpo', bw, 1.0, 0.5, est, bx, 0.5, bz));
    const n = 12;
    for (let i = 0; i < n; i++) s.add(box('balcao-ripa-' + i, 0.05, 0.95, 0.03, branco, bx - bw / 2 + 0.05 + i * (bw - 0.1) / (n - 1), 0.475, bz + 0.265));
    s.add(box('balcao-tampo', bw + 0.06, 0.05, 0.56, branco, bx, 1.025, bz));
  }

  // puffs
  if (cfg.lounge) {
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      s.add(cil('puff-' + i + j, 0.23, 0.23, 0.42, estofado(), px + (i - 1) * 0.6, 0.21, pz + (j - 1) * 0.62));
    }
  }
}

// ---------------------------------------------------------------- estande
export const MODELOS = {
  octanorm: { rotulo: 'Octanorm modular', altura: 3.04, banda: 0.40, piso: 'claro' },
  marcenaria: { rotulo: 'Parede em marcenaria', altura: 2.9, banda: 0.0, piso: 'grafite' },
  box: { rotulo: 'Caixa com testeira', altura: 4.2, banda: 0.9, piso: 'madeira' },
  portico: { rotulo: 'Pórtico com viga', altura: 4.0, banda: 0.7, piso: 'claro' },
  pergolado: { rotulo: 'Pergolado aberto', altura: 3.6, banda: 0.0, piso: 'madeira' },
  quiosque: { rotulo: 'Quiosque de quatro faces', altura: 3.4, banda: 0.55, piso: 'grafite' },
  arcos: { rotulo: 'Esquina com arcos', altura: 4.2, banda: 0.9, piso: 'grafite' },
  estudio: { rotulo: 'Estúdio de podcast', altura: 3.4, banda: 0.6, piso: 'madeira' },
  ilhaVolume: { rotulo: 'Ilha com volume e arcos', altura: 4.0, banda: 0.9, piso: 'claro' },
};

export function construirEstande(cfg) {
  CATALOGO = {};
  const modelo = MODELOS[cfg.modelo] ? cfg.modelo : 'octanorm';
  ALT = cfg.altura || MODELOS[modelo].altura;
  BANDA = (modelo === 'marcenaria' || modelo === 'pergolado') ? 0 : (cfg.testeira === false ? 0 : MODELOS[modelo].banda);
  const W = cfg.largura, D = cfg.profundidade;
  const g = new THREE.Group();
  g.name = 'estande-softplan';

  const piso = box('piso', W, 0.04, D, carpete(cfg.piso), 0, -0.02, 0);
  piso.userData.sup = null;
  g.add(piso);

  if (modelo === 'marcenaria') shellMarcenaria(cfg, g);
  else if (modelo === 'box') shellBox(cfg, g);
  else if (modelo === 'portico') shellPortico(cfg, g);
  else if (modelo === 'pergolado') shellPergolado(cfg, g);
  else if (modelo === 'quiosque') shellQuiosque(cfg, g);
  else if (modelo === 'arcos') shellArcos(cfg, g);
  else if (modelo === 'estudio') shellEstudio(cfg, g);
  else if (modelo === 'ilhaVolume') shellIlhaVolume(cfg, g);
  else shellOctanorm(cfg, g);

  // elementos comuns às tipologias octanorm/marcenaria
  if (modelo === 'octanorm') {
    if (cfg.tv) {
      const alt = (cfg.tvPol || 55) * 0.0254 * 0.87 * 0.5625;
      const zTv = cfg.ilha ? -Math.min(D * 0.3, 1.84) / 2 - 0.1 : -D / 2 + 0.14;
      const nP = Math.max(1, Math.round(W / (MOD * 2)));
      const xTv = cfg.ilha ? 0 : (nP === 2 ? W * 0.25 : 0);
      g.add(tv(xTv, Math.min(1.78, ALT - BANDA - alt / 2 - 0.15), zTv, 0, cfg.tvPol));
    }
    if (cfg.balcao) g.add(balcaoReto(cfg, 'balcao', W < 3 ? 0 : W / 2 - 1.15, D / 2 - 1.0, 0));
    if (cfg.insta) {
      const lw = Math.min(1.84, D - 0.6), lh = Math.min(2.44, ALT - BANDA - 0.2);
      const grupo = new THREE.Group(); grupo.name = 'painel-instagramavel';
      grupo.add(box('insta-caixa', lw + 0.08, lh + 0.08, 0.14, painelBranco(), 0, lh / 2, 0));
      grupo.add(placa(cfg, 'insta', 'Painel instagramável', lw, lh, { tipo: 'marca', fundo: 'azul' }, 0, lh / 2, 0.075, 0));
      grupo.add(box('insta-base', lw + 0.22, 0.06, 0.36, painelBranco(), 0, 0.03, 0.12));
      grupo.position.set(cfg.ilha ? -Math.min(W * 0.42, 3.68) / 2 - 1.3 : -W / 2 + 0.2,
        0, cfg.ilha ? 0 : (W >= 3 ? D / 2 - Math.min(D * 0.55, 2.0) : 0));
      grupo.rotation.y = Math.PI / 2;
      g.add(grupo);
    }
    if (cfg.lounge && W * D >= 12) g.add(lounge(-W / 2 + 1.4, -D / 2 + 1.6, 0));
    if (cfg.mesaAlta && W * D >= 12) g.add(mesaAlta(W / 2 - 1.3, -D / 2 + 1.4));
  }

  if (modelo === 'box' && cfg.tv) {
    const alt = (cfg.tvPol || 55) * 0.0254 * 0.87 * 0.5625;
    g.add(tv(-W * 0.22, Math.min(1.85, ALT - BANDA - alt), -D / 2 + 0.2, 0, cfg.tvPol));
  }
  if (modelo === 'marcenaria' && cfg.tv) {
    const alt = (cfg.tvPol || 55) * 0.0254 * 0.87 * 0.5625;
    g.add(tv(Math.min(W - 0.2, 3.6) * 0.3, Math.min(1.68, ALT - alt / 2 - 0.55), -D / 2 + 0.47, 0, cfg.tvPol));
  }

  if (modelo === 'portico' && cfg.tv) {
    const alt = (cfg.tvPol || 55) * 0.0254 * 0.87 * 0.5625;
    g.add(tv(W * 0.3, Math.min(1.8, ALT - BANDA - alt), -D / 2 + 0.24, 0, cfg.tvPol));
  }
  if (modelo === 'pergolado' && cfg.tv) {
    const alt = (cfg.tvPol || 55) * 0.0254 * 0.87 * 0.5625;
    g.add(tv(-W * 0.26, Math.min(1.7, ALT * 0.5), -D / 2 + 0.26, 0, cfg.tvPol));
  }

  return g;
}

export function resumo(cfg) {
  const W = cfg.largura, D = cfg.profundidade;
  const modelo = MODELOS[cfg.modelo] ? cfg.modelo : 'octanorm';
  const alt = cfg.altura || MODELOS[modelo].altura;
  let paineis = 0, testeira = 0;
  if (modelo === 'octanorm') {
    if (cfg.ilha) { paineis = Math.round((Math.min(W * 0.42, 3.68) / (MOD * 2)) * 2); testeira = cfg.testeira ? Math.min(W * 0.42, 3.68) * 2 : 0; }
    else { paineis = Math.round((W + D * 2) / (MOD * 2)); testeira = cfg.testeira ? W + (D > 2.4 ? D : 0) : 0; }
  } else if (modelo === 'marcenaria') {
    paineis = 1; testeira = 0;
  } else if (modelo === 'portico') {
    paineis = 3; testeira = W;
  } else if (modelo === 'pergolado') {
    paineis = 4; testeira = 0;
  } else if (modelo === 'ilhaVolume') {
    paineis = 6 + (cfg.tv ? 2 : 0); testeira = 2 * (W + D);
  } else if (modelo === 'estudio') {
    paineis = 3 + (cfg.totens ? 2 : 0); testeira = (Math.min(2.6, W * 0.43)) * 2 + D * 2 + (W - Math.min(2.6, W * 0.43));
  } else if (modelo === 'arcos') {
    paineis = 4 + (cfg.totens ? (W >= 7 ? 2 : 1) : 0) + (cfg.holograma ? 1 : 0); testeira = W + D;
  } else if (modelo === 'quiosque') {
    paineis = 4; testeira = (Math.min(W, D) * 0.46 + 0.5) * 4;
  } else {
    paineis = 2 + (cfg.totens ? 2 : 0); testeira = W + D;
  }
  return {
    area: (W * D).toFixed(1),
    paineis,
    testeira: testeira.toFixed(2),
    altura: alt.toFixed(2),
    superficies: Object.keys(CATALOGO).length,
  };
}
