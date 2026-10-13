import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Header from "../../src/comum/Header.jsx";
import { HUB_URL } from "../../src/comum/hub.js";
import { useTema } from "../../src/comum/tema.js";
import { Controle, Linha, Marcador, Segmentado } from "../../src/comum/controles.jsx";
import { Scene } from "./components/Scene";

/* ---------------------------------------------------------------------------
   3D Studio — composição de softpoints e do S da Softplan em 3D,
   no material esmaltado da marca, com animação e exportação de imagem e vídeo.

   Cópia independente, dentro do hub. O motor 3D (components/ e types/) veio
   do original sem mudança de lógica. A interface foi refeita na casca do hub.
   Ficou de fora o servidor de IA (Gemini) que vinha no repositório: a
   interface não o chamava, e o hub não tem back-end — tudo roda no navegador.

   Tela e exportação partem da mesma cena: o PNG/JPG é um render dela em
   resolução maior, e o vídeo grava o próprio canvas.
--------------------------------------------------------------------------- */

/* Cores da peça, não da interface: são dados do render, por isso valores. */
const ROXO = "#5c5cff";
const BRANCO = "#ffffff";
const FUNDOS = ["#F1F2F7", "#181A27", "#5C5CFF", "#000000"];

const FORMAS = [
  { id: "softpoint", nome: "Softpoint" },
  { id: "logo", nome: "Logo S" },
  { id: "mixed", nome: "Misto" },
];
const CORES = [
  { id: ROXO, nome: "Roxo 80" },
  { id: BRANCO, nome: "Branco" },
  { id: "mixed", nome: "Misto" },
];
const PADROES = [
  { id: "linear", nome: "Linha" },
  { id: "grid", nome: "Grade" },
  { id: "radial", nome: "Círculo" },
  { id: "random", nome: "Solto" },
];
const EIXOS = [
  { id: "x", nome: "Lado a lado", titulo: "Eixo X" },
  { id: "y", nome: "Empilhado", titulo: "Eixo Y" },
  { id: "z", nome: "Profundidade", titulo: "Eixo Z" },
];
const AMBIENTES = [
  ["studio", "Estúdio"], ["city", "Cidade"], ["sunset", "Pôr do sol"], ["dawn", "Amanhecer"],
  ["night", "Noite"], ["warehouse", "Galpão"], ["forest", "Floresta"], ["apartment", "Apartamento"],
];
const ANGULOS = [
  ["front", "Frente"], ["top", "Topo"], ["side", "Lado"], ["isometric", "Isométrica"],
  ["bottom", "Base"], ["back", "Trás"], ["close-up", "Close"],
];
const ANIMACOES = [
  ["rotate", "Girar"], ["zoom-in", "Aproximar"], ["zoom-out", "Afastar"], ["float", "Flutuar"],
  ["tumble", "Rodopiar"], ["swing", "Balançar"], ["all", "Tudo junto"],
];
const QUALIDADES = [
  { id: "optimized", nome: "Leve", titulo: "~2,2 Mbps: WhatsApp, web e apresentações" },
  { id: "balanced", nome: "Médio", titulo: "~4,5 Mbps: equilíbrio entre fidelidade e tamanho" },
  { id: "high", nome: "Pesado", titulo: "~10 Mbps: máxima fidelidade" },
];
const PESO_VIDEO = {
  optimized: { 30: "~1,3 MB", 60: "~2,0 MB" },
  balanced: { 30: "~2,8 MB", 60: "~4,0 MB" },
  high: { 30: "~6,0 MB", 60: "~9,0 MB" },
};
const BITRATE = { optimized: 2200000, balanced: 4500000, high: 10000000 };

const SEM_AJUSTE = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 };
const MAX_PECAS = 50;

function baixarLink(href, nome) {
  const a = document.createElement("a");
  a.href = href;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* Normaliza um modelo importado: centraliza e escala para caber em 2,4 unidades. */
function encaixar(obj, file) {
  const bbox = new THREE.Box3().setFromObject(obj);
  const center = bbox.getCenter(new THREE.Vector3());
  const size = bbox.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const scale = 2.4 / maxDim;
  obj.position.sub(center.multiplyScalar(scale));
  obj.scale.multiplyScalar(scale);
  return {
    id: `upload-${Date.now()}`,
    name: file.name.replace(/\.[^/.]+$/, ""),
    prompt: file.name,
    description: `Modelo 3D importado: ${file.name}`,
    parts: [],
    importedScene: obj,
  };
}

export default function Softpoint3DStudio() {
  const [tema, alternarTema] = useTema();

  const [shapeType, setShapeType] = useState("softpoint");
  const [customModel, setCustomModel] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const fileInputRef = useRef(null);
  const [layoutMode, setLayoutMode] = useState("linear");
  const [quantity, setQuantity] = useState(1);
  const [thickness, setThickness] = useState(0.5);
  const [radius, setRadius] = useState(0.4);
  const [twistAngle, setTwistAngle] = useState(0);
  const [spacing, setSpacing] = useState(0.8);
  const [color, setColor] = useState(ROXO);
  const [ambientIntensity, setAmbientIntensity] = useState(0.4);
  const [lightRotation, setLightRotation] = useState(0);
  const [environmentPreset, setEnvironmentPreset] = useState("studio");
  const [bgColor, setBgColor] = useState(FUNDOS[0]);
  const [circleTilt, setCircleTilt] = useState(0);
  const [bendAngle, setBendAngle] = useState(0);
  const [waveAmplitude, setWaveAmplitude] = useState(0);
  const [waveFrequency, setWaveFrequency] = useState(1);
  const [alignmentAxis, setAlignmentAxis] = useState("x");

  const [animate, setAnimate] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [animationType, setAnimationType] = useState("rotate");
  const [animationScope, setAnimationScope] = useState("individual");
  const [cameraFov, setCameraFov] = useState(45);
  const [cameraAutoRotate, setCameraAutoRotate] = useState(false);
  const [cameraAutoRotateSpeed, setCameraAutoRotateSpeed] = useState(2);
  const [cameraTrigger, setCameraTrigger] = useState(undefined);
  const [transparentBg, setTransparentBg] = useState(false);
  const [recordingMode, setRecordingMode] = useState("none");
  const [videoQuality, setVideoQuality] = useState("optimized");
  const [videoFps, setVideoFps] = useState(30);
  const [shininess, setShininess] = useState(0.45);
  const roughness = 0.14 + (1 - shininess) * 0.28;
  const clearcoat = shininess * 0.75;
  const clearcoatRoughness = 0.06 + (1 - shininess) * 0.16;
  const exportBridgeRef = useRef(null);

  /* Arrastar o fundo: girar a perspectiva (padrão) ou mover a tela. Segurar
     espaço move a tela enquanto estiver pressionado. */
  const [dragMode, setDragMode] = useState("rotate");
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const alvo = e.target;
      const isInput = ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(alvo?.tagName) || alvo?.isContentEditable;
      if (e.code === "Space" && !isInput) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e) => { if (e.code === "Space") setIsSpacePressed(false); };
    const handleBlur = () => setIsSpacePressed(false);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  const [itemOverrides, setItemOverrides] = useState({});
  const [selectedPiece, setSelectedPiece] = useState(null);
  /* forma e cor próprias de cada peça; sem entrada, a peça segue o conjunto */
  const [itemShapes, setItemShapes] = useState({});
  const [itemColors, setItemColors] = useState({});

  const adicionarPeca = (forma) => {
    if (quantity >= MAX_PECAS) return;
    const i = quantity;
    setQuantity(i + 1);
    if (forma) setItemShapes((m) => ({ ...m, [i]: forma }));
    setSelectedPiece(i);
  };

  /* tira a peça k e puxa as de depois uma casa para trás, com tudo que é delas */
  const removerPeca = (k) => {
    if (quantity <= 1) return;
    const puxar = (mapa) => {
      const novo = {};
      Object.entries(mapa).forEach(([i, v]) => {
        const n = Number(i);
        if (n < k) novo[n] = v;
        else if (n > k) novo[n - 1] = v;
      });
      return novo;
    };
    setQuantity(quantity - 1);
    setItemOverrides(puxar);
    setItemShapes(puxar);
    setItemColors(puxar);
    setSelectedPiece(null);
  };

  const definirNaPeca = (setter, k, valor) =>
    setter((m) => {
      const novo = { ...m };
      if (valor === null) delete novo[k];
      else novo[k] = valor;
      return novo;
    });

  const handleOverrideChange = (index, field, value) => {
    setItemOverrides((prev) => ({ ...prev, [index]: { ...(prev[index] || SEM_AJUSTE), [field]: value } }));
  };

  const handleItemDrag = (index, dx, dy, dz) => {
    setItemOverrides((prev) => ({ ...prev, [index]: { ...(prev[index] || SEM_AJUSTE), x: dx, y: dy, z: dz } }));
    /* a peça arrastada fica selecionada, para os controles dela aparecerem */
    setSelectedPiece(index);
  };

  const triggerCamera = (preset) => setCameraTrigger({ id: Date.now(), preset });

  /* ---------------------------- importação ---------------------------- */
  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    setGenerationError(null);
    /* cena com uma peça só: o modelo a substitui, como no original. Com
       várias, ele entra como peça nova, sem trocar as outras. */
    const usar = (obj) => {
      setCustomModel(encaixar(obj, file));
      if (quantity === 1 && !Object.keys(itemShapes).length) setShapeType("custom");
      else adicionarPeca("custom");
      setIsUploading(false);
    };
    try {
      const nome = file.name.toLowerCase();
      if (nome.endsWith(".glb") || nome.endsWith(".gltf")) {
        const buffer = await file.arrayBuffer();
        const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
        new GLTFLoader().parse(buffer, "", (gltf) => usar(gltf.scene), (err) => {
          console.error(err);
          setGenerationError("Falha ao processar o arquivo GLB/GLTF.");
          setIsUploading(false);
        });
      } else if (nome.endsWith(".obj")) {
        const text = await file.text();
        const { OBJLoader } = await import("three/examples/jsm/loaders/OBJLoader.js");
        usar(new OBJLoader().parse(text));
      } else {
        setGenerationError("Formato não suportado. Envie um arquivo .glb, .gltf ou .obj.");
        setIsUploading(false);
      }
    } catch (err) {
      console.error(err);
      setGenerationError("Erro ao carregar o arquivo 3D.");
      setIsUploading(false);
    }
  };

  /* ---------------------------- exportação ---------------------------- */
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const exportImage = (format, transparent) => {
    try {
      if (exportBridgeRef.current?.captureImage) {
        /* render super-amostrado, sem serrilhado */
        baixarLink(exportBridgeRef.current.captureImage(format, transparent), `softpoint-render-${Date.now()}.${format === "jpeg" ? "jpg" : format}`);
        return;
      }
    } catch (err) {
      console.warn("Captura super-amostrada falhou, usando o canvas", err);
    }
    if (transparent) setTransparentBg(true);
    setTimeout(() => {
      const canvas = document.querySelector(".s3-cena canvas");
      if (canvas) baixarLink(canvas.toDataURL(`image/${format}`, 1.0), `softpoint-render-${Date.now()}.${format === "jpeg" ? "jpg" : format}`);
      if (transparent) setTransparentBg(false);
    }, 150);
  };

  const toggleRecording = (transparent) => {
    if (recordingMode !== "none") {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try { mediaRecorderRef.current.stop(); } catch (e) { console.warn("Erro ao parar a gravação:", e); }
      }
      setRecordingMode("none");
      if (transparentBg) setTransparentBg(false);
      return;
    }

    if (transparent) setTransparentBg(true);
    setRecordingMode(transparent ? "transparent" : "solid");
    setAnimate(true); /* gravar sempre com animação ligada */

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    setTimeout(() => {
      const canvas = document.querySelector(".s3-cena canvas");
      if (!canvas) {
        setRecordingMode("none");
        if (transparent) setTransparentBg(false);
        return;
      }
      try {
        const stream = canvas.captureStream(videoFps);
        streamRef.current = stream;
        const candidates = transparent
          ? ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"]
          : ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/mp4", "video/webm"];
        const selectedMime = candidates.find((c) => MediaRecorder.isTypeSupported(c)) || "video/webm";
        const recorder = new MediaRecorder(stream, {
          mimeType: selectedMime,
          videoBitsPerSecond: BITRATE[videoQuality] || 2500000,
        });
        chunksRef.current = [];
        recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
        recorder.onerror = (e) => {
          console.error("Erro na gravação:", e);
          setRecordingMode("none");
          if (transparent) setTransparentBg(false);
        };
        recorder.onstop = () => {
          stream.getTracks().forEach((track) => track.stop());
          if (streamRef.current === stream) streamRef.current = null;
          if (chunksRef.current.length > 0) {
            const blob = new Blob(chunksRef.current, { type: selectedMime });
            const url = URL.createObjectURL(blob);
            const ext = selectedMime.includes("mp4") ? "mp4" : "webm";
            baixarLink(url, `softpoint-animacao${transparent ? "-transparente" : ""}-${Date.now()}.${ext}`);
            /* mantém o blob vivo até o navegador terminar o download */
            setTimeout(() => URL.revokeObjectURL(url), 20000);
          } else {
            console.warn("A gravação não gerou nenhum quadro.");
          }
          if (transparent) setTransparentBg(false);
          setRecordingMode("none");
        };
        mediaRecorderRef.current = recorder;
        recorder.start(250);
      } catch (err) {
        console.error("Não foi possível iniciar a gravação:", err);
        setRecordingMode("none");
        if (transparent) setTransparentBg(false);
      }
    }, 150);
  };

  /* ------------------------------- interface ------------------------------- */
  const formas = customModel
    ? [...FORMAS, { id: "custom", nome: customModel.name, titulo: `Modelo importado: ${customModel.name}` }]
    : FORMAS;
  const corPersonalizada = ![ROXO, BRANCO, "mixed"].includes(color);
  const acabamento = shininess <= 0.35 ? "acetinado" : shininess <= 0.6 ? "brilho suave" : "alto brilho";
  const sel = selectedPiece !== null && selectedPiece < quantity ? selectedPiece : null;
  const ajuste = sel === null ? null : itemOverrides[sel] || SEM_AJUSTE;
  const nomeForma = { softpoint: "Softpoint", logo: "Logo S", custom: customModel?.name || "Importado" };
  /* mesma regra da cena (components/Scene.tsx) */
  const formaDe = (i) => {
    let f = itemShapes[i] || shapeType;
    if (f === "mixed") f = i % 2 === 0 ? "softpoint" : "logo";
    if (f === "custom" && !customModel) f = "softpoint";
    return f;
  };
  const corDe = (i) => {
    const c = itemColors[i] || color;
    return c === "mixed" ? (i % 2 === 0 ? ROXO : BRANCO) : c;
  };
  const gravando = recordingMode !== "none";

  return (
    <div className="ferramenta">
      <aside className="painel">
        <Header tool="3D Studio" homeHref={HUB_URL} tema={tema} onToggleTema={alternarTema} />

        <section className="secao">
          <h2 className="secao-titulo">Peças</h2>
          <div className="s3-adicionar">
            <button type="button" className="botao botao--primario" disabled={quantity >= MAX_PECAS} onClick={() => adicionarPeca("softpoint")}>+ Softpoint</button>
            <button type="button" className="botao botao--primario" disabled={quantity >= MAX_PECAS} onClick={() => adicionarPeca("logo")}>+ Logo S</button>
            <button type="button" className="botao botao--primario" disabled={!customModel || quantity >= MAX_PECAS} onClick={() => adicionarPeca("custom")}>+ Importado</button>
          </div>
          <div className="s3-pecas" role="group" aria-label="Peças na cena">
            {Array.from({ length: quantity }).map((_, i) => (
              <button key={i} type="button" aria-pressed={sel === i} onClick={() => setSelectedPiece(sel === i ? null : i)}>
                <span className="s3-ponto" style={{ background: corDe(i) }} />
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <span className="s3-peca-nome">{nomeForma[formaDe(i)]}</span>
              </button>
            ))}
          </div>
          {sel === null && <p className="nota s3-nota">Clique numa peça para mudar a forma, a cor e a posição dela.</p>}
          {sel !== null && (
            <div className="s3-sub">
              <div className="s3-sub-topo">
                <strong>Peça <span className="num">{sel + 1}</span></strong>
                <button type="button" className="s3-remover" disabled={quantity <= 1} onClick={() => removerPeca(sel)}>Remover peça</button>
              </div>
              <Linha rotulo="Forma" htmlFor="s3-forma-peca">
                <select id="s3-forma-peca" className="selecao" value={itemShapes[sel] || ""}
                  onChange={(e) => definirNaPeca(setItemShapes, sel, e.target.value || null)}>
                  <option value="">Do conjunto</option>
                  <option value="softpoint">Softpoint</option>
                  <option value="logo">Logo S</option>
                  {customModel && <option value="custom">{customModel.name}</option>}
                </select>
              </Linha>
              <Marcador marcado={itemColors[sel] !== undefined}
                onChange={(v) => definirNaPeca(setItemColors, sel, v ? corDe(sel) : null)}>Cor própria</Marcador>
              {itemColors[sel] !== undefined && (
                <Linha rotulo="Cor da peça" htmlFor="s3-cor-peca">
                  <input id="s3-cor-peca" className="cor" type="color" value={itemColors[sel]}
                    onChange={(e) => definirNaPeca(setItemColors, sel, e.target.value)} />
                </Linha>
              )}
              {["x", "y", "z"].map((eixo) => (
                <Controle key={eixo} rotulo={`Posição ${eixo.toUpperCase()}`} min={-10} max={10} passo={0.1}
                  valor={ajuste[eixo]} onChange={(v) => handleOverrideChange(sel, eixo, v)} />
              ))}
              {["rx", "ry", "rz"].map((eixo) => (
                <Controle key={eixo} rotulo={`Rotação ${eixo[1].toUpperCase()}`} unidade="rad" min={-3.14} max={3.14} passo={0.01}
                  valor={ajuste[eixo]} onChange={(v) => handleOverrideChange(sel, eixo, v)} />
              ))}
            </div>
          )}
          <Linha rotulo="Forma do conjunto">
            <Segmentado rotulo="Forma do conjunto" opcoes={formas} valor={shapeType} onChange={setShapeType} className="s3-quebra" />
          </Linha>
          <p className="nota s3-nota">Vale para as peças sem forma própria. Misto alterna softpoint e S.</p>
          <div className="botoes">
            <button type="button" className="botao" onClick={() => setItemOverrides({})}>Zerar posições</button>
            <button type="button" className="botao" onClick={() => { setItemShapes({}); setItemColors({}); }}>Zerar formas</button>
          </div>
          <p className="nota">Arrastar uma peça no palco também a move, e a deixa selecionada aqui.</p>
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Modelo importado</h2>
          <input ref={fileInputRef} type="file" accept=".glb,.gltf,.obj" hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ""; }} />
          <div className="botoes">
            <button type="button" className="botao" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
              {isUploading ? "Carregando…" : customModel ? "Trocar 3D" : "Importar 3D"}
            </button>
            <button type="button" className="botao" disabled={!customModel}
              onClick={() => { setCustomModel(null); if (shapeType === "custom") setShapeType("softpoint"); }}>
              Remover
            </button>
          </div>
          <p className="nota">Modelo próprio em .glb, .gltf ou .obj, com o mesmo material da marca. Depois de importar, use + Importado para pôr mais cópias na cena.</p>
          {generationError && <p className="s3-erro" role="alert">{generationError}</p>}
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Material e cor</h2>
          <Linha rotulo="Cor">
            <Segmentado rotulo="Cor" opcoes={CORES} valor={corPersonalizada ? null : color} onChange={setColor} />
          </Linha>
          <Linha rotulo="Personalizada" htmlFor="s3-cor">
            <input id="s3-cor" className={"cor" + (corPersonalizada ? " s3-ativa" : "")} type="color"
              value={color === "mixed" ? ROXO : color} onChange={(e) => setColor(e.target.value)} />
          </Linha>
          <Controle rotulo="Brilho" unidade="%" min={10} max={90} passo={5}
            valor={Math.round(shininess * 100)} onChange={(v) => setShininess(v / 100)} />
          <p className="nota">Acabamento esmaltado, hoje em {acabamento}: de acetinado (10%) a espelhado (90%).</p>
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Forma</h2>
          <Controle rotulo="Espessura" min={0.05} max={2} passo={0.05} valor={thickness} onChange={setThickness} />
          {shapeType === "logo"
            ? <p className="nota">O raio do canto é fixo no logo S.</p>
            : <Controle rotulo="Raio do canto" min={0} max={0.5} passo={0.01} valor={radius} onChange={setRadius} />}
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Arranjo</h2>
          <Linha rotulo="Padrão">
            <Segmentado rotulo="Padrão" opcoes={PADROES} valor={layoutMode} onChange={setLayoutMode} />
          </Linha>
          <Controle rotulo="Quantidade" min={1} max={MAX_PECAS} valor={quantity} onChange={setQuantity} />
          <Controle rotulo="Torção" unidade="°" min={-180} max={180} valor={twistAngle} onChange={setTwistAngle} />
          {layoutMode === "linear" && <>
            <Linha rotulo="Eixo">
              <Segmentado rotulo="Eixo" opcoes={EIXOS} valor={alignmentAxis} onChange={setAlignmentAxis} />
            </Linha>
            <Controle rotulo="Curvatura" unidade="°" min={0} max={360} valor={bendAngle} onChange={setBendAngle} />
            <Controle rotulo="Onda" min={0} max={5} passo={0.1} valor={waveAmplitude} onChange={setWaveAmplitude} />
            <Controle rotulo="Frequência da onda" min={1} max={10} passo={0.5} valor={waveFrequency} onChange={setWaveFrequency} />
          </>}
          {layoutMode === "radial" && (
            <Controle rotulo="Inclinação do círculo" unidade="°" min={0} max={90} valor={circleTilt} onChange={setCircleTilt} />
          )}
          <Controle rotulo="Espaçamento" min={0} max={3} passo={0.1} valor={spacing} onChange={setSpacing} />
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Fundo</h2>
          <Linha rotulo="Cor" htmlFor="s3-fundo">
            <input id="s3-fundo" className="cor" type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
          </Linha>
          <div className="s3-amostras" role="group" aria-label="Fundos prontos">
            {FUNDOS.map((f) => (
              <button key={f} type="button" aria-pressed={bgColor === f} title={f} aria-label={`Fundo ${f}`}
                style={{ background: f }} onClick={() => setBgColor(f)} />
            ))}
          </div>
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Luz</h2>
          <Linha rotulo="Ambiente" htmlFor="s3-ambiente">
            <select id="s3-ambiente" className="selecao" value={environmentPreset} onChange={(e) => setEnvironmentPreset(e.target.value)}>
              {AMBIENTES.map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}
            </select>
          </Linha>
          <Controle rotulo="Intensidade" min={0} max={2} passo={0.1} valor={ambientIntensity} onChange={setAmbientIntensity} />
          <Controle rotulo="Rotação da luz" unidade="°" min={-180} max={180} valor={lightRotation} onChange={setLightRotation} />
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Câmera</h2>
          <Linha rotulo="Ângulos prontos" />
          <div className="s3-grade">
            {ANGULOS.map(([id, nome]) => (
              <button key={id} type="button" className="botao" onClick={() => triggerCamera(id)}>{nome}</button>
            ))}
            <button type="button" className="botao" onClick={() => triggerCamera("center")}>Centralizar</button>
          </div>
          <Controle rotulo="Campo de visão" unidade="°" min={10} max={100} valor={cameraFov} onChange={setCameraFov} />
          <p className="nota s3-nota">Menos é teleobjetiva (mais zoom), mais é grande-angular.</p>
          <Marcador marcado={cameraAutoRotate} onChange={setCameraAutoRotate}>Girar a câmera sozinha</Marcador>
          {cameraAutoRotate && (
            <Controle rotulo="Velocidade do giro" unidade="×" min={-10} max={10} passo={0.5}
              valor={cameraAutoRotateSpeed} onChange={setCameraAutoRotateSpeed} />
          )}
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Animação</h2>
          <Marcador marcado={animate} onChange={setAnimate}>Animar</Marcador>
          {animate && <>
            <Linha rotulo="Tipo" htmlFor="s3-animacao">
              <select id="s3-animacao" className="selecao" value={animationType} onChange={(e) => setAnimationType(e.target.value)}>
                {ANIMACOES.map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}
              </select>
            </Linha>
            <Linha rotulo="Movimento">
              <Segmentado rotulo="Movimento" valor={animationScope} onChange={setAnimationScope}
                opcoes={[
                  { id: "individual", nome: "No próprio eixo", titulo: "Cada peça gira no lugar" },
                  { id: "group", nome: "Em grupo", titulo: "O conjunto gira junto" },
                ]} />
            </Linha>
            <Controle rotulo="Velocidade" unidade="×" min={0.1} max={3} passo={0.1} valor={animationSpeed} onChange={setAnimationSpeed} />
          </>}
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Exportar</h2>
          <div className="botoes">
            <button type="button" className="botao botao--primario" onClick={() => exportImage("png", true)}>PNG transparente</button>
            <button type="button" className="botao" onClick={() => exportImage("jpeg", false)}>JPG com fundo</button>
          </div>
          <Linha rotulo="Vídeo">
            <Segmentado rotulo="Qualidade do vídeo" opcoes={QUALIDADES} valor={videoQuality} onChange={setVideoQuality} />
          </Linha>
          <Linha rotulo="Quadros por segundo">
            <Segmentado rotulo="Quadros por segundo" valor={videoFps} onChange={setVideoFps}
              opcoes={[{ id: 30, nome: "30" }, { id: 60, nome: "60" }]} />
          </Linha>
          <p className="nota s3-nota">
            Cerca de <span className="num">{PESO_VIDEO[videoQuality][videoFps]}</span> a cada 5 segundos.
          </p>
          <div className="s3-gravar">
            <button type="button" className={"botao" + (recordingMode === "solid" ? " s3-gravando" : "")}
              disabled={recordingMode === "transparent"} onClick={() => toggleRecording(false)}>
              {recordingMode === "solid" ? "Parar gravação" : "Gravar vídeo com fundo"}
            </button>
            <button type="button" className={"botao" + (recordingMode === "transparent" ? " s3-gravando" : "")}
              disabled={recordingMode === "solid"} onClick={() => toggleRecording(true)}>
              {recordingMode === "transparent" ? "Parar gravação" : "Gravar vídeo transparente"}
            </button>
          </div>
        </section>
      </aside>

      <main className="palco">
        <div className="barra s3-barra">
          <Segmentado rotulo="Arrastar o fundo" valor={isSpacePressed ? "pan" : dragMode} onChange={setDragMode}
            opcoes={[{ id: "rotate", nome: "Girar 3D" }, { id: "pan", nome: "Mover tela" }]} className="s3-modos" />
          <button type="button" className="botao" onClick={() => triggerCamera("center")}>Centralizar</button>
          {gravando
            ? <span className="s3-rec">Gravando…</span>
            : <span className="s3-dica">Segure espaço para mover a tela · role para dar zoom</span>}
        </div>
        <div className="palco-area s3-area">
          <div className="s3-cena arrastavel">
            <Scene
              shapeType={shapeType}
              customModel={customModel}
              layoutMode={layoutMode}
              quantity={quantity}
              thickness={thickness}
              radius={radius}
              twistAngle={twistAngle}
              spacing={spacing}
              color={color}
              roughness={roughness}
              metalness={0.02}
              clearcoat={clearcoat}
              clearcoatRoughness={clearcoatRoughness}
              exportBridgeRef={exportBridgeRef}
              isRecording={gravando}
              dragMode={dragMode}
              isSpacePressed={isSpacePressed}
              bgColor={bgColor}
              ambientIntensity={ambientIntensity}
              lightRotation={lightRotation}
              environmentPreset={environmentPreset}
              transparentBg={transparentBg}
              animate={animate}
              animationSpeed={animationSpeed}
              animationType={animationType}
              animationScope={animationScope}
              cameraFov={cameraFov}
              autoRotate={cameraAutoRotate}
              autoRotateSpeed={cameraAutoRotateSpeed}
              cameraTrigger={cameraTrigger}
              itemOverrides={itemOverrides}
              itemShapes={itemShapes}
              itemColors={itemColors}
              onItemDrag={handleItemDrag}
              circleTilt={circleTilt}
              bendAngle={bendAngle}
              waveAmplitude={waveAmplitude}
              waveFrequency={waveFrequency}
              alignmentAxis={alignmentAxis}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
