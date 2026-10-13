import { useCallback, useEffect, useRef, useState } from "react";
import Header from "../../src/comum/Header.jsx";
import { HUB_URL } from "../../src/comum/hub.js";
import { useTema } from "../../src/comum/tema.js";
import { Controle, Linha, Marcador, Segmentado } from "../../src/comum/controles.jsx";

/* ---------------------------------------------------------------------------
   Mask Studio — foto revelada por uma grade de furos "softpoint", com o
   recorte da pessoa tendo a própria grade e extrapolando a máscara.

   Cópia independente, dentro do hub. A lógica de grade, desenho e exportação
   veio do Mask Studio original sem mudança de comportamento; a interface foi
   refeita na casca do hub (Header, tema, controles e tokens do DS Softplan).
   Os padrões de cor e fonte passaram para a paleta e a Sora da marca.

   Tela e exportação partem da mesma função, paint(): o PNG é ela numa escala
   maior, e o SVG reproduz as mesmas camadas como vetor.
--------------------------------------------------------------------------- */

const PRESETS = [
  { label: "16:9 — 1200×675", w: 1200, h: 675 },
  { label: "wide — 1500×760", w: 1500, h: 760 },
  { label: "quadrado — 1080×1080", w: 1080, h: 1080 },
  { label: "story — 1080×1920", w: 1080, h: 1920 },
  { label: "post — 1080×1350", w: 1080, h: 1350 },
];

/* Cores e fonte do arquivo exportado, não da interface: são dados da peça,
   por isso valores e não tokens. Padrão no DS: o gradiente vai sempre de
   #F0EAFF para o roxo, e o texto sai no azul de texto. */
const COR_1 = "#F0EAFF";
const COR_2 = "#9A7CFF";
const COR_TEXTO = "#2B2F47";
const FONTE = "Sora, sans-serif";

/* k = [cima-esq, cima-dir, baixo-dir, baixo-esq]; 1 = canto curvo.
   softpoint = dois cantos opostos curvos, como o SVG da marca. */
const SOFT_A = [1, 0, 1, 0];
const SOFT_B = [0, 1, 0, 1];
const ROUND = [1, 1, 1, 1];
const SQUARE = [0, 0, 0, 0];
const CYCLE = [SOFT_A, SOFT_B, ROUND, SQUARE];

const uid = () => Math.random().toString(36).slice(2, 9);

const cover = (iw, ih, W, H, zoom, ox, oy) => {
  const ratio = Math.max(W / iw, H / ih) * zoom;
  const dw = iw * ratio;
  const dh = ih * ratio;
  return { dx: (W - dw) / 2 + (ox / 100) * W, dy: (H - dh) / 2 + (oy / 100) * H, dw, dh };
};

const esc = (t) =>
  String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const pathRR = (c, x, y, w, h, r) => {
  c.moveTo(x + r[0], y);
  c.lineTo(x + w - r[1], y); c.quadraticCurveTo(x + w, y, x + w, y + r[1]);
  c.lineTo(x + w, y + h - r[2]); c.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h);
  c.lineTo(x + r[3], y + h); c.quadraticCurveTo(x, y + h, x, y + h - r[3]);
  c.lineTo(x, y + r[0]); c.quadraticCurveTo(x, y, x + r[0], y);
  c.closePath();
};

const dRR = (x, y, w, h, r) =>
  `M${x + r[0]} ${y}H${x + w - r[1]}Q${x + w} ${y} ${x + w} ${y + r[1]}` +
  `V${y + h - r[2]}Q${x + w} ${y + h} ${x + w - r[2]} ${y + h}` +
  `H${x + r[3]}Q${x} ${y + h} ${x} ${y + h - r[3]}` +
  `V${y + r[0]}Q${x} ${y} ${x + r[0]} ${y}Z`;

const pickK = (shape, orient) => {
  if (shape === "mixed") return CYCLE[Math.floor(Math.random() * CYCLE.length)].slice();
  if (shape === "round") return ROUND.slice();
  if (shape === "square") return SQUARE.slice();
  if (orient === "a") return SOFT_A.slice();
  if (orient === "b") return SOFT_B.slice();
  return (Math.random() < 0.5 ? SOFT_B : SOFT_A).slice();
};

const makeCells = (cols, rows, prev, density, shape, orient) => {
  const out = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const old = prev && prev.find((p) => p.c === c && p.r === r);
      out.push(old || { c, r, on: Math.random() * 100 < density, front: false, cutOn: true, k: pickK(shape, orient) });
    }
  }
  return out;
};

/* ------------------------- componentes de painel ------------------------- */

const MODOS = [
  { id: "grade", nome: "Furos da foto" },
  { id: "recorte", nome: "Furos do recorte" },
  { id: "texto", nome: "Mover texto" },
];

const ShapeIcon = ({ variant }) => (
  <svg className="ms-icone" viewBox="0 0 24 22" aria-hidden="true">
    <path d={variant === "a"
      ? "M7,0 H24 V15 A7,7 0 0 1 17,22 H0 V7 A7,7 0 0 1 7,0 Z"
      : "M0,0 H17 A7,7 0 0 1 24,7 V22 H7 A7,7 0 0 1 0,15 Z"} />
  </svg>
);

const LADOS = [
  { id: "a", nome: <ShapeIcon variant="a" />, titulo: "Cantos superior-esquerdo e inferior-direito" },
  { id: "b", nome: <ShapeIcon variant="b" />, titulo: "Cantos superior-direito e inferior-esquerdo" },
  { id: "mix", nome: "Alternar" },
];

const Envio = ({ accept, onFile, rotulo, primario }) => {
  const ref = useRef(null);
  return (
    <>
      <input ref={ref} type="file" accept={accept} hidden
        onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) onFile(f); e.target.value = ""; }} />
      <button type="button" className={"botao ms-largo" + (primario ? " botao--primario" : "")}
        onClick={() => ref.current && ref.current.click()}>{rotulo}</button>
    </>
  );
};

const Arquivo = ({ item, onRemove }) => (
  <div className="ms-arquivo">
    <img src={item.src} alt="" />
    <span>{item.name}</span>
    <button type="button" className="ms-remover" onClick={onRemove}>Remover</button>
  </div>
);

/* ------------------------------ ferramenta ------------------------------ */

export default function MaskStudio() {
  const [tema, alternarTema] = useTema();

  const [W, setW] = useState(1200);
  const [H, setH] = useState(675);
  const [cols, setCols] = useState(8);
  const [rows, setRows] = useState(5);
  const [radius, setRadius] = useState(30);
  const [density, setDensity] = useState(38);
  const [shape, setShape] = useState("soft");
  const [orient, setOrient] = useState("mix");
  const [frontMix, setFrontMix] = useState(true);
  const [guides, setGuides] = useState(true);

  const [bgType, setBgType] = useState("gradient");
  const [c1, setC1] = useState(COR_1);
  const [c2, setC2] = useState(COR_2);
  const [angle, setAngle] = useState(135);

  const [photo, setPhoto] = useState(null);
  const [pZoom, setPZoom] = useState(1);
  const [pX, setPX] = useState(0);
  const [pY, setPY] = useState(0);

  const [cut, setCut] = useState(null);
  const [cZoom, setCZoom] = useState(1);
  const [cX, setCX] = useState(0);
  const [cY, setCY] = useState(0);

  const [family, setFamily] = useState(FONTE);
  const [behind, setBehind] = useState(true);
  const [texts, setTexts] = useState([]);
  const [sel, setSel] = useState(null);

  const [mode, setMode] = useState("grade");
  const [scale, setScale] = useState(2);
  const [cells, setCells] = useState(() => makeCells(8, 5, null, 38, "soft", "mix"));

  const [square, setSquare] = useState(true);

  const canvasRef = useRef(null);
  const drag = useRef(null);

  /* ---------------------------- geometria ----------------------------
     Módulo quadrado: a largura da célula sai das colunas, e as linhas saem do
     formato — trocar de 16:9 para story não estica o furo. A grade fica
     centrada na vertical; quando a altura não fecha em células inteiras, a
     primeira e a última linha sangram para fora do quadro. */
  const cw = W / cols;
  const linhas = square ? Math.max(1, Math.ceil(H / cw - 1e-9)) : rows;
  const ch = square ? cw : H / linhas;
  const oy = square ? (H - linhas * ch) / 2 : 0;

  useEffect(() => {
    setCells((prev) => makeCells(cols, linhas, prev, density, shape, orient));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cols, linhas]);

  /* posição de cada linha horizontal da grade, só as que caem dentro do quadro */
  const guideYs = useCallback(() => {
    const ys = [];
    for (let i = square ? 0 : 1; i <= linhas; i++) {
      const y = oy + i * ch;
      if (y > 0.5 && y < H - 0.5) ys.push(y);
    }
    return ys;
  }, [square, linhas, oy, ch, H]);

  const rectOf = useCallback((cell, s) => ({
    x: cell.c * cw * s, y: (oy + cell.r * ch) * s, w: cw * s, h: ch * s,
  }), [cw, ch, oy]);

  const radiiOf = useCallback((cell, w, h) => {
    const b = Math.min((radius / 100) * Math.min(w, h), Math.min(w, h) / 2);
    return cell.k.map((on) => (on ? b : 0));
  }, [radius]);

  /* células vizinhas se fundem: o canto só arredonda na borda de fora */
  const mergedRadii = useCallback((cell, w, h, key, list) => {
    const b = Math.min((radius / 100) * Math.min(w, h), Math.min(w, h) / 2);
    const at = (c, r) => { const f = list.find((x) => x.c === c && x.r === r); return !!(f && f[key]); };
    const L = at(cell.c - 1, cell.r), R = at(cell.c + 1, cell.r);
    const T = at(cell.c, cell.r - 1), B = at(cell.c, cell.r + 1);
    return [
      cell.k[0] && !L && !T ? b : 0,
      cell.k[1] && !R && !T ? b : 0,
      cell.k[2] && !R && !B ? b : 0,
      cell.k[3] && !L && !B ? b : 0,
    ];
  }, [radius]);

  const cutPath = useCallback((c, s) => {
    const list = cells.filter((x) => x.cutOn);
    c.beginPath();
    list.forEach((cell) => {
      const r = rectOf(cell, s);
      pathRR(c, r.x, r.y, r.w, r.h, mergedRadii(cell, r.w, r.h, "cutOn", cells));
    });
    return list.length;
  }, [cells, rectOf, mergedRadii]);

  /* ------------------------------ desenho ------------------------------ */
  const paint = useCallback((c, s) => {
    const w = W * s, h = H * s;
    c.clearRect(0, 0, w, h);

    if (bgType === "solid") c.fillStyle = c1;
    else {
      const a = (angle * Math.PI) / 180;
      const len = (Math.abs(w * Math.cos(a)) + Math.abs(h * Math.sin(a))) / 2;
      const g = c.createLinearGradient(w / 2 - Math.cos(a) * len, h / 2 - Math.sin(a) * len,
                                       w / 2 + Math.cos(a) * len, h / 2 + Math.sin(a) * len);
      g.addColorStop(0, c1); g.addColorStop(1, c2);
      c.fillStyle = g;
    }
    c.fillRect(0, 0, w, h);

    if (guides) {
      c.strokeStyle = "rgba(255,255,255,.45)"; c.lineWidth = s;
      for (let i = 1; i < cols; i++) { c.beginPath(); c.moveTo(i * w / cols, 0); c.lineTo(i * w / cols, h); c.stroke(); }
      guideYs().forEach((y) => { c.beginPath(); c.moveTo(0, y * s); c.lineTo(w, y * s); c.stroke(); });
    }

    const paintTexts = () => texts.forEach((t) => {
      c.save();
      c.translate((t.x / 100) * w, (t.y / 100) * h);
      c.rotate((t.rot * Math.PI) / 180);
      c.fillStyle = t.color;
      c.font = `${t.weight} ${t.size * s}px ${family}`;
      c.textBaseline = "alphabetic";
      c.fillText(t.t, 0, 0);
      c.restore();
    });

    const tiles = (list) => {
      if (!list.length) return;
      c.save();
      c.beginPath();
      list.forEach((cell) => {
        const r = rectOf(cell, s);
        pathRR(c, r.x, r.y, r.w, r.h, radiiOf(cell, r.w, r.h));
      });
      c.clip();
      if (photo) {
        const f = cover(photo.img.width, photo.img.height, w, h, pZoom, pX, pY);
        c.drawImage(photo.img, f.dx, f.dy, f.dw, f.dh);
      } else { c.fillStyle = "rgba(255,255,255,.42)"; c.fillRect(0, 0, w, h); }
      c.restore();
    };

    const drawCut = () => {
      if (!cut) return;
      const f = cover(cut.img.width, cut.img.height, w, h, cZoom, cX, cY);
      const picked = cells.filter((x) => x.cutOn).length;
      if (!picked) return;
      if (picked === cells.length) { c.drawImage(cut.img, f.dx, f.dy, f.dw, f.dh); return; }
      const off = document.createElement("canvas");
      off.width = Math.max(1, Math.round(w)); off.height = Math.max(1, Math.round(h));
      const o = off.getContext("2d");
      o.drawImage(cut.img, f.dx, f.dy, f.dw, f.dh);
      const mk = document.createElement("canvas");
      mk.width = off.width; mk.height = off.height;
      const m = mk.getContext("2d");
      m.fillStyle = "#fff";
      cutPath(m, s);
      m.fill();
      o.globalCompositeOperation = "destination-in";
      o.drawImage(mk, 0, 0);
      c.drawImage(off, 0, 0);
    };

    if (behind) paintTexts();
    tiles(cells.filter((x) => x.on && !x.front));
    drawCut();
    tiles(cells.filter((x) => x.on && x.front));
    if (!behind) paintTexts();
  }, [W, H, cols, guideYs, bgType, c1, c2, angle, guides, texts, family, behind, cells, photo, pZoom, pX, pY, cut, cZoom, cX, cY, rectOf, radiiOf, cutPath]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    cv.width = W; cv.height = H;
    const c = cv.getContext("2d");
    paint(c, 1);
    if (mode === "recorte") {
      /* contorno de edição: só na tela, nunca no arquivo — por isso vem do token */
      c.save();
      c.strokeStyle = getComputedStyle(cv).getPropertyValue("--acento").trim();
      c.lineWidth = 2.5;
      if (c.setLineDash) c.setLineDash([8, 6]);
      cutPath(c, 1);
      c.stroke();
      c.restore();
    }
  }, [paint, W, H, mode, cutPath, tema]);

  /* a Sora carrega sob demanda: quando chegar, redesenha o texto com ela */
  useEffect(() => {
    if (!document.fonts) return;
    document.fonts.load(`400 16px ${FONTE}`).then(() => setTexts((t) => [...t]));
  }, []);

  /* ---------------------------- arquivos ---------------------------- */
  const readFile = useCallback((file, setter) => {
    if (!file || !file.type.startsWith("image/")) return;
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => setter({ src: fr.result, img, name: file.name });
      img.onerror = () => window.alert("Não consegui abrir essa imagem.");
      img.src = fr.result;
    };
    fr.onerror = () => window.alert("Falha ao ler o arquivo.");
    fr.readAsDataURL(file);
  }, []);

  /* ---------------------------- edição ---------------------------- */
  const patchCell = (c, r, fn) =>
    setCells((prev) => prev.map((cell) => (cell.c === c && cell.r === r ? fn({ ...cell }) : cell)));

  const cycleShape = (cell, key) => {
    let at = 4;
    if (cell[key]) {
      at = 0;
      for (let j = 0; j < CYCLE.length; j++) if (CYCLE[j].join() === cell.k.join()) { at = j; break; }
    }
    const next = (at + 1) % 5;
    if (next === 4) cell[key] = false;
    else { cell[key] = true; cell.k = CYCLE[next].slice(); }
    return cell;
  };

  const point = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
  };

  const onDown = (e) => {
    const p = point(e);
    if (mode === "grade" || mode === "recorte") {
      const c = Math.floor(p.x / cw), r = Math.floor((p.y - oy) / ch);
      patchCell(c, r, (cell) => {
        if (mode === "recorte") {
          if (e.shiftKey) return cycleShape(cell, "cutOn");
          cell.cutOn = !cell.cutOn; return cell;
        }
        if (e.altKey) { cell.front = !cell.front; cell.on = true; return cell; }
        if (e.shiftKey) return cycleShape(cell, "on");
        cell.on = !cell.on; return cell;
      });
      return;
    }
    const ctx = canvasRef.current.getContext("2d");
    for (let i = texts.length - 1; i >= 0; i--) {
      const t = texts[i];
      ctx.font = `${t.weight} ${t.size}px ${family}`;
      const tw = ctx.measureText(t.t).width;
      const x = (t.x / 100) * W, y = (t.y / 100) * H;
      if (p.x >= x - 10 && p.x <= x + tw + 10 && p.y >= y - t.size && p.y <= y + t.size * 0.3) {
        setSel(t.id);
        drag.current = { id: t.id, ox: p.x - x, oy: p.y - y };
        /* o arraste continua mesmo se o dedo ou o mouse sair do canvas */
        e.currentTarget.setPointerCapture(e.pointerId);
        break;
      }
    }
  };

  const onMove = (e) => {
    if (!drag.current) return;
    const p = point(e);
    const { id, ox, oy } = drag.current;
    setTexts((prev) => prev.map((t) => (t.id === id
      ? { ...t, x: Math.round(((p.x - ox) / W) * 1000) / 10, y: Math.round(((p.y - oy) / H) * 1000) / 10 }
      : t)));
  };

  const stopDrag = () => { drag.current = null; };

  const randomize = () => setCells((prev) => prev.map((cell) => {
    const on = Math.random() * 100 < density;
    return { ...cell, on, front: on && frontMix && Math.random() < 0.22, k: pickK(shape, orient) };
  }));
  const setAllHoles = (v) => setCells((prev) => prev.map((c) => ({ ...c, on: v })));
  const setCutAll = (fn) => { setCells((prev) => prev.map((c) => ({ ...c, cutOn: fn(c) }))); setMode("recorte"); };
  const reshapeAll = (sh, or) => setCells((prev) => prev.map((c) => ({ ...c, k: pickK(sh, or) })));

  const patchText = (patch) => setTexts((prev) => prev.map((t) => (t.id === sel ? { ...t, ...patch } : t)));
  const selected = texts.find((t) => t.id === sel);

  /* ---------------------------- exportação ---------------------------- */
  const save = (href, name) => {
    const a = document.createElement("a");
    a.href = href; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
  };

  const exportPNG = () => {
    const o = document.createElement("canvas");
    o.width = W * scale; o.height = H * scale;
    paint(o.getContext("2d"), scale);
    save(o.toDataURL("image/png"), `mask-studio-${W}x${H}@${scale}x.png`);
  };

  const exportSVG = () => {
    const on = cells.filter((x) => x.on);
    const back = on.filter((x) => !x.front);
    const front = on.filter((x) => x.front);
    const shapesOf = (list) => list.map((cell) => {
      const r = rectOf(cell, 1);
      return `<path d="${dRR(r.x, r.y, r.w, r.h, radiiOf(cell, r.w, r.h))}" fill="#fff"/>`;
    }).join("");
    const hole = (id, list) =>
      `<mask id="${id}"><rect width="${W}" height="${H}" fill="#000"/>${shapesOf(list)}</mask>`;

    const a = (angle * Math.PI) / 180;
    const grad = `<linearGradient id="g" x1="${0.5 - Math.cos(a) / 2}" y1="${0.5 - Math.sin(a) / 2}" x2="${0.5 + Math.cos(a) / 2}" y2="${0.5 + Math.sin(a) / 2}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`;
    const bg = `<rect width="${W}" height="${H}" fill="${bgType === "solid" ? c1 : "url(#g)"}"/>`;

    let guideEls = "";
    if (guides) {
      for (let i = 1; i < cols; i++) guideEls += `<line x1="${i * W / cols}" y1="0" x2="${i * W / cols}" y2="${H}" stroke="rgba(255,255,255,.45)"/>`;
      guideYs().forEach((y) => { guideEls += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="rgba(255,255,255,.45)"/>`; });
    }

    const f = photo ? cover(photo.img.width, photo.img.height, W, H, pZoom, pX, pY) : null;
    const layer = (list, id) => {
      if (!list.length) return "";
      const inner = photo
        ? `<image href="${photo.src}" x="${f.dx}" y="${f.dy}" width="${f.dw}" height="${f.dh}" preserveAspectRatio="none"/>`
        : `<rect width="${W}" height="${H}" fill="rgba(255,255,255,.42)"/>`;
      return `<g mask="url(#${id})">${inner}</g>`;
    };

    let cutEl = "", cutDefs = "";
    if (cut) {
      const fc = cover(cut.img.width, cut.img.height, W, H, cZoom, cX, cY);
      const img = `<image href="${cut.src}" x="${fc.dx}" y="${fc.dy}" width="${fc.dw}" height="${fc.dh}" preserveAspectRatio="none"/>`;
      const picked = cells.filter((x) => x.cutOn);
      if (!picked.length) cutEl = "";
      else if (picked.length === cells.length) cutEl = img;
      else {
        const body = picked.map((cell) => {
          const r = rectOf(cell, 1);
          return `<path d="${dRR(r.x, r.y, r.w, r.h, mergedRadii(cell, r.w, r.h, "cutOn", cells))}" fill="#fff"/>`;
        }).join("");
        cutDefs = `<mask id="me"><rect width="${W}" height="${H}" fill="#000"/>${body}</mask>`;
        cutEl = `<g mask="url(#me)">${img}</g>`;
      }
    }

    const tx = texts.map((t) => {
      const x = (t.x / 100) * W, y = (t.y / 100) * H;
      return `<text x="${x}" y="${y}" fill="${t.color}" font-family="${esc(family)}" font-size="${t.size}" font-weight="${t.weight}" transform="rotate(${t.rot} ${x} ${y})">${esc(t.t)}</text>`;
    }).join("");

    const out = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
      `<defs>${grad}${hole("mb", back)}${hole("mf", front)}${cutDefs}</defs>` +
      bg + guideEls + (behind ? tx : "") + layer(back, "mb") + cutEl + layer(front, "mf") + (behind ? "" : tx) + `</svg>`;

    save(URL.createObjectURL(new Blob([out], { type: "image/svg+xml" })), `mask-studio-${W}x${H}.svg`);
  };

  const holeKey = mode === "recorte" ? "cutOn" : "on";
  const openCount = cells.filter((x) => x[holeKey]).length;

  /* ------------------------------- interface ------------------------------- */
  return (
    <div className="ferramenta"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) readFile(f, photo ? setCut : setPhoto);
      }}>
      <aside className="painel">
        <Header tool="Mask Studio" homeHref={HUB_URL} tema={tema} onToggleTema={alternarTema} />

        <section className="secao">
          <h2 className="secao-titulo">1 · Foto dentro dos furos</h2>
          <Envio accept="image/*" primario rotulo={photo ? "Trocar foto" : "Enviar foto"}
            onFile={(f) => readFile(f, setPhoto)} />
          {photo && <Arquivo item={photo} onRemove={() => setPhoto(null)} />}
          <Controle rotulo="Zoom" unidade="×" min={0.3} max={3} passo={0.01} valor={pZoom} onChange={setPZoom} />
          <Controle rotulo="Horizontal" unidade="%" min={-60} max={60} valor={pX} onChange={setPX} />
          <Controle rotulo="Vertical" unidade="%" min={-60} max={60} valor={pY} onChange={setPY} />
        </section>

        <section className="secao">
          <h2 className="secao-titulo">2 · Recorte por cima</h2>
          <p className="nota ms-nota">PNG sem fundo, mesmo enquadramento da foto. É esta camada que faz a pessoa escapar dos quadrados.</p>
          <Envio accept="image/png,image/webp" rotulo={cut ? "Trocar recorte" : "Enviar recorte (PNG)"}
            onFile={(f) => readFile(f, setCut)} />
          {cut && <Arquivo item={cut} onRemove={() => setCut(null)} />}
          <Controle rotulo="Zoom" unidade="×" min={0.3} max={3} passo={0.01} valor={cZoom} onChange={setCZoom} />
          <Controle rotulo="Horizontal" unidade="%" min={-60} max={60} valor={cX} onChange={setCX} />
          <Controle rotulo="Vertical" unidade="%" min={-60} max={60} valor={cY} onChange={setCY} />
          <p className="nota">
            O recorte tem a própria grade. Escolha <b>Furos do recorte</b> acima do palco e clique nas células para
            decidir por onde a pessoa aparece — o resto dela é cortado.
          </p>
          <div className="ms-botoes">
            <button type="button" className="botao" onClick={() => setCutAll(() => true)}>Tudo</button>
            <button type="button" className="botao" onClick={() => setCutAll(() => false)}>Limpar</button>
            <button type="button" className="botao" onClick={() => setCutAll((c) => c.on)}>Igual à foto</button>
          </div>
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Grade</h2>
          <Controle rotulo="Colunas" min={2} max={16} valor={cols} onChange={setCols} />
          {square
            ? <p className="nota ms-nota"><span className="num">{linhas}</span> linhas, calculadas pelo formato para o módulo ficar quadrado.</p>
            : <Controle rotulo="Linhas" min={2} max={16} valor={rows} onChange={setRows} />}
          <Marcador marcado={square} onChange={setSquare}>Módulo sempre quadrado</Marcador>
          <Controle rotulo="Curva do canto" unidade="%" min={0} max={50} valor={radius} onChange={setRadius} />
          <Controle rotulo="Ocupação" unidade="%" min={5} max={95} valor={density} onChange={setDensity} />
          <div className="ms-botoes">
            <button type="button" className="botao botao--primario" onClick={randomize}>Gerar furos</button>
            <button type="button" className="botao" onClick={() => setAllHoles(true)}>Tudo</button>
            <button type="button" className="botao" onClick={() => setAllHoles(false)}>Limpar</button>
          </div>
          <Linha rotulo="Forma" htmlFor="ms-forma">
            <select id="ms-forma" className="selecao" value={shape}
              onChange={(e) => { setShape(e.target.value); reshapeAll(e.target.value, orient); }}>
              <option value="soft">Softpoint (2 cantos opostos)</option>
              <option value="round">Arredondada (4 cantos)</option>
              <option value="square">Quadrada</option>
              <option value="mixed">Misturada</option>
            </select>
          </Linha>
          {shape === "soft" && (
            <Linha rotulo="Lado do buraco">
              <Segmentado rotulo="Lado do buraco" opcoes={LADOS} valor={orient}
                onChange={(o) => { setOrient(o); reshapeAll("soft", o); }} />
            </Linha>
          )}
          <Marcador marcado={frontMix} onChange={setFrontMix}>Alguns furos passam na frente da pessoa</Marcador>
          <Marcador marcado={guides} onChange={setGuides}>Linhas-guia</Marcador>
          <p className="nota">
            Shift+clique percorre as formas e termina no vazio, apagando o furo · Alt+clique joga ele para a frente.
          </p>
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Fundo</h2>
          <Linha rotulo="Tipo">
            <Segmentado rotulo="Tipo de fundo" valor={bgType} onChange={setBgType}
              opcoes={[{ id: "gradient", nome: "Degradê" }, { id: "solid", nome: "Sólido" }]} />
          </Linha>
          <Linha rotulo="Cor 1" htmlFor="ms-cor-1">
            <input id="ms-cor-1" className="cor" type="color" value={c1} onChange={(e) => setC1(e.target.value)} />
          </Linha>
          {bgType === "gradient" && <>
            <Linha rotulo="Cor 2" htmlFor="ms-cor-2">
              <input id="ms-cor-2" className="cor" type="color" value={c2} onChange={(e) => setC2(e.target.value)} />
            </Linha>
            <Controle rotulo="Ângulo" unidade="°" min={0} max={360} valor={angle} onChange={setAngle} />
          </>}
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Tela</h2>
          <Linha rotulo="Formato" htmlFor="ms-formato">
            <select id="ms-formato" className="selecao" value={`${W}x${H}`} onChange={(e) => {
              const p = PRESETS.find((x) => `${x.w}x${x.h}` === e.target.value);
              if (p) { setW(p.w); setH(p.h); }
            }}>
              {PRESETS.map((p) => <option key={p.label} value={`${p.w}x${p.h}`}>{p.label}</option>)}
              {!PRESETS.some((p) => p.w === W && p.h === H) && <option value={`${W}x${H}`}>personalizado</option>}
            </select>
          </Linha>
          <Controle rotulo="Largura" unidade="px" min={1} max={8000} valor={W} onChange={setW} slider={false} />
          <Controle rotulo="Altura" unidade="px" min={1} max={8000} valor={H} onChange={setH} slider={false} />
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Texto</h2>
          <Linha rotulo="Fonte" htmlFor="ms-fonte">
            <input id="ms-fonte" className="texto" type="text" value={family} onChange={(e) => setFamily(e.target.value)} />
          </Linha>
          <Marcador marcado={behind} onChange={setBehind}>Texto atrás dos quadrados</Marcador>
          {texts.map((t) => (
            <div key={t.id} className={"ms-texto-linha" + (sel === t.id ? " sel" : "")}>
              <input className="texto" type="text" value={t.t} aria-label="Texto" onFocus={() => setSel(t.id)}
                onChange={(e) => setTexts((prev) => prev.map((x) => (x.id === t.id ? { ...x, t: e.target.value } : x)))} />
              <button type="button" className="botao" aria-label="Remover texto"
                onClick={() => { setTexts((prev) => prev.filter((x) => x.id !== t.id)); if (sel === t.id) setSel(null); }}>×</button>
            </div>
          ))}
          <button type="button" className="botao ms-largo" onClick={() => {
            const t = { id: uid(), t: "texto", x: 30, y: 50, size: 80, weight: 400, color: COR_TEXTO, rot: 0 };
            setTexts((prev) => [...prev, t]); setSel(t.id);
          }}>Adicionar texto</button>
          {selected && (
            <div className="ms-sub">
              <Controle rotulo="Tamanho" unidade="px" min={10} max={400} valor={selected.size} onChange={(v) => patchText({ size: v })} />
              <Controle rotulo="Peso" min={100} max={800} passo={100} valor={selected.weight} onChange={(v) => patchText({ weight: v })} />
              <Controle rotulo="Rotação" unidade="°" min={-180} max={180} valor={selected.rot} onChange={(v) => patchText({ rot: v })} />
              <Linha rotulo="Cor" htmlFor="ms-cor-texto">
                <input id="ms-cor-texto" className="cor" type="color" value={selected.color} onChange={(e) => patchText({ color: e.target.value })} />
              </Linha>
            </div>
          )}
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Exportar</h2>
          <Linha rotulo="Escala do PNG">
            <Segmentado rotulo="Escala do PNG" valor={scale} onChange={setScale}
              opcoes={[1, 2, 3].map((n) => ({ id: n, nome: `${n}×` }))} />
          </Linha>
          <div className="botoes">
            <button type="button" className="botao botao--primario" onClick={exportPNG}>Baixar PNG</button>
            <button type="button" className="botao" onClick={exportSVG}>Baixar SVG</button>
          </div>
        </section>
      </aside>

      <main className="palco">
        <div className="barra ms-barra">
          <Segmentado rotulo="O que o clique faz" opcoes={MODOS} valor={mode} onChange={setMode} className="ms-modos" />
          <button type="button" className="botao botao--primario" onClick={randomize}>Gerar furos</button>
          <button type="button" className="botao" onClick={() => setAllHoles(false)}>Limpar</button>
          <span className="ms-contagem">
            <span className="num">{openCount}</span> de <span className="num">{cells.length}</span>{" "}
            {mode === "recorte" ? "furos no recorte" : "furos abertos"}
          </span>
        </div>

        <div className="palco-area ms-area">
          <canvas ref={canvasRef}
            className={"documento" + (mode === "texto" ? " arrastavel" : "")}
            style={{ cursor: mode === "texto" ? "move" : "crosshair" }}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={stopDrag} onPointerCancel={stopDrag} />
          {!photo && <p className="ms-dica">Envie uma foto no painel, ou arraste um arquivo até aqui</p>}
        </div>
      </main>
    </div>
  );
}
