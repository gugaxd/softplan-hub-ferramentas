import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Header from "../../src/comum/Header.jsx";
import { HUB_URL } from "../../src/comum/hub.js";
import { useTema } from "../../src/comum/tema.js";
import { Controle, Linha, Segmentado } from "../../src/comum/controles.jsx";

/* ---------------------------------------------------------------------------
   Gradient Studio — os gradientes da marca Softplan, editáveis e animados.

   Feito a partir do gradient maker do the hub. O motor (desenho do mesh,
   distorção, granulação, SVG e código) veio sem mudança de lógica; a
   interface foi refeita na casca deste hub, as cores ficaram presas à paleta
   do DS e os presets são os nove renders oficiais da marca.

   Tela, PNG e vídeo saem da mesma função, drawScene.
--------------------------------------------------------------------------- */

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(hex) {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return { r: 0, g: 0, b: 0 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgba(hex, a) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

function hsl(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const to = (v) => Math.round(255 * v).toString(16).padStart(2, "0");
  return `#${to(f(0))}${to(f(8))}${to(f(4))}`;
}

/* deterministic blob layout ---------------------------------------- */

function makeBlobs(seed, count) {
  const rnd = mulberry32(seed);
  const out = [];
  for (let i = 0; i < count; i++) {
    const ang = (i / count) * Math.PI * 2 + rnd() * 0.9;
    const rad = 0.18 + rnd() * 0.24;
    out.push({
      bx: 0.5 + Math.cos(ang) * rad,
      by: 0.5 + Math.sin(ang) * rad,
      br: 0.34 + rnd() * 0.26,
      h1: 1 + Math.floor(rnd() * 3),
      h2: 1 + Math.floor(rnd() * 3),
      h3: 2 + Math.floor(rnd() * 3),
      h4: 2 + Math.floor(rnd() * 3),
      h5: 1 + Math.floor(rnd() * 2),
      p1: rnd(),
      p2: rnd(),
      p3: rnd(),
      p4: rnd(),
      p5: rnd(),
      lobes: Array.from({ length: 4 }, (_, l) => ({
        a: rnd(),
        d: rnd(),
        s: rnd(),
        h: 1 + Math.floor(rnd() * 2),
        h2: 1 + Math.floor(rnd() * 3),
        p: rnd(),
      })),
    });
  }
  return out;
}

/* motion — periodic, so every loop is seamless --------------------- */

function blobPos(b, phase, T) {
  const amp = 0.05 + 0.28 * T;
  const tau = Math.PI * 2;
  const x =
    b.bx +
    amp * Math.sin(tau * (phase * b.h1 + b.p1)) +
    amp * 0.45 * T * Math.sin(tau * (phase * b.h3 + b.p3));
  const y =
    b.by +
    amp * Math.cos(tau * (phase * b.h2 + b.p2)) +
    amp * 0.45 * T * Math.cos(tau * (phase * b.h4 + b.p4));
  const r = b.br * (1 + 0.22 * T * Math.sin(tau * (phase * b.h5 + b.p5)));
  return { x, y, r };
}

/* mesh warp ---------------------------------------------------------
   the whole gradient is pushed around by a sum of sine bands: columns
   get displaced vertically, then rows horizontally. Two cheap passes,
   but the composition reads as fabric folding / water rippling.      */

function wave(u, t, k) {
  const tau = Math.PI * 2;
  return (
    (Math.sin(u * 6.2 + tau * (t + k * 0.31)) +
      0.55 * Math.sin(u * 11.3 - tau * (2 * t + k * 0.11)) +
      0.3 * Math.sin(u * 19.7 + tau * (3 * t + k * 0.57))) /
    1.85
  );
}

function getBuf(buf, W, H) {
  if (!buf.a) {
    buf.a = document.createElement("canvas");
    buf.b = document.createElement("canvas");
  }
  if (buf.a.width !== W || buf.a.height !== H) {
    buf.a.width = buf.b.width = W;
    buf.a.height = buf.b.height = H;
  }
  return buf;
}

function warpPass(src, dctx, W, H, t, A, vertical) {
  dctx.clearRect(0, 0, W, H);
  const pad = A + 1;
  if (vertical) {
    const n = 180;
    const sw = W / n;
    for (let i = 0; i < n; i++) {
      const x = i * sw;
      const d = A * wave(x / W, t, 0);
      dctx.drawImage(src, x, 0, sw, H, x, d - pad, sw + 1, H + 2 * pad);
    }
  } else {
    const n = 130;
    const sh = H / n;
    for (let i = 0; i < n; i++) {
      const y = i * sh;
      const d = A * wave(y / H, t, 1);
      dctx.drawImage(src, 0, y, W, sh, d - pad, y, W + 2 * pad, sh + 1);
    }
  }
}

/* film grain tiles -------------------------------------------------- */

function makeNoiseTiles(n = 6, size = 180) {
  const tiles = [];
  for (let k = 0; k < n; k++) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const x = c.getContext("2d");
    const img = x.createImageData(size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 40 + Math.random() * 175;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    tiles.push(c);
  }
  return tiles;
}

/* ------------------------------------------------------------------ */
/* the renderer — one pure function used by preview, PNG and video     */
/* ------------------------------------------------------------------ */

function drawScene(ctx, W, H, phase, cfg, tiles, buf) {
  const { mode, classicType, angle, colors, turbulence, grain, blobs } = cfg;
  const T = turbulence / 100;
  const D = mode === "mesh" ? (cfg.distort || 0) / 100 : 0;
  const maxD = Math.max(W, H);
  const diag = Math.hypot(W, H);
  const amp = D * 0.11 * Math.min(W, H);

  /* with warp on, the gradient is painted into a buffer first, then
     pushed through the two displacement passes                       */
  const warped = D > 0.005;
  let g2 = ctx;
  if (warped) {
    buf = getBuf(buf || {}, W, H);
    g2 = buf.a.getContext("2d");
    g2.clearRect(0, 0, W, H);
  }

  g2.save();
  g2.globalCompositeOperation = "source-over";
  g2.globalAlpha = 1;

  if (mode === "mesh") {
    g2.fillStyle = colors[0];
    g2.fillRect(0, 0, W, H);
    for (let i = 0; i < colors.length; i++) {
      const b = blobs[i];
      if (!b) continue;
      const p = blobPos(b, phase, T);
      const cx = p.x * W;
      const cy = p.y * H;
      const r = Math.max(8, p.r * maxD);
      const g = g2.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, rgba(colors[i], 1));
      g.addColorStop(0.45, rgba(colors[i], 0.62));
      g.addColorStop(1, rgba(colors[i], 0));
      g2.fillStyle = g;
      g2.fillRect(0, 0, W, H);
    }
  } else {
    const stops = [];
    for (let rep = 0; rep < 3; rep++) for (const c of colors) stops.push(c);
    stops.push(colors[0]);

    if (classicType === "linear") {
      const a = (angle * Math.PI) / 180;
      const ux = Math.cos(a);
      const uy = Math.sin(a);
      const cxc = W / 2;
      const cyc = H / 2;
      const off = phase * diag;
      const strips = T > 0.02 ? 72 : 1;
      const sw = W / strips;
      for (let s = 0; s < strips; s++) {
        const wob =
          T *
          0.22 *
          diag *
          Math.sin(Math.PI * 2 * (phase * 2 + (s / strips) * 2.2));
        const shift = off + wob;
        const g = g2.createLinearGradient(
          cxc - ux * diag * 1.5 + ux * shift,
          cyc - uy * diag * 1.5 + uy * shift,
          cxc + ux * diag * 1.5 + ux * shift,
          cyc + uy * diag * 1.5 + uy * shift
        );
        stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
        g2.fillStyle = g;
        g2.fillRect(s * sw - 1, 0, sw + 2, H);
      }
    } else {
      const cx = W * (0.5 + T * 0.22 * Math.sin(Math.PI * 2 * phase));
      const cy = H * (0.5 + T * 0.22 * Math.cos(Math.PI * 2 * phase * 2));
      const r = diag * (0.75 + T * 0.25 * Math.sin(Math.PI * 2 * phase));
      const g = g2.createRadialGradient(cx, cy, r * 0.02, cx, cy, r);
      const off = phase % 1;
      stops.forEach((c, i) => {
        let pos = i / (stops.length - 1) - off / 3;
        pos = Math.max(0, Math.min(1, pos));
        g.addColorStop(pos, c);
      });
      g2.fillStyle = g;
      g2.fillRect(0, 0, W, H);
    }
  }

  g2.restore();

  if (warped) {
    const bctx = buf.b.getContext("2d");
    warpPass(buf.a, bctx, W, H, phase, amp, true);
    ctx.clearRect(0, 0, W, H);
    warpPass(buf.b, ctx, W, H, phase, amp * 0.85, false);
  }

  ctx.save();
  if (grain > 0 && tiles && tiles.length) {
    const idx = Math.floor(phase * tiles.length) % tiles.length;
    const pat = ctx.createPattern(tiles[idx], "repeat");
    if (pat) {
      const scale = Math.max(1, maxD / 1400);
      ctx.globalCompositeOperation = "overlay";
      ctx.globalAlpha = 0.08 + (grain / 100) * 0.62;
      ctx.save();
      ctx.scale(scale, scale);
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, W / scale, H / scale);
      ctx.restore();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }
  }

  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* code + svg export builders                                          */
/* ------------------------------------------------------------------ */

const GRAIN_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

function buildSVG(cfg, phase, W, H) {
  const { mode, classicType, angle, colors, turbulence, grain, blobs } = cfg;
  const T = turbulence / 100;
  const D = (cfg.distort || 0) / 100;
  const maxD = Math.max(W, H);
  let defs = "";
  let body = "";

  if (mode === "mesh") {
    body += `<rect width="${W}" height="${H}" fill="${colors[0]}"/>`;
    let shapes = "";
    colors.forEach((c, i) => {
      const b = blobs[i];
      if (!b) return;
      defs += `<radialGradient id="g${i}"><stop offset="0" stop-color="${c}" stop-opacity="1"/><stop offset="0.45" stop-color="${c}" stop-opacity="0.62"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
      const p = blobPos(b, phase, T);
      shapes += `<circle cx="${(p.x * W).toFixed(1)}" cy="${(p.y * H).toFixed(
        1
      )}" r="${(p.r * maxD).toFixed(1)}" fill="url(#g${i})"/>`;
    });
    if (D >= 0.01) {
      const bf = (1.5 / maxD).toFixed(5);
      const sc = (D * 0.34 * Math.min(W, H)).toFixed(0);
      defs += `<filter id="warp" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency="${bf}" numOctaves="3" seed="${
        cfg.seed || 7
      }" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="${sc}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
      body += `<g filter="url(#warp)">${shapes}</g>`;
    } else {
      body += shapes;
    }
  } else if (classicType === "linear") {
    const a = (angle * Math.PI) / 180;
    const x1 = (0.5 - Math.cos(a) / 2) * 100;
    const y1 = (0.5 - Math.sin(a) / 2) * 100;
    const x2 = (0.5 + Math.cos(a) / 2) * 100;
    const y2 = (0.5 + Math.sin(a) / 2) * 100;
    const st = colors
      .map(
        (c, i) =>
          `<stop offset="${((i / (colors.length - 1)) * 100).toFixed(
            1
          )}%" stop-color="${c}"/>`
      )
      .join("");
    defs += `<linearGradient id="lg" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">${st}</linearGradient>`;
    body += `<rect width="${W}" height="${H}" fill="url(#lg)"/>`;
  } else {
    const st = colors
      .map(
        (c, i) =>
          `<stop offset="${((i / (colors.length - 1)) * 100).toFixed(
            1
          )}%" stop-color="${c}"/>`
      )
      .join("");
    defs += `<radialGradient id="rg">${st}</radialGradient>`;
    body += `<rect width="${W}" height="${H}" fill="url(#rg)"/>`;
  }

  let grainLayer = "";
  if (grain > 0) {
    defs += `<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`;
    grainLayer = `<rect width="${W}" height="${H}" filter="url(#grain)" opacity="${(
      0.08 +
      (grain / 100) * 0.5
    ).toFixed(2)}" style="mix-blend-mode:overlay"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${body}${grainLayer}</svg>`;
}

function buildCode(cfg, dur, animated, W = 1920, H = 1080) {
  const { mode, classicType, angle, colors, turbulence, grain, blobs } = cfg;
  const T = turbulence / 100;
  const D = (cfg.distort || 0) / 100;
  const maxD = Math.max(W, H);
  const ratio = `${W}/${H}`;
  const grainCss =
    grain > 0
      ? `\n.gm-grain{position:absolute;inset:0;pointer-events:none;background-image:${GRAIN_URI};background-size:180px 180px;opacity:${(
          0.08 +
          (grain / 100) * 0.5
        ).toFixed(2)};mix-blend-mode:overlay}`
      : "";
  const grainDiv = grain > 0 ? `\n  <div class="gm-grain"></div>` : "";

  if (mode === "mesh") {
    const divs = [];
    const rules = [];
    colors.forEach((c, i) => {
      const b = blobs[i];
      if (!b) return;
      const p0 = blobPos(b, 0, T);
      const w0 = 2 * p0.r * maxD;
      const cls = `gm-b${i}`;
      divs.push(`      <div class="gm-blob ${cls}"></div>`);
      const tf = (k) => {
        const pk = blobPos(b, k % 1, T);
        const dx = (((pk.x - p0.x) * W) / w0) * 100;
        const dy = (((pk.y - p0.y) * H) / w0) * 100;
        return `translate(-50%,-50%) translate(${dx.toFixed(2)}%,${dy.toFixed(
          2
        )}%) scale(${(pk.r / p0.r).toFixed(3)})`;
      };
      const decl = `.${cls}{width:${((w0 / W) * 100).toFixed(2)}%;height:${(
        (w0 / H) *
        100
      ).toFixed(2)}%;left:${(p0.x * 100).toFixed(2)}%;top:${(
        p0.y * 100
      ).toFixed(2)}%;background:radial-gradient(closest-side, ${c} 0%, ${rgba(
        c,
        0.62
      )} 45%, ${rgba(c, 0)} 100%)`;
      rules.push(
        animated
          ? `${decl};animation:${cls} ${dur}s ease-in-out infinite}\n@keyframes ${cls}{${[
              0, 0.25, 0.5, 0.75, 1,
            ]
              .map((k) => `${k * 100}%{transform:${tf(k)}}`)
              .join("")}}`
          : `${decl};transform:${tf(0)}}`
      );
    });

    let warpSvg = "";
    let warpCss = "";
    if (D >= 0.01) {
      const bf = 0.006 * (0.5 + D);
      const sc = (D * 260).toFixed(0);
      const anim = animated
        ? `<animate attributeName="baseFrequency" dur="${dur}s" repeatCount="indefinite" values="${bf.toFixed(
            4
          )} ${(bf * 1.6).toFixed(4)};${(bf * 1.5).toFixed(4)} ${bf.toFixed(
            4
          )};${bf.toFixed(4)} ${(bf * 1.6).toFixed(4)}"/>`
        : "";
      warpSvg = `
  <svg class="gm-defs" aria-hidden="true"><filter id="gm-warp" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency="${bf.toFixed(
    4
  )} ${(bf * 1.6).toFixed(
        4
      )}" numOctaves="3" seed="9" result="t">${anim}</feTurbulence><feDisplacementMap in="SourceGraphic" in2="t" scale="${sc}" xChannelSelector="R" yChannelSelector="G"/></filter></svg>`;
      warpCss = `\n.gm-warp{filter:url(#gm-warp)}\n.gm-defs{position:absolute;width:0;height:0}`;
    }

    const html = `<div class="gm">
  <div class="gm-layer${D >= 0.01 ? " gm-warp" : ""}">
${divs.join("\n")}
  </div>${warpSvg}${grainDiv}
</div>`;

    const css = `.gm{position:relative;width:100%;aspect-ratio:${ratio};overflow:hidden;background:${colors[0]};isolation:isolate}
.gm-layer{position:absolute;inset:0}
.gm-blob{position:absolute;border-radius:50%;filter:blur(24px)}
${rules.join("\n")}${warpCss}${grainCss}`;

    return `<!-- html — o warp usa um filtro SVG (feDisplacementMap); Chrome e Firefox renderizam bem, Safari pode variar -->\n${html}\n\n<style>\n${css}\n</style>`;
  }

  if (classicType === "linear") {
    const list = colors.join(", ");
    const css = animated
      ? `.gm{position:relative;width:100%;aspect-ratio:${ratio};overflow:hidden;background:linear-gradient(${angle}deg, ${list}, ${colors[0]});background-size:300% 300%;animation:gm-pan ${dur}s linear infinite}
@keyframes gm-pan{0%{background-position:0% 50%}100%{background-position:300% 50%}}${grainCss}`
      : `.gm{position:relative;width:100%;aspect-ratio:${ratio};overflow:hidden;background:linear-gradient(${angle}deg, ${list})}${grainCss}`;
    return `<!-- html -->\n<div class="gm">${grainDiv}\n</div>\n\n<style>\n${css}\n</style>`;
  }

  const list = colors.join(", ");
  const css = animated
    ? `.gm{position:relative;width:100%;aspect-ratio:${ratio};overflow:hidden;background:radial-gradient(circle at 50% 50%, ${list});background-size:180% 180%;background-position:50% 50%;animation:gm-breathe ${dur}s ease-in-out infinite}
@keyframes gm-breathe{0%,100%{background-size:160% 160%;background-position:50% 50%}50%{background-size:220% 220%;background-position:56% 44%}}${grainCss}`
    : `.gm{position:relative;width:100%;aspect-ratio:${ratio};overflow:hidden;background:radial-gradient(circle at 50% 50%, ${list})}${grainCss}`;
  return `<!-- html -->\n<div class="gm">${grainDiv}\n</div>\n\n<style>\n${css}\n</style>`;
}

/* ------------------------------------------------------------------ */
/* paleta, presets e variações — sempre o design system Softplan       */
/* ------------------------------------------------------------------ */

/* Cores do arquivo exportado (dados da peça), por isso valores e não tokens.
   Em ordem de intensidade: é a escada que as variações percorrem. A ordem do
   DS é #F0EAFF → #9A7CFF → #5C5CFF, e as versões escuras estendem até #2D2A58. */
const PALETA = [
  { hex: "#FFFFFF", nome: "Branco" },
  { hex: "#F7F5FF", nome: "Roxo 10" },
  { hex: "#F0EAFF", nome: "Roxo 20" },
  { hex: "#EAE2FF", nome: "Roxo 30" },
  { hex: "#9A7CFF", nome: "Roxo 40" },
  { hex: "#5C5CFF", nome: "Roxo 80" },
  { hex: "#2D2A58", nome: "Azul 80" },
];

const VARIACOES = [
  { id: -1, nome: "Suave", titulo: "Um degrau mais claro na paleta" },
  { id: 0, nome: "Original", titulo: "Como no render oficial" },
  { id: 1, nome: "Intensa", titulo: "Um degrau mais intenso, até o roxo 80" },
  { id: 2, nome: "Noturna", titulo: "A versão escura do DS: roxo 40, roxo 80 e azul 80" },
];

/* Cada variação troca cada cor da paleta por outra da paleta. Suave e intensa
   andam um degrau; a noturna segue a regra do DS para versões escuras — a
   progressão continua e estende até #2D2A58 — então os claros viram roxo 40,
   o roxo 40 vira roxo 80 e o roxo 80 vira azul 80. */
const MAPAS = {
  [-1]: { "#FFFFFF": "#FFFFFF", "#F7F5FF": "#FFFFFF", "#F0EAFF": "#F7F5FF", "#EAE2FF": "#F0EAFF", "#9A7CFF": "#EAE2FF", "#5C5CFF": "#9A7CFF", "#2D2A58": "#5C5CFF" },
  1: { "#FFFFFF": "#F7F5FF", "#F7F5FF": "#F0EAFF", "#F0EAFF": "#EAE2FF", "#EAE2FF": "#9A7CFF", "#9A7CFF": "#5C5CFF", "#5C5CFF": "#5C5CFF", "#2D2A58": "#2D2A58" },
  2: { "#FFFFFF": "#9A7CFF", "#F7F5FF": "#9A7CFF", "#F0EAFF": "#9A7CFF", "#EAE2FF": "#9A7CFF", "#9A7CFF": "#5C5CFF", "#5C5CFF": "#2D2A58", "#2D2A58": "#2D2A58" },
};
const variar = (cor, passo) => (passo && MAPAS[passo][cor.toUpperCase()]) || cor;

/* Os nove gradientes oficiais da marca (assets/gradients/gradient-0N.png do
   DS), refeitos como mesh editável: fundo + manchas, com cor, posição (0–1
   no quadro) e raio (fração do lado maior). Ajustados por otimização sobre
   cada render, com as cores presas à paleta acima. Na ordem da prancha. */
const PRESETS = [
  {
    original: "gradient-05",
    fundo: "#9A7CFF",
    manchas: [
      { cor: "#F7F5FF", x: -0.09, y: 1.307, r: 0.665 },
      { cor: "#FFFFFF", x: -0.004, y: 0.055, r: 0.42 },
      { cor: "#5C5CFF", x: 0.851, y: 0.011, r: 0.513 },
      { cor: "#F7F5FF", x: -0.097, y: 0.446, r: 0.958 },
    ],
  },
  {
    original: "gradient-09",
    fundo: "#F7F5FF",
    manchas: [
      { cor: "#9A7CFF", x: 0.035, y: 0.1, r: 0.281 },
      { cor: "#EAE2FF", x: 0.372, y: 0.936, r: 0.286 },
      { cor: "#5C5CFF", x: 0.953, y: 0.999, r: 0.694 },
      { cor: "#FFFFFF", x: 0.885, y: 0.003, r: 0.422 },
      { cor: "#9A7CFF", x: 0.189, y: 0.077, r: 0.536 },
    ],
  },
  {
    original: "gradient-08",
    fundo: "#9A7CFF",
    manchas: [
      { cor: "#5C5CFF", x: 0.937, y: 0.032, r: 0.488 },
      { cor: "#FFFFFF", x: -0.153, y: -0.244, r: 0.478 },
      { cor: "#F7F5FF", x: -0.291, y: 1.337, r: 1.027 },
      { cor: "#FFFFFF", x: -0.079, y: -0.0, r: 0.555 },
      { cor: "#FFFFFF", x: 0.981, y: 1.123, r: 0.51 },
    ],
  },
  {
    original: "gradient-07",
    fundo: "#5C5CFF",
    manchas: [
      { cor: "#F0EAFF", x: -0.267, y: 0.213, r: 0.932 },
      { cor: "#9A7CFF", x: 0.93, y: 0.908, r: 0.599 },
      { cor: "#FFFFFF", x: 0.94, y: 0.088, r: 0.469 },
      { cor: "#5C5CFF", x: 0.499, y: 0.829, r: 0.425 },
      { cor: "#FFFFFF", x: 0.001, y: 0.903, r: 0.439 },
    ],
  },
  {
    original: "gradient-04",
    fundo: "#5C5CFF",
    manchas: [
      { cor: "#FFFFFF", x: 1.003, y: 0.586, r: 0.729 },
      { cor: "#5C5CFF", x: 0.343, y: 0.526, r: 0.499 },
      { cor: "#9A7CFF", x: 0.661, y: 0.483, r: 0.537 },
      { cor: "#FFFFFF", x: 1.108, y: -0.181, r: 0.68 },
      { cor: "#FFFFFF", x: 1.053, y: 0.889, r: 0.567 },
    ],
  },
  {
    original: "gradient-06",
    fundo: "#9A7CFF",
    manchas: [
      { cor: "#FFFFFF", x: 0.935, y: 0.832, r: 0.43 },
      { cor: "#5C5CFF", x: 0.899, y: -0.011, r: 0.338 },
      { cor: "#FFFFFF", x: 0.649, y: 1.048, r: 0.539 },
      { cor: "#FFFFFF", x: 0.102, y: 1.117, r: 0.422 },
      { cor: "#5C5CFF", x: 0.049, y: 0.026, r: 0.417 },
    ],
  },
  {
    original: "gradient-03",
    fundo: "#F0EAFF",
    manchas: [
      { cor: "#5C5CFF", x: 0.982, y: 0.008, r: 0.738 },
      { cor: "#F7F5FF", x: 0.356, y: 1.371, r: 0.826 },
      { cor: "#9A7CFF", x: 0.069, y: -0.087, r: 0.572 },
    ],
  },
  {
    original: "gradient-02",
    fundo: "#9A7CFF",
    manchas: [
      { cor: "#FFFFFF", x: 0.342, y: 0.495, r: 0.631 },
      { cor: "#FFFFFF", x: 0.196, y: 0.623, r: 0.723 },
      { cor: "#5C5CFF", x: 0.948, y: 0.048, r: 0.492 },
      { cor: "#FFFFFF", x: 0.613, y: 0.905, r: 0.265 },
      { cor: "#FFFFFF", x: 0.189, y: 0.634, r: 0.764 },
    ],
  },
  {
    original: "gradient-01",
    fundo: "#EAE2FF",
    manchas: [
      { cor: "#9A7CFF", x: -0.06, y: 0.807, r: 1.087 },
      { cor: "#FFFFFF", x: 0.853, y: 0.096, r: 0.405 },
      { cor: "#5C5CFF", x: 0.069, y: 0.019, r: 0.562 },
      { cor: "#FFFFFF", x: 0.918, y: 0.213, r: 0.787 },
    ],
  },
];

const SIZES = [
  { label: "1920 × 1080", w: 1920, h: 1080 },
  { label: "1080 × 1080", w: 1080, h: 1080 },
  { label: "1080 × 1350", w: 1080, h: 1350 },
  { label: "1080 × 1920", w: 1080, h: 1920 },
  { label: "2560 × 1440", w: 2560, h: 1440 },
  { label: "1200 × 630", w: 1200, h: 630 },
];

/* a cor 0 é o fundo; a mancha dela não aparece (mesma cor sobre a mesma cor) */
function doPreset(p, passo) {
  return {
    colors: [p.fundo, ...p.manchas.map((m) => m.cor)].map((c) => variar(c, passo)),
    layout: [{ x: 0.5, y: 0.5, r: 0.4 }, ...p.manchas.map(({ x, y, r }) => ({ x, y, r }))],
  };
}

/* as manchas do motor (makeBlobs) dão o movimento; a posição de partida vem do layout */
function comLayout(blobs, layout) {
  return blobs.map((b, i) => (layout[i] ? { ...b, bx: layout[i].x, by: layout[i].y, br: layout[i].r } : b));
}

/* miniatura de cada preset, desenhada pelo mesmo drawScene do palco */
function miniatura(p, passo) {
  const c = document.createElement("canvas");
  c.width = 192;
  c.height = 108;
  const { colors, layout } = doPreset(p, passo);
  const blobs = comLayout(makeBlobs(7, colors.length), layout);
  drawScene(c.getContext("2d"), c.width, c.height, 0, {
    mode: "mesh", classicType: "linear", angle: 0, colors, turbulence: 0, distort: 0, grain: 0, blobs,
  }, null, {});
  return c.toDataURL("image/png");
}

/* ------------------------------------------------------------------ */
/* ferramenta                                                          */
/* ------------------------------------------------------------------ */

export default function GradientStudio() {
  const [tema, alternarTema] = useTema();

  const inicial = useMemo(() => doPreset(PRESETS[0], 0), []);
  const [presetAtivo, setPresetAtivo] = useState(0);
  const [variacao, setVariacao] = useState(0);
  const [mode, setMode] = useState("mesh");
  const [classicType, setClassicType] = useState("linear");
  const [angle, setAngle] = useState(135);
  /* base = as cores no "Original" (do preset, ou as últimas que você editou);
     colors = a base passada pela variação escolhida */
  const [base, setBase] = useState(inicial.colors);
  const [colors, setColors] = useState(inicial.colors);
  const [layout, setLayout] = useState(inicial.layout);
  const [speed, setSpeed] = useState(30);
  const [turbulence, setTurbulence] = useState(25);
  const [distort, setDistort] = useState(0);
  const [grain, setGrain] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [seed, setSeed] = useState(7);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [recording, setRecording] = useState(false);
  const [recProgress, setRecProgress] = useState(0);
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeAnimated, setCodeAnimated] = useState(true);
  const [status, setStatus] = useState("");

  const canvasRef = useRef(null);
  const phaseRef = useRef(0);
  const lastRef = useRef(0);
  const stopRecRef = useRef(null);
  const bufRef = useRef({});

  const tiles = useMemo(() => makeNoiseTiles(6, 180), []);
  const blobs = useMemo(() => comLayout(makeBlobs(seed, colors.length), layout), [seed, colors.length, layout]);
  const size = SIZES[sizeIdx];
  const miniaturas = useMemo(() => PRESETS.map((p) => miniatura(p, variacao)), [variacao]);

  const loopDur = useMemo(() => (speed === 0 ? 0 : 15 - 12 * (speed / 100)), [speed]);

  const cfg = useMemo(
    () => ({ mode, classicType, angle, colors, turbulence, distort, grain, blobs, seed }),
    [mode, classicType, angle, colors, turbulence, distort, grain, blobs, seed]
  );

  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;
  const loopRef = useRef(loopDur);
  loopRef.current = loopDur;
  const playRef = useRef(playing);
  playRef.current = playing;

  /* palco: o mesmo drawScene do PNG e do vídeo, a cada quadro */
  useEffect(() => {
    let raf;
    const tick = (now) => {
      const c = canvasRef.current;
      if (c) {
        const dt = lastRef.current ? (now - lastRef.current) / 1000 : 0;
        lastRef.current = now;
        if (playRef.current && loopRef.current > 0) {
          phaseRef.current = (phaseRef.current + dt / loopRef.current) % 1;
        }
        drawScene(c.getContext("2d"), c.width, c.height, phaseRef.current, cfgRef.current, tiles, bufRef.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [tiles]);

  /* o canvas do palco segue a proporção do arquivo exportado */
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const scale = Math.min(1, 1280 / Math.max(size.w, size.h));
    c.width = Math.round(size.w * scale);
    c.height = Math.round(size.h * scale);
  }, [size]);

  /* ---------------------------------------------------------------- */

  const aplicarPreset = (i) => {
    const { colors: cs, layout: ly } = doPreset(PRESETS[i], 0);
    setPresetAtivo(i);
    setBase(cs);
    setColors(cs.map((c) => variar(c, variacao)));
    setLayout(ly);
    setSeed(7);
    setMode("mesh");
  };

  const mudarVariacao = (passo) => {
    setVariacao(passo);
    setColors(base.map((c) => variar(c, passo)));
  };

  /* editar as cores à mão faz delas o novo "Original" */
  const editarCores = (novas) => {
    setBase(novas);
    setColors(novas);
    setVariacao(0);
    setPresetAtivo(null);
  };

  const setColor = (i, v) => editarCores(colors.map((c, j) => (j === i ? v : c)));

  const addColor = () => {
    if (colors.length >= 6) return;
    const rnd = mulberry32(Math.floor(Math.random() * 99999));
    editarCores([...colors, PALETA[4].hex]);
    setLayout((ly) => [...ly, { x: rnd(), y: rnd(), r: 0.3 + rnd() * 0.3 }]);
  };

  const removeColor = (i) => {
    if (colors.length <= 2) return;
    editarCores(colors.filter((_, j) => j !== i));
    setLayout((ly) => ly.filter((_, j) => j !== i));
  };

  /* sorteia só as posições, mantendo as cores escolhidas */
  const sortearPosicoes = () => {
    const novo = Math.floor(Math.random() * 99999);
    setSeed(novo);
    setLayout(makeBlobs(novo, colors.length).map((b) => ({ x: b.bx, y: b.by, r: b.br })));
    setPresetAtivo(null);
  };

  const download = (blob, name) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const exportPNG = () => {
    const c = document.createElement("canvas");
    c.width = size.w;
    c.height = size.h;
    drawScene(c.getContext("2d"), size.w, size.h, phaseRef.current, cfg, tiles, {});
    c.toBlob((b) => {
      if (b) download(b, `gradiente-${size.w}x${size.h}.png`);
      setStatus("PNG salvo");
    }, "image/png");
  };

  const exportSVG = () => {
    const svg = buildSVG(cfg, phaseRef.current, size.w, size.h);
    download(new Blob([svg], { type: "image/svg+xml" }), `gradiente-${size.w}x${size.h}.svg`);
    setStatus("SVG salvo");
  };

  const pickMime = () => {
    const opts = ["video/mp4;codecs=avc1.42E01E", "video/mp4", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
    for (const m of opts) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) return m;
    }
    return "";
  };

  /* grava um ciclo inteiro, então o vídeo repete sem emenda */
  const recordVideo = useCallback(() => {
    if (loopDur === 0) {
      setStatus("Aumente a velocidade para gravar o vídeo");
      return;
    }
    const c = document.createElement("canvas");
    c.width = size.w;
    c.height = size.h;
    const ctx = c.getContext("2d");
    const recBuf = {};
    const stream = c.captureStream(30);
    const mime = pickMime();
    let rec;
    try {
      rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 14000000 } : undefined);
    } catch {
      setStatus("Este navegador não permite gravar vídeo do canvas");
      return;
    }
    const ext = (rec.mimeType || mime || "video/webm").includes("mp4") ? "mp4" : "webm";
    const chunks = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      download(new Blob(chunks, { type: rec.mimeType || "video/webm" }), `gradiente-${size.w}x${size.h}.${ext}`);
      setRecording(false);
      setRecProgress(0);
      setStatus(`Vídeo ${ext.toUpperCase()} salvo`);
    };

    setRecording(true);
    setStatus("");
    rec.start();
    const t0 = performance.now();
    let raf;
    const step = (now) => {
      const el = (now - t0) / 1000;
      const ph = (el / loopDur) % 1;
      drawScene(ctx, size.w, size.h, ph, cfgRef.current, tiles, recBuf);
      setRecProgress(Math.min(1, el / loopDur));
      if (el < loopDur && stopRecRef.current !== "abort") {
        raf = requestAnimationFrame(step);
      } else {
        cancelAnimationFrame(raf);
        stopRecRef.current = null;
        rec.stop();
      }
    };
    raf = requestAnimationFrame(step);
  }, [loopDur, size, tiles]);

  const code = useMemo(
    () => buildCode(cfg, Math.max(2, Math.round(loopDur || 8)), codeAnimated, size.w, size.h),
    [cfg, loopDur, codeAnimated, size]
  );

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("Código copiado");
    } catch {
      setStatus("Selecione o texto e copie manualmente");
    }
  };

  /* ---------------------------------------------------------------- */

  return (
    <div className="ferramenta">
      <aside className="painel">
        <Header tool="Gradient Studio" homeHref={HUB_URL} tema={tema} onToggleTema={alternarTema} />

        <section className="secao">
          <h2 className="secao-titulo">Gradientes da marca</h2>
          <div className="gs-presets" role="group" aria-label="Gradientes da marca">
            {PRESETS.map((p, i) => (
              <button key={p.original} type="button" aria-pressed={presetAtivo === i}
                aria-label={`Gradiente ${String(i + 1).padStart(2, "0")}`} title={`Gradiente ${String(i + 1).padStart(2, "0")}`}
                onClick={() => aplicarPreset(i)}>
                <img src={miniaturas[i]} alt="" />
              </button>
            ))}
          </div>
          <Linha rotulo="Intensidade">
            <Segmentado rotulo="Intensidade" opcoes={VARIACOES} valor={variacao} onChange={mudarVariacao} />
          </Linha>
          <p className="nota">
            Os nove renders oficiais, editáveis. A intensidade troca cada cor por outra da paleta do DS: mais
            lavanda no suave, mais roxo no intenso, e a versão escura no noturno.
          </p>
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Tipo</h2>
          <Linha rotulo="Desenho">
            <Segmentado rotulo="Desenho" valor={mode} onChange={setMode}
              opcoes={[{ id: "mesh", nome: "Mesh" }, { id: "classic", nome: "Clássico" }]} />
          </Linha>
          {mode === "classic" && (
            <>
              <Linha rotulo="Forma">
                <Segmentado rotulo="Forma" valor={classicType} onChange={setClassicType}
                  opcoes={[{ id: "linear", nome: "Linear" }, { id: "radial", nome: "Radial" }]} />
              </Linha>
              {classicType === "linear" && (
                <Controle rotulo="Ângulo" unidade="°" min={0} max={360} valor={angle} onChange={setAngle} />
              )}
            </>
          )}
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Movimento</h2>
          <Controle rotulo="Velocidade" unidade="%" min={0} max={100} valor={speed} onChange={setSpeed} />
          <p className="nota gs-nota">
            {speed === 0 ? "Parado: gradiente estático." : <>Ciclo de <span className="num">{loopDur.toFixed(1)}</span> s.</>}
          </p>
          <Controle rotulo="Turbulência" unidade="%" min={0} max={100} valor={turbulence} onChange={setTurbulence} />
          {mode === "mesh" && (
            <>
              <Controle rotulo="Distorção" unidade="%" min={0} max={100} valor={distort} onChange={setDistort} />
              <p className="nota gs-nota">Deforma o campo inteiro, como tecido ou água.</p>
            </>
          )}
          <Controle rotulo="Granulação" unidade="%" min={0} max={100} valor={grain} onChange={setGrain} />
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Cores · <span className="num">{colors.length}</span> de 6</h2>
          {colors.map((c, i) => (
            <div className="gs-cor" key={i}>
              <span className="gs-cor-nome">{i === 0 ? "Fundo" : `Cor ${i + 1}`}</span>
              <div className="gs-amostras" role="group" aria-label={i === 0 ? "Cor do fundo" : `Cor ${i + 1}`}>
                {PALETA.map((p) => (
                  <button key={p.hex} type="button" aria-pressed={c.toUpperCase() === p.hex}
                    title={`${p.nome} ${p.hex}`} aria-label={p.nome}
                    style={{ background: p.hex }} onClick={() => setColor(i, p.hex)} />
                ))}
              </div>
              <button type="button" className="gs-remover" onClick={() => removeColor(i)}
                disabled={colors.length <= 2} aria-label={`Remover ${i === 0 ? "fundo" : `cor ${i + 1}`}`}>×</button>
            </div>
          ))}
          <div className="botoes gs-botoes">
            <button type="button" className="botao" onClick={addColor} disabled={colors.length >= 6}>+ Cor</button>
            <button type="button" className="botao" onClick={sortearPosicoes}>Sortear posições</button>
          </div>
          <p className="nota">Só cores da paleta Softplan. No mesh, a primeira é o fundo e as outras são manchas por cima.</p>
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Exportar</h2>
          <Linha rotulo="Tamanho" htmlFor="gs-tamanho">
            <select id="gs-tamanho" className="selecao" value={sizeIdx} onChange={(e) => setSizeIdx(Number(e.target.value))}>
              {SIZES.map((sz, i) => <option key={sz.label} value={i}>{sz.label} px</option>)}
            </select>
          </Linha>
          <div className="botoes">
            <button type="button" className="botao botao--primario" onClick={exportPNG}>PNG</button>
            <button type="button" className="botao" onClick={exportSVG}>SVG</button>
            {recording ? (
              <button type="button" className="botao gs-gravando" onClick={() => (stopRecRef.current = "abort")}>
                Parar · <span className="num">{Math.round(recProgress * 100)}%</span>
              </button>
            ) : (
              <button type="button" className="botao" onClick={recordVideo} disabled={loopDur === 0}>Vídeo</button>
            )}
            <button type="button" className="botao" aria-pressed={codeOpen} onClick={() => setCodeOpen((v) => !v)}>Código</button>
          </div>
          <p className="nota gs-nota-topo">
            {loopDur > 0
              ? "O vídeo grava um ciclo inteiro, então repete sem emenda. Sai em MP4 onde o navegador suporta; senão, WebM."
              : "Velocidade em 0: exporte em PNG ou SVG."}
          </p>
        </section>
      </aside>

      <main className="palco">
        <div className="barra gs-barra">
          <span>{mode === "mesh" ? "Mesh" : classicType === "linear" ? "Linear" : "Radial"}</span>
          <span className="num">{size.w} × {size.h} px</span>
          <span>{loopDur > 0 ? <>Loop de <span className="num">{loopDur.toFixed(1)}</span> s</> : "Estático"}</span>
          {status && <span className="gs-status">{status}</span>}
          <button type="button" className="botao gs-play" onClick={() => setPlaying((v) => !v)} disabled={loopDur === 0}>
            {playing ? "Pausar" : "Reproduzir"}
          </button>
        </div>

        <div className="palco-area">
          <canvas ref={canvasRef} className="documento" />
        </div>

        {codeOpen && (
          <div className="gs-codigo">
            <div className="gs-codigo-cab">
              <Segmentado rotulo="Código" valor={codeAnimated ? "anim" : "static"} onChange={(v) => setCodeAnimated(v === "anim")}
                opcoes={[{ id: "static", nome: "Estático" }, { id: "anim", nome: "Animado" }]} className="gs-codigo-modo" />
              <button type="button" className="botao botao--primario" onClick={copyCode}>Copiar</button>
            </div>
            <textarea readOnly value={code} spellCheck={false} aria-label="Código do gradiente" />
          </div>
        )}
      </main>
    </div>
  );
}
