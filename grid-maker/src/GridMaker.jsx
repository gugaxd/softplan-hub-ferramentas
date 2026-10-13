import { useCallback, useMemo, useRef, useState } from "react";
import Header from "../../src/comum/Header.jsx";
import { HUB_URL } from "../../src/comum/hub.js";
import { useTema } from "../../src/comum/tema.js";
import { Controle, Linha, Marcador, Segmentado } from "../../src/comum/controles.jsx";

/* ---------------------------------------------------------------------------
   Grid Maker — grids modulares com formas, ocupação de várias células e
   escalonamento progressivo. Exporta SVG vetorial e PNG.

   Feito a partir do grid maker do the hub. A geometria (malha, ocupação,
   escalonamento, formas paramétricas) e a exportação vieram sem mudança de
   lógica; a interface foi refeita na casca deste hub, e as cores da arte
   partem da paleta Softplan, com o Softpoint como forma inicial.

   O que você vê é o que sai: a exportação serializa o próprio SVG do palco,
   sem a camada de interface (data-ui).
--------------------------------------------------------------------------- */

/* Cores da arte (dados do arquivo exportado), por isso valores e não tokens. */
const PALETA = [
  { hex: "#FFFFFF", nome: "Branco" },
  { hex: "#F7F5FF", nome: "Roxo 10" },
  { hex: "#F0EAFF", nome: "Roxo 20" },
  { hex: "#9A7CFF", nome: "Roxo 40" },
  { hex: "#5C5CFF", nome: "Roxo 80" },
  { hex: "#575392", nome: "Azul 60" },
  { hex: "#2D2A58", nome: "Azul 80" },
  { hex: "#181A27", nome: "Azul 100" },
];
const ARTE = { bg: "#F7F5FF", fill: "#5C5CFF", stroke: "#2D2A58" };

/* ------------------------------------------------------------------ */
/* Formas — todas normalizadas em viewBox 0 0 100 100                   */
/* ------------------------------------------------------------------ */
/* Formas paramétricas: redesenhadas no tamanho real do bloco, para que o raio
   dos cantos permaneça constante em qualquer proporção. */
const pathArredondado = (w, h, r) => {
  const k = Math.max(0, Math.min(r, w / 2, h / 2));
  return `M${k},0 H${w - k} A${k},${k} 0 0 1 ${w},${k} V${h - k} A${k},${k} 0 0 1 ${w - k},${h} H${k} A${k},${k} 0 0 1 0,${h - k} V${k} A${k},${k} 0 0 1 ${k},0 Z`;
};
const pathFolha = (w, h, r) => {
  const k = Math.max(0, Math.min(r, w / 2, h / 2));
  return `M${k},0 H${w} V${h - k} A${k},${k} 0 0 1 ${w - k},${h} H0 V${k} A${k},${k} 0 0 1 ${k},0 Z`;
};

/* Softpoint: o raio do logo sobre a largura dele (275,14 / 994,92) */
const RAIO_SOFTPOINT = 0.2765;

const SHAPES = {
  softpoint: {
    label: "Softpoint",
    el: <path className="shp" d={pathFolha(100, 100, RAIO_SOFTPOINT * 100)} />,
    param: pathFolha,
    /* o raio da marca é 27,65% do lado — é o que dá a silhueta reconhecível */
    raio: (lado) => Math.round(lado * RAIO_SOFTPOINT),
  },
  quadrado: { label: "Quadrado", el: <rect className="shp" x="0" y="0" width="100" height="100" /> },
  arredondado: {
    label: "Arredondado",
    el: <rect className="shp" x="0" y="0" width="100" height="100" rx="22" ry="22" />,
    param: pathArredondado,
  },
  folha: {
    label: "Folha",
    el: <path className="shp" d={pathFolha(100, 100, 22)} />,
    param: pathFolha,
  },
  retangulo: {
    label: "Retângulo",
    el: <rect className="shp" x="0" y="22" width="100" height="56" />,
  },
  barra: { label: "Barra", el: <rect className="shp" x="38" y="0" width="24" height="100" /> },
  circulo: { label: "Círculo", el: <circle className="shp" cx="50" cy="50" r="50" /> },
  anel: {
    label: "Anel",
    el: <path className="shp" fillRule="evenodd" d="M50 0a50 50 0 1 0 .1 0zM50 28a22 22 0 1 1-.1 0z" />,
  },
  triangulo: { label: "Triângulo", el: <polygon className="shp" points="50,2 98,98 2,98" /> },
  losango: { label: "Losango", el: <polygon className="shp" points="50,0 100,50 50,100 0,50" /> },
  hexagono: { label: "Hexágono", el: <polygon className="shp" points="25,3 75,3 100,50 75,97 25,97 0,50" /> },
  cruz: {
    label: "Cruz",
    el: <polygon className="shp" points="35,0 65,0 65,35 100,35 100,65 65,65 65,100 35,100 35,65 0,65 0,35 35,35" />,
  },
  estrela: {
    label: "Estrela",
    el: <polygon className="shp" points="50,0 61,35 98,35 68,57 79,92 50,70 21,92 32,57 2,35 39,35" />,
  },
  semicirculo: { label: "Semicírculo", el: <path className="shp" d="M0 100A50 50 0 0 1 100 100Z" /> },
};

const CANVASES = [
  { id: "a4r", label: "A4 retrato", w: 2480, h: 3508 },
  { id: "a4p", label: "A4 paisagem", w: 3508, h: 2480 },
  { id: "a3r", label: "A3 retrato", w: 3508, h: 4961 },
  { id: "quad", label: "Quadrado 2000", w: 2000, h: 2000 },
  { id: "ig", label: "Feed (Instagram, Facebook)", w: 1080, h: 1350 },
  { id: "story", label: "Vertical (story, LinkedIn)", w: 1080, h: 1920 },
  { id: "hd", label: "1920 × 1080", w: 1920, h: 1080 },
];

const ESCALA_DIR = [
  { id: "none", label: "Nenhuma" },
  { id: "rows", label: "Linhas" },
  { id: "cols", label: "Colunas" },
  { id: "diag", label: "Diagonal" },
  { id: "radial", label: "Radial" },
];

/* Cor: amostras da paleta Softplan + uma cor livre, para casos fora da marca */
function Cor({ rotulo, valor, onChange }) {
  const naPaleta = PALETA.some((p) => p.hex.toLowerCase() === valor.toLowerCase());
  return (
    <div className="controle gm-cor">
      <span className="rotulo">{rotulo}</span>
      <input className={"cor gm-livre" + (naPaleta ? "" : " gm-livre--ativa")} type="color"
        value={valor} onChange={(e) => onChange(e.target.value)} aria-label={`${rotulo}: cor livre`} title="Cor livre" />
      <div className="gm-amostras" role="group" aria-label={rotulo}>
        {PALETA.map((p) => (
          <button key={p.hex} type="button" aria-pressed={p.hex.toLowerCase() === valor.toLowerCase()}
            title={`${p.nome} ${p.hex}`} aria-label={p.nome} style={{ background: p.hex }} onClick={() => onChange(p.hex)} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                  */
/* ------------------------------------------------------------------ */
export default function GridMaker() {
  const [tema, alternarTema] = useTema();
  const svgRef = useRef(null);
  const fileRef = useRef(null);

  const [canvasId, setCanvasId] = useState("ig");
  const [custW, setCustW] = useState(1200);
  const [custH, setCustH] = useState(1600);
  const [unidade, setUnidade] = useState("px");
  const [dpi, setDpi] = useState(300);
  const [cols, setCols] = useState(6);
  const [rows, setRows] = useState(8);
  const [cell, setCell] = useState(120);
  const [gap, setGap] = useState(28);

  const [shape, setShape] = useState("softpoint");
  const [raioCanto, setRaioCanto] = useState(SHAPES.softpoint.raio(120));
  const [custom, setCustom] = useState(null); // {viewBox, inner, name}
  const [forceColor, setForceColor] = useState(true);

  const [rot, setRot] = useState(0);
  const [op, setOp] = useState(100);
  const [escala, setEscala] = useState(1);
  const [escalaDir, setEscalaDir] = useState("none");

  const [bg, setBg] = useState(ARTE.bg);
  const [fill, setFill] = useState(ARTE.fill);
  const [modo, setModo] = useState("fill"); // fill | stroke | both
  const [strokeColor, setStrokeColor] = useState(ARTE.stroke);
  const [stroke, setStroke] = useState(4);
  const [fillOp, setFillOp] = useState(100);
  const [strokeOp, setStrokeOp] = useState(100);

  const [over, setOver] = useState({}); // "r:c" -> {rot, op, scale, hidden}
  const [sel, setSel] = useState(null);
  const [scale, setScale] = useState(2);
  const [busy, setBusy] = useState("");

  /* medidas físicas convertidas para pixels na resolução escolhida */
  const paraPx = useCallback(
    (v) => {
      if (unidade === "px") return Math.round(v);
      if (unidade === "mm") return Math.round((v / 25.4) * dpi);
      if (unidade === "cm") return Math.round((v / 2.54) * dpi);
      return Math.round(v * dpi); // polegadas
    },
    [unidade, dpi]
  );

  const canvas = useMemo(() => {
    if (canvasId !== "custom") return CANVASES.find((c) => c.id === canvasId);
    return {
      id: "custom",
      label: "Personalizado",
      w: Math.max(16, Math.min(20000, paraPx(custW))),
      h: Math.max(16, Math.min(20000, paraPx(custH))),
    };
  }, [canvasId, custW, custH, paraPx]);

  const usingCustom = shape === "custom" && custom;
  const paramFn = !usingCustom ? SHAPES[shape]?.param : null;
  const vb = usingCustom ? custom.viewBox : "0 0 100 100";

  /* ---- geometria -------------------------------------------------- */
  const pitch = cell + gap;
  const gridW = cols * cell + (cols - 1) * gap;
  const gridH = rows * cell + (rows - 1) * gap;
  const startX = (canvas.w - gridW) / 2;
  const startY = (canvas.h - gridH) / 2;

  const fatorEscala = useCallback(
    (r, c) => {
      if (escalaDir === "none") return 1;
      let t = 0;
      if (escalaDir === "rows") t = rows > 1 ? r / (rows - 1) : 0;
      else if (escalaDir === "cols") t = cols > 1 ? c / (cols - 1) : 0;
      else if (escalaDir === "diag") {
        const d = rows - 1 + (cols - 1);
        t = d > 0 ? (r + c) / d : 0;
      } else if (escalaDir === "radial") {
        const cr = (rows - 1) / 2;
        const cc = (cols - 1) / 2;
        const maxD = Math.hypot(cr, cc) || 1;
        t = Math.hypot(r - cr, c - cc) / maxD;
      }
      return 1 + (escala - 1) * t;
    },
    [escalaDir, escala, rows, cols]
  );

  /* mapa de ocupação: um módulo pode cobrir várias colunas e/ou linhas */
  const { celulas, ocupadas } = useMemo(() => {
    const ocup = new Set();
    const ancoras = Object.entries(over)
      .filter(([, v]) => (v.spanC ?? 1) > 1 || (v.spanR ?? 1) > 1)
      .map(([k, v]) => {
        const [r, c] = k.split(":").map(Number);
        return { key: k, r, c, sr: v.spanR ?? 1, sc: v.spanC ?? 1 };
      })
      .sort((a, b) => a.r - b.r || a.c - b.c);

    const spanDe = {};
    for (const a of ancoras) {
      if (ocup.has(a.key)) continue; // âncora já coberta por outro bloco
      const sr = Math.min(a.sr, rows - a.r);
      const sc = Math.min(a.sc, cols - a.c);
      if (sr <= 1 && sc <= 1) continue;
      let livre = true;
      for (let r = a.r; r < a.r + sr && livre; r++)
        for (let c = a.c; c < a.c + sc; c++)
          if (ocup.has(`${r}:${c}`)) { livre = false; break; }
      if (!livre) continue;
      spanDe[a.key] = { sr, sc };
      for (let r = a.r; r < a.r + sr; r++)
        for (let c = a.c; c < a.c + sc; c++)
          if (!(r === a.r && c === a.c)) ocup.add(`${r}:${c}`);
    }

    const out = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const key = `${r}:${c}`;
        if (ocup.has(key)) continue;
        const o = over[key] || {};
        const { sr, sc } = spanDe[key] || { sr: 1, sc: 1 };
        const bw = sc * cell + (sc - 1) * gap; // cobre as células inteiras
        const bh = sr * cell + (sr - 1) * gap;
        const f = fatorEscala(r, c) * (o.scale ?? 1);
        const sw = bw * f;
        const sh = bh * f;
        const cx = startX + c * pitch + bw / 2;
        const cy = startY + r * pitch + bh / 2;
        out.push({
          key, r, c, sr, sc, bw, bh, sw, sh,
          x: cx - sw / 2,
          y: cy - sh / 2,
          cx, cy,
          par: sr === sc ? "xMidYMid meet" : "none",
          rot: rot + (o.rot ?? 0),
          hidden: !!o.hidden,
        });
      }
    }
    return { celulas: out, ocupadas: ocup };
  }, [rows, cols, over, fatorEscala, cell, gap, startX, startY, pitch, rot]);

  const totalVisivel = celulas.filter((c) => !c.hidden).length;

  /* ---- upload SVG ------------------------------------------------- */
  const carregarSvg = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const doc = new DOMParser().parseFromString(String(reader.result), "image/svg+xml");
        const root = doc.querySelector("svg");
        if (!root) throw new Error("sem tag svg");
        root.querySelectorAll("script, foreignObject").forEach((n) => n.remove());
        let viewBox = root.getAttribute("viewBox");
        if (!viewBox) {
          const w = parseFloat(root.getAttribute("width")) || 100;
          const h = parseFloat(root.getAttribute("height")) || 100;
          viewBox = `0 0 ${w} ${h}`;
        }
        setCustom({ viewBox, inner: root.innerHTML, name: file.name });
        setShape("custom");
        setBusy("");
      } catch {
        setBusy("Não consegui ler esse arquivo. Envie um SVG válido.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  /* ---- exportação ------------------------------------------------- */
  const serializar = () => {
    const clone = svgRef.current.cloneNode(true);
    clone.querySelectorAll("[data-ui]").forEach((n) => n.remove());
    clone.removeAttribute("class");
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", canvas.w);
    clone.setAttribute("height", canvas.h);
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone);
  };

  const baixar = (blob, nome) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nome;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const nomeBase = `grid-${cols}x${rows}-${usingCustom ? "custom" : shape}`;

  const exportarSvg = () => {
    baixar(new Blob([serializar()], { type: "image/svg+xml" }), `${nomeBase}.svg`);
    setBusy("SVG exportado.");
  };

  const exportarPng = () => {
    setBusy("Renderizando PNG…");
    const str = serializar();
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement("canvas");
      cv.width = Math.round(canvas.w * scale);
      cv.height = Math.round(canvas.h * scale);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      cv.toBlob((b) => {
        baixar(b, `${nomeBase}@${scale}x.png`);
        setBusy(`PNG exportado: ${cv.width} × ${cv.height} px.`);
      }, "image/png");
    };
    img.onerror = () => setBusy("Falha ao rasterizar. Tente exportar em SVG.");
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(str);
  };

  /* ---- ações ------------------------------------------------------ */
  const preencher = () => {
    setCols(Math.max(1, Math.floor((canvas.w + gap) / pitch)));
    setRows(Math.max(1, Math.floor((canvas.h + gap) / pitch)));
  };

  const ajustarModulo = () => {
    const cw = (canvas.w - (cols - 1) * gap) / cols;
    const ch = (canvas.h - (rows - 1) * gap) / rows;
    setCell(Math.max(4, Math.round(Math.min(cw, ch))));
  };

  const restaurarCores = () => {
    setBg(ARTE.bg);
    setFill(ARTE.fill);
    setStrokeColor(ARTE.stroke);
  };

  const setOverride = (patch) => {
    if (!sel) return;
    setOver((p) => ({ ...p, [sel]: { ...(p[sel] || {}), ...patch } }));
  };

  const selData = sel ? over[sel] || {} : null;
  const dirSpan = selData?.dirSpan ?? "prop";
  const nSpan = Math.max(selData?.spanR ?? 1, selData?.spanC ?? 1);
  const spanC = selData?.spanC ?? 1;
  const spanR = selData?.spanR ?? 1;
  const aplicarSpan = (dir, n) => {
    if (dir === "h") setOverride({ dirSpan: "h", spanC: n, spanR: 1 });
    else if (dir === "v") setOverride({ dirSpan: "v", spanR: n, spanC: 1 });
    else if (dir === "livre") setOverride({ dirSpan: "livre", spanC, spanR });
    else setOverride({ dirSpan: "prop", spanR: n, spanC: n });
  };
  const maxCell = Math.round(Math.min(canvas.w, canvas.h) / 2);

  /* ---- estilos internos do SVG ------------------------------------ */
  /* Cada combinação de cores vira uma classe própria, para que módulos com cor
     individual convivam com os globais sem duplicar regras. */
  const temFill = modo !== "stroke";
  const temStroke = modo !== "fill";

  const regraDe = (f, st) => {
    const pf = temFill ? `fill:${f};fill-opacity:${fillOp / 100}` : "fill:none";
    const ps = temStroke
      ? `stroke:${st};stroke-opacity:${strokeOp / 100};stroke-width:${stroke};vector-effect:non-scaling-stroke;stroke-linejoin:round`
      : "stroke:none";
    const ff = temFill ? `fill:${f} !important;fill-opacity:${fillOp / 100} !important` : "fill:none !important";
    const fs = temStroke
      ? `stroke:${st} !important;stroke-opacity:${strokeOp / 100} !important;stroke-width:${stroke}px !important;vector-effect:non-scaling-stroke`
      : "stroke:none !important";
    return { pf, ps, ff, fs };
  };

  const { classeDe, paletaCss } = useMemo(() => {
    const sigs = new Map();
    const linhas = [];
    for (const c of celulas) {
      const o = over[c.key] || {};
      const sig = `${o.cor ?? fill}|${o.corStroke ?? strokeColor}`;
      if (sigs.has(sig)) continue;
      const cls = `p${sigs.size}`;
      sigs.set(sig, cls);
      const [f, st] = sig.split("|");
      const r = regraDe(f, st);
      linhas.push(`.${cls} .shp{${r.pf};${r.ps}}`);
      linhas.push(`.${cls} .forced,.${cls} .forced *{${r.ff};${r.fs}}`);
    }
    return {
      classeDe: (key) => {
        const o = over[key] || {};
        return sigs.get(`${o.cor ?? fill}|${o.corStroke ?? strokeColor}`);
      },
      paletaCss: linhas.join("\n"),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celulas, over, fill, strokeColor, modo, fillOp, strokeOp, stroke]);

  /* ------------------------------- interface ------------------------------- */
  return (
    <div className="ferramenta">
      <aside className="painel">
        <Header tool="Grid Maker" homeHref={HUB_URL} tema={tema} onToggleTema={alternarTema} />

        <section className="secao">
          <h2 className="secao-titulo">Suporte</h2>
          <Linha rotulo="Formato" htmlFor="gm-formato">
            <select id="gm-formato" className="selecao" value={canvasId} onChange={(e) => setCanvasId(e.target.value)}>
              {CANVASES.map((c) => <option key={c.id} value={c.id}>{c.label} — {c.w}×{c.h}</option>)}
              <option value="custom">Personalizado…</option>
            </select>
          </Linha>
          {canvasId === "custom" && (
            <>
              <Controle rotulo="Largura" unidade={unidade} min={0.1} max={20000} passo={unidade === "px" ? 1 : 0.1}
                valor={custW} onChange={setCustW} slider={false} />
              <Controle rotulo="Altura" unidade={unidade} min={0.1} max={20000} passo={unidade === "px" ? 1 : 0.1}
                valor={custH} onChange={setCustH} slider={false} />
              <Linha rotulo="Unidade">
                <Segmentado rotulo="Unidade" valor={unidade} onChange={setUnidade}
                  opcoes={[{ id: "px", nome: "px" }, { id: "mm", nome: "mm" }, { id: "cm", nome: "cm" }, { id: "in", nome: "pol" }]} />
              </Linha>
              <button type="button" className="botao gm-largo" onClick={() => { setCustW(custH); setCustH(custW); }}>Girar 90°</button>
              {unidade !== "px" && (
                <>
                  <Controle rotulo="Resolução" unidade="dpi" min={72} max={600} valor={dpi} onChange={setDpi} />
                  <p className="nota gm-nota">
                    Resulta em <span className="num">{canvas.w} × {canvas.h}</span> px. Para impressão, 300 dpi é o
                    padrão; use 150 para provas e 600 para traços muito finos.
                  </p>
                </>
              )}
            </>
          )}
          <Cor rotulo="Fundo" valor={bg} onChange={setBg} />
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Módulo</h2>
          <div className="gm-formas">
            {Object.entries(SHAPES).map(([k, v]) => (
              <button key={k} type="button" aria-pressed={shape === k} title={v.label} aria-label={v.label}
                onClick={() => { setShape(k); if (v.raio) setRaioCanto(v.raio(cell)); }}>
                <svg viewBox="0 0 100 100" aria-hidden="true">{v.el}</svg>
              </button>
            ))}
            {custom && (
              <button type="button" aria-pressed={shape === "custom"} title={custom.name}
                aria-label={`SVG enviado: ${custom.name}`} onClick={() => setShape("custom")}>
                <svg viewBox={custom.viewBox} aria-hidden="true" dangerouslySetInnerHTML={{ __html: custom.inner }} />
              </button>
            )}
          </div>
          {paramFn && (
            <>
              <Controle rotulo="Raio dos cantos" unidade="px" min={0} max={Math.round(cell / 2)} valor={raioCanto} onChange={setRaioCanto} />
              <p className="nota gm-nota">
                Medido em px do arquivo final. Blocos horizontais ou verticais mantêm exatamente a mesma curvatura dos
                módulos 1×1.
              </p>
            </>
          )}
          <button type="button" className="botao gm-largo" onClick={() => fileRef.current.click()}>
            {custom ? "Trocar SVG…" : "Enviar SVG…"}
          </button>
          <input ref={fileRef} type="file" accept=".svg,image/svg+xml" hidden onChange={carregarSvg} />
          {usingCustom && <Marcador marcado={forceColor} onChange={setForceColor}>Aplicar cor do painel</Marcador>}
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Malha</h2>
          <Controle rotulo="Colunas" min={1} max={80} valor={cols} onChange={setCols} />
          <Controle rotulo="Linhas" min={1} max={80} valor={rows} onChange={setRows} />
          <Controle rotulo="Tamanho do módulo" unidade="px" min={4} max={maxCell} valor={cell} onChange={setCell} />
          <Controle rotulo="Espaçamento" unidade="px" min={0} max={600} valor={gap} onChange={setGap} />
          <div className="botoes">
            <button type="button" className="botao" onClick={preencher}>Preencher tela</button>
            <button type="button" className="botao" onClick={ajustarModulo}>Encaixar módulo</button>
          </div>
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Atributos globais</h2>
          <Controle rotulo="Rotação" unidade="°" min={-180} max={180} valor={rot} onChange={setRot} />
          <Controle rotulo="Opacidade" unidade="%" min={0} max={100} valor={op} onChange={setOp} />
          <Linha rotulo="Escalonar ao longo de" htmlFor="gm-escala">
            <select id="gm-escala" className="selecao" value={escalaDir} onChange={(e) => setEscalaDir(e.target.value)}>
              {ESCALA_DIR.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
          </Linha>
          {escalaDir !== "none" && (
            <Controle rotulo="Escala final" unidade="×" min={0.05} max={2.5} passo={0.05} valor={escala} onChange={setEscala} />
          )}
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Cor e traço</h2>
          <Linha rotulo="Pintura">
            <Segmentado rotulo="Pintura" valor={modo} onChange={setModo}
              opcoes={[{ id: "fill", nome: "Cheio" }, { id: "stroke", nome: "Contorno" }, { id: "both", nome: "Os dois" }]} />
          </Linha>
          {temFill && (
            <>
              <Cor rotulo="Preenchimento" valor={fill} onChange={setFill} />
              <Controle rotulo="Opacidade do preenchimento" unidade="%" min={0} max={100} valor={fillOp} onChange={setFillOp} />
            </>
          )}
          {temStroke && (
            <>
              <Cor rotulo="Contorno" valor={strokeColor} onChange={setStrokeColor} />
              <Controle rotulo="Espessura do contorno" unidade="px" min={0.25} max={200} passo={0.25} valor={stroke} onChange={setStroke} />
              <Controle rotulo="Opacidade do contorno" unidade="%" min={0} max={100} valor={strokeOp} onChange={setStrokeOp} />
              <Linha rotulo="Espessuras prontas">
                <Segmentado rotulo="Espessuras prontas" valor={stroke} onChange={setStroke}
                  opcoes={[1, 2, 4, 8].map((v) => ({ id: v, nome: `${v} px` }))} />
              </Linha>
              <p className="nota gm-nota">
                Preenchimento e contorno têm opacidades independentes: dá para deixar a forma a 15% e manter o filete
                cheio. A espessura é medida no tamanho final do arquivo e não escala com o módulo.
              </p>
            </>
          )}
          <button type="button" className="botao gm-largo" onClick={restaurarCores}>Restaurar cores da marca</button>
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Elemento</h2>
          {!sel ? (
            <p className="nota">
              Clique em qualquer módulo no palco para editá-lo. A ocupação pode ser proporcional (2×2, 3×3), horizontal,
              vertical ou personalizada — colunas e linhas independentes, como 3×7. Os demais módulos permanecem idênticos.
            </p>
          ) : (
            <div className="gm-sel">
              <div className="gm-sel-topo">
                <strong>Módulo <span className="num">{sel.replace(":", " · ")}</span></strong>
                <span className="num">ocupa {spanC} × {spanR}</span>
              </div>
              <Linha rotulo="Ocupação" htmlFor="gm-ocupacao">
                <select id="gm-ocupacao" className="selecao" value={dirSpan} onChange={(e) => aplicarSpan(e.target.value, nSpan)}>
                  <option value="prop">Proporcional — n × n</option>
                  <option value="h">Horizontal — n × 1</option>
                  <option value="v">Vertical — 1 × n</option>
                  <option value="livre">Personalizada</option>
                </select>
              </Linha>
              {dirSpan === "livre" ? (
                <>
                  <Controle rotulo="Colunas" unidade="cél" min={1} max={Math.max(1, cols)} valor={spanC}
                    onChange={(v) => setOverride({ dirSpan: "livre", spanC: v })} />
                  <Controle rotulo="Linhas" unidade="cél" min={1} max={Math.max(1, rows)} valor={spanR}
                    onChange={(v) => setOverride({ dirSpan: "livre", spanR: v })} />
                </>
              ) : (
                <Controle rotulo={dirSpan === "h" ? "Colunas ocupadas" : dirSpan === "v" ? "Linhas ocupadas" : "Células por lado"}
                  unidade="cél" min={1} max={12} valor={nSpan} onChange={(v) => aplicarSpan(dirSpan, v)} />
              )}
              {temFill && <Cor rotulo="Preenchimento" valor={selData.cor ?? fill} onChange={(v) => setOverride({ cor: v })} />}
              {temStroke && <Cor rotulo="Contorno" valor={selData.corStroke ?? strokeColor} onChange={(v) => setOverride({ corStroke: v })} />}
              {(selData.cor || selData.corStroke) && (
                <button type="button" className="botao gm-largo" onClick={() => setOverride({ cor: undefined, corStroke: undefined })}>
                  Voltar às cores globais
                </button>
              )}
              <Controle rotulo="Rotação extra" unidade="°" min={-180} max={180} valor={selData.rot ?? 0} onChange={(v) => setOverride({ rot: v })} />
              <Controle rotulo="Opacidade" unidade="%" min={0} max={100} valor={selData.op ?? op} onChange={(v) => setOverride({ op: v })} />
              <Controle rotulo="Escala fina" unidade="×" min={0.05} max={3} passo={0.05} valor={selData.scale ?? 1} onChange={(v) => setOverride({ scale: v })} />
              <div className="botoes">
                <button type="button" className="botao" onClick={() => setOverride({ hidden: !selData.hidden })}>
                  {selData.hidden ? "Mostrar" : "Ocultar"}
                </button>
                <button type="button" className="botao" onClick={() => setOver((p) => { const n = { ...p }; delete n[sel]; return n; })}>
                  Redefinir
                </button>
              </div>
            </div>
          )}
          {Object.keys(over).length > 0 && (
            <button type="button" className="botao gm-largo gm-limpar" onClick={() => { setOver({}); setSel(null); }}>
              Limpar <span className="num">{Object.keys(over).length}</span> {Object.keys(over).length === 1 ? "edição" : "edições"}
            </button>
          )}
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Exportar</h2>
          <Linha rotulo="Escala do PNG">
            <Segmentado rotulo="Escala do PNG" valor={scale} onChange={setScale}
              opcoes={[1, 2, 3, 4].map((s) => ({ id: s, nome: `${s}×`, titulo: `${canvas.w * s} px de largura` }))} />
          </Linha>
          <div className="botoes">
            <button type="button" className="botao botao--primario" onClick={exportarSvg}>SVG vetorial</button>
            <button type="button" className="botao" onClick={exportarPng}>PNG</button>
          </div>
          <p className="nota gm-nota-topo">
            O SVG sai em vetor puro, com o fundo como retângulo sólido — pronto para abrir no Illustrator e converter para CMYK.
          </p>
        </section>
      </aside>

      <main className="palco">
        <div className="barra gm-barra">
          <span className="num">{canvas.w} × {canvas.h} px</span>
          <span>
            <span className="num">{celulas.length}</span> módulos · <span className="num">{totalVisivel}</span> visíveis
            {ocupadas.size > 0 && <> · <span className="num">{ocupadas.size}</span> células cobertas</>}
          </span>
          <span>Passo <span className="num">{pitch}</span> px</span>
          {busy && <span className="gm-status">{busy}</span>}
        </div>

        <div className="palco-area gm-area">
          {/* svg não é imagem: não guarda a proporção sozinho ao encolher. A
              moldura é que encaixa no palco (contain), pelas unidades do container. */}
          <div className="gm-moldura" style={{
            aspectRatio: `${canvas.w} / ${canvas.h}`,
            width: `min(100cqw, 100cqh * ${(canvas.w / canvas.h).toFixed(5)})`,
          }}>
            <svg ref={svgRef} className="documento gm-svg" width={canvas.w} height={canvas.h}
              viewBox={`0 0 ${canvas.w} ${canvas.h}`} xmlns="http://www.w3.org/2000/svg">
              <style>{paletaCss}</style>
              <rect x="0" y="0" width={canvas.w} height={canvas.h} fill={bg} />

              {celulas.map((c) => {
                if (c.hidden) return null;
                const opacity = (over[c.key]?.op ?? op) / 100;
                return (
                  <g key={c.key} className={classeDe(c.key)} opacity={opacity} transform={`rotate(${c.rot} ${c.cx} ${c.cy})`}>
                    {paramFn ? (
                      /* redesenhada no tamanho real: o raio não estica */
                      <path className="shp" transform={`translate(${c.x} ${c.y})`} d={paramFn(c.sw, c.sh, raioCanto)} />
                    ) : (
                      <svg x={c.x} y={c.y} width={c.sw} height={c.sh} viewBox={vb} preserveAspectRatio={c.par} overflow="visible">
                        {usingCustom ? (
                          <g className={forceColor ? "forced" : undefined} dangerouslySetInnerHTML={{ __html: custom.inner }} />
                        ) : (
                          SHAPES[shape].el
                        )}
                      </svg>
                    )}
                  </g>
                );
              })}

              {/* camada de interface — removida na exportação */}
              <g data-ui="1">
                {celulas.map((c) => (
                  <rect key={`h${c.key}`} x={c.cx - c.bw / 2} y={c.cy - c.bh / 2} width={c.bw} height={c.bh}
                    fill="transparent" style={{ cursor: "pointer" }} onClick={() => setSel(sel === c.key ? null : c.key)} />
                ))}
                {sel && (() => {
                  const c = celulas.find((x) => x.key === sel);
                  if (!c) return null;
                  const pad = Math.max(6, cell * 0.08);
                  return (
                    <rect x={c.cx - c.bw / 2 - pad} y={c.cy - c.bh / 2 - pad} width={c.bw + pad * 2} height={c.bh + pad * 2}
                      fill="none" className="gm-selecao" strokeWidth={Math.max(1.5, cell * 0.02)}
                      strokeDasharray={`${cell * 0.12} ${cell * 0.08}`} pointerEvents="none" />
                  );
                })()}
              </g>
            </svg>
          </div>
        </div>
      </main>
    </div>
  );
}
