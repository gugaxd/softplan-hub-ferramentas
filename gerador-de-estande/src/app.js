/* Interface do Gerador de estande — o script do HTML original da equipe.
   A lógica (tipologias, presets, elementos, editor de superfície, clique no
   modelo) é a mesma. Mudou para o hub:
   - imports em vez de window.__resources;
   - os elementos criados usam as classes do hub (segmentado, marcador, botao…);
   - o editor de superfície mora no painel, logo abaixo do cabeçalho, em vez
     de flutuar sobre o palco (assim funciona igual no celular);
   - os botões de exportar ficam no painel e chamam stage.exportar(). */
import * as THREE from "three";
import {
  construirEstande, resumo, carregarAssets, registrarImagem, catalogo,
  TAGLINES, TIPOS_ARTE, IMAGENS, CORES, MODELOS,
} from "./estande.js";

const PRESETS = [["2×2", 2, 2], ["3×2", 3, 2], ["3×3", 3, 3], ["4×3", 4, 3], ["5×4", 5, 4], ["6×4", 6, 4], ["8×6", 8, 6]];
const ELEMENTOS = [
  ["testeira", "Testeira com logo", true, ["octanorm", "box", "portico", "quiosque", "arcos", "estudio", "ilhaVolume"]],
  ["balcao", "Balcão de atendimento", true, ["octanorm", "marcenaria", "box", "portico", "pergolado", "quiosque", "arcos", "estudio", "ilhaVolume"]],
  ["holograma", "Arco holográfico na quina", true, ["arcos"]],
  ["jardim", "Jardim suspenso + pendentes", true, ["arcos", "ilhaVolume"]],
  ["plantas", "Plantas em vaso", true, ["arcos", "estudio", "ilhaVolume"]],
  ["tv", "TV / painel de vídeo", true, ["octanorm", "marcenaria", "box", "portico", "pergolado", "ilhaVolume"]],
  ["insta", "Painel instagramável", true, ["octanorm"]],
  ["totens", "Totens verticais / digitais", true, ["box", "arcos", "estudio", "ilhaVolume"]],
  ["spots", "Spots de luz", true, ["octanorm", "marcenaria", "box", "portico", "pergolado", "quiosque", "estudio", "ilhaVolume"]],
  ["lounge", "Lounge / arquibancada", false, ["octanorm", "box", "portico", "pergolado", "ilhaVolume"]],
  ["mesaAlta", "Mesa alta + banquetas", false, ["octanorm", "box", "portico", "pergolado", "quiosque", "arcos", "estudio", "ilhaVolume"]],
  ["mesaReuniao", "Mesa de reunião + cadeiras", true, ["marcenaria", "pergolado"]],
];

const DESC_MODELO = {
  octanorm: "Painéis de 1,84 m, testeira de 40 cm",
  marcenaria: "Parede única com moldura, balcão e mesa",
  box: "Caixa fechada, testeira envolvente e banda de dados",
  portico: "Dois pilares, viga de marca e fundo em três faixas",
  pergolado: "Muretas baixas, forro ripado e painel suspenso",
  quiosque: "Torre central de quatro faces com coroa de testeira",
  arcos: "Quina aberta, arcos com LED, totens e arco holográfico",
  estudio: "Estúdio envidraçado, letra-caixa, café e totens",
  ilhaVolume: "Testeira arredondada, volume com nicho, arcos, jardim e puffs",
};

const NOTAS = {
  marcenaria: "Parede única de marcenaria — ideal para 2×2 a 4×3 m.",
  box: "Caixa com testeira envolvente em L, forro ripado e LED perimetral.",
  portico: "Pórtico aberto: fundo cheio em três faixas de arte e viga de marca.",
  pergolado: "Lounge aberto sob pergolado, muretas de 1,5 m e painel suspenso dupla face.",
  quiosque: "Torre de quatro faces com coroa de testeira — ideal para 2×2 e 3×3 m.",
  arcos: "Estande de esquina, dois lados abertos. Segundo totem a partir de 7 m de frente.",
  estudio: "Estúdio de podcast envidraçado sobre tablado, com área aberta de café e atendimento.",
  ilhaVolume: "Ilha com testeira arredondada nos quatro lados e volume fechado de canto com nicho iluminado.",
};

const FUNDOS_CLARO = [["claro", "Claro"], ["gradiente", "Gradiente"], ["roxo", "Roxo"], ["royal", "Royal"], ["azul", "Azul"]];

export async function iniciar() {
  const stage = document.querySelector("three-d-stage");
  await stage.ready;
  await carregarAssets();

  const cfg = {
    modelo: "ilhaVolume", largura: 6, profundidade: 5, altura: MODELOS.ilhaVolume.altura, ilha: false,
    piso: "claro", corEstrutura: "azul-royal", frase: TAGLINES[5], evento: "",
    tvPol: 55, superficies: {},
  };
  ELEMENTOS.forEach(([k, , on]) => { cfg[k] = on; });
  cfg.lounge = true; cfg.mesaAlta = true;

  // ---------------------------------------------------------------- painel
  const modelosEl = document.getElementById("modelos");
  Object.entries(MODELOS).forEach(([k, m]) => modelosEl.append(new Option(m.rotulo, k)));
  modelosEl.onchange = () => {
    const k = modelosEl.value, m = MODELOS[k];
    cfg.modelo = k; cfg.altura = m.altura; cfg.piso = m.piso; cfg.superficies = {};
    if (k === "marcenaria") { cfg.largura = Math.min(cfg.largura, 4); cfg.profundidade = Math.min(cfg.profundidade, 3); }
    if (k === "box" || k === "portico") { cfg.largura = Math.max(cfg.largura, 6); cfg.profundidade = Math.max(cfg.profundidade, 4); }
    if (k === "pergolado") { cfg.largura = Math.max(cfg.largura, 5); cfg.profundidade = Math.max(cfg.profundidade, 4); }
    if (k === "ilhaVolume") { cfg.largura = Math.max(cfg.largura, 6); cfg.profundidade = Math.max(cfg.profundidade, 5); cfg.corEstrutura = "azul-royal"; Object.assign(cfg, { lounge: true, jardim: true, plantas: true, totens: true, mesaAlta: true, balcao: true, tv: true }); }
    if (k === "estudio") { cfg.largura = Math.max(cfg.largura, 5); cfg.profundidade = Math.max(cfg.profundidade, 3.5); }
    if (k === "arcos") { cfg.largura = Math.max(cfg.largura, 6); cfg.profundidade = Math.max(cfg.profundidade, 4.5); cfg.corEstrutura = "azul-royal"; }
    if (k === "quiosque") { cfg.largura = Math.min(cfg.largura, 3); cfg.profundidade = Math.min(cfg.profundidade, 3); }
    fecharEditor(); sync(); build(true);
  };

  const presetsEl = document.getElementById("presets");
  PRESETS.forEach(([rot, w, d]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = rot + " m"; b.dataset.w = w; b.dataset.d = d;
    b.onclick = () => { cfg.largura = w; cfg.profundidade = d; cfg.ilha = false; sync(); build(true); };
    presetsEl.appendChild(b);
  });
  const bIlha = document.createElement("button");
  bIlha.type = "button";
  bIlha.textContent = "Ilha"; bIlha.dataset.ilha = "1";
  bIlha.onclick = () => {
    cfg.modelo = "octanorm"; cfg.ilha = !cfg.ilha;
    if (cfg.ilha) { cfg.largura = Math.max(cfg.largura, 6); cfg.profundidade = Math.max(cfg.profundidade, 4); }
    cfg.superficies = {}; fecharEditor(); sync(); build(true);
  };
  presetsEl.appendChild(bIlha);

  const checksEl = document.getElementById("checks");
  ELEMENTOS.forEach(([k, rotulo, on, modelos]) => {
    const l = document.createElement("label");
    l.className = "marcador";
    const i = document.createElement("input");
    i.type = "checkbox"; i.checked = on; i.dataset.k = k; i.dataset.modelos = modelos.join(",");
    const s = document.createElement("span"); s.textContent = rotulo;
    i.onchange = () => { cfg[k] = i.checked; fecharEditor(); sync(); build(false); };
    l.append(i, s); checksEl.appendChild(l);
  });

  const corEl = document.getElementById("corEstrutura");
  ["azul-royal", "roxo-80", "azul-80", "cinza-20"].forEach((k) => {
    const b = document.createElement("button");
    b.type = "button";
    b.style.background = CORES[k]; b.dataset.v = k; b.title = k; b.setAttribute("aria-label", k);
    b.onclick = () => { cfg.corEstrutura = k; sync(); build(false); };
    corEl.appendChild(b);
  });

  const tag = document.getElementById("tagline");
  TAGLINES.forEach((t, i) => tag.append(new Option(`0${i + 1} · ${t}`, String(i))));
  tag.append(new Option("Frase personalizada", "livre"));
  tag.value = "5";
  tag.onchange = () => {
    const livre = tag.value === "livre";
    document.getElementById("fraseLivre").hidden = !livre;
    cfg.frase = livre ? (document.querySelector('[data-chave="frase"]').value || cfg.frase) : TAGLINES[+tag.value];
    Object.values(cfg.superficies).forEach((d) => { if (d && d.tipo === "frase") delete d.frase; });
    build(false);
  };

  document.querySelectorAll(".segmentado[data-chave] button").forEach((b) => {
    b.onclick = () => { cfg[b.parentElement.dataset.chave] = b.dataset.v; sync(); build(false); };
  });
  document.querySelectorAll("select[data-chave]").forEach((sel) => {
    sel.onchange = () => { cfg[sel.dataset.chave] = sel.dataset.num ? +sel.value : sel.value; build(false); };
  });
  document.querySelectorAll("input[type=text][data-chave]").forEach((inp) => {
    inp.oninput = () => {
      cfg[inp.dataset.chave] = inp.value;
      if (inp.dataset.chave === "evento") Object.values(cfg.superficies).forEach((d) => { if (d && d.tipo === "testeira") delete d.evento; });
      build(false);
    };
  });

  const wEl = document.getElementById("w"), dEl = document.getElementById("d"), altEl = document.getElementById("alt");
  wEl.oninput = () => { cfg.largura = +wEl.value; sync(); build(true); };
  dEl.oninput = () => { cfg.profundidade = +dEl.value; sync(); build(true); };
  altEl.oninput = () => { cfg.altura = +altEl.value; sync(); build(false); };

  document.querySelectorAll("[data-exportar]").forEach((b) => {
    b.onclick = () => stage.exportar(b.dataset.exportar);
  });

  function sync() {
    wEl.value = cfg.largura; dEl.value = cfg.profundidade; altEl.value = cfg.altura;
    const m = (v) => v.toFixed(2).replace(".", ",") + " m";
    document.getElementById("wOut").textContent = m(cfg.largura);
    document.getElementById("dOut").textContent = m(cfg.profundidade);
    document.getElementById("altOut").textContent = m(cfg.altura);
    modelosEl.value = cfg.modelo;
    document.getElementById("modeloDesc").textContent = DESC_MODELO[cfg.modelo] || "";
    presetsEl.querySelectorAll("button").forEach((b) => {
      const ativo = b.dataset.ilha ? cfg.ilha : !cfg.ilha && +b.dataset.w === cfg.largura && +b.dataset.d === cfg.profundidade;
      b.setAttribute("aria-pressed", ativo ? "true" : "false");
    });
    document.querySelectorAll(".segmentado[data-chave]").forEach((seg) => {
      seg.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", cfg[seg.dataset.chave] === b.dataset.v ? "true" : "false"));
    });
    corEl.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", cfg.corEstrutura === b.dataset.v ? "true" : "false"));
    document.querySelectorAll("select[data-chave]").forEach((sel) => { sel.value = String(cfg[sel.dataset.chave]); });
    document.getElementById("campoCor").hidden = !["box", "portico", "pergolado", "quiosque", "arcos", "ilhaVolume"].includes(cfg.modelo);
    const pequeno = cfg.largura * cfg.profundidade < 12;
    checksEl.querySelectorAll("input").forEach((i) => {
      i.checked = !!cfg[i.dataset.k];
      const foraDoModelo = !i.dataset.modelos.split(",").includes(cfg.modelo);
      const semEspaco = cfg.modelo === "octanorm" && pequeno && (i.dataset.k === "lounge" || i.dataset.k === "mesaAlta");
      const naIlha = cfg.ilha && (i.dataset.k === "spots");
      i.disabled = foraDoModelo || semEspaco || naIlha;
      i.parentElement.hidden = foraDoModelo;
      i.parentElement.classList.toggle("est-off", semEspaco || naIlha);
    });
    const r = resumo(cfg);
    document.getElementById("rArea").textContent = r.area.replace(".", ",");
    document.getElementById("rPaineis").textContent = r.paineis;
    document.getElementById("rTesteira").textContent = String(r.testeira).replace(".", ",");
    document.getElementById("rAltura").textContent = r.altura.replace(".", ",");
    document.getElementById("nota").textContent = cfg.modelo === "octanorm"
      ? (cfg.ilha ? "Ilha: núcleo central dupla-face, quatro lados abertos." : "Estande fechado em três lados, frente aberta.")
      : NOTAS[cfg.modelo];
  }

  // ---------------------------------------------------------------- build
  let selecionado = null, marcador = null;

  function build(reenquadrar) {
    const cam = stage._camera, ctrl = stage._controls;
    const pos = cam && cam.position.clone();
    const alvo = ctrl && ctrl.target.clone();
    stage.setObject(construirEstande(cfg));
    stage._object.traverse((o) => { if (o.isMesh && o.name.startsWith("spot")) o.castShadow = false; });
    if (!reenquadrar && pos) { cam.position.copy(pos); ctrl.target.copy(alvo); ctrl.update(); }
    else enquadrarFrente();
    marcador = null;
    if (selecionado) {
      if (catalogo()[selecionado]) destacar(selecionado); else fecharEditor();
    }
  }

  function enquadrarFrente() {
    const cam = stage._camera, ctrl = stage._controls;
    const W = cfg.largura, D = cfg.profundidade, r = Math.max(W, D);
    cam.position.set(r * 0.8, Math.max(2.1, cfg.altura * 0.55), D / 2 + r * 1.1);
    ctrl.target.set(0, cfg.altura * 0.42, -D * 0.1);
    ctrl.update();
  }

  function malhaDaSup(id) {
    let achou = null;
    stage._object.traverse((o) => { if (!achou && o.isMesh && o.userData.sup === id) achou = o; });
    return achou;
  }

  function destacar(id) {
    if (marcador) { marcador.parent && marcador.parent.remove(marcador); marcador = null; }
    const m = malhaDaSup(id);
    if (!m) return;
    marcador = new THREE.BoxHelper(m, 0x5c5cff);
    marcador.name = "selecao";
    marcador.material.depthTest = false;
    marcador.material.linewidth = 2;
    stage._scene.add(marcador);
  }

  // ---------------------------------------------------------------- clique no modelo
  const ray = new THREE.Raycaster();
  let ini = null;
  stage.addEventListener("pointerdown", (e) => { ini = [e.clientX, e.clientY]; });
  stage.addEventListener("pointerup", (e) => {
    if (!ini) return;
    const mov = Math.hypot(e.clientX - ini[0], e.clientY - ini[1]);
    ini = null;
    if (mov > 6) return;
    const cv = stage._renderer.domElement;
    const r = cv.getBoundingClientRect();
    const p = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(p, stage._camera);
    const hits = ray.intersectObjects(stage._object.children, true);
    const alvo = hits.find((h) => h.object.userData && h.object.userData.sup);
    if (alvo) abrirEditor(alvo.object.userData.sup);
    else fecharEditor();
  });

  // ---------------------------------------------------------------- editor
  const editor = document.getElementById("editor");
  const edTipo = document.getElementById("edTipo");
  const edCampos = document.getElementById("edCampos");
  TIPOS_ARTE.forEach(([v, r]) => edTipo.append(new Option(r, v)));
  document.getElementById("edFechar").onclick = fecharEditor;

  function desc(id) {
    const meta = catalogo()[id];
    if (!cfg.superficies[id]) cfg.superficies[id] = Object.assign({}, meta.padrao);
    const d = cfg.superficies[id];
    if (d.tipo === "frase" && !d.frase) d.frase = cfg.frase;
    if (d.tipo === "testeira" && d.evento === undefined) d.evento = cfg.evento;
    return d;
  }

  function fecharEditor() {
    selecionado = null; editor.hidden = true;
    if (marcador) { marcador.parent && marcador.parent.remove(marcador); marcador = null; }
  }

  function abrirEditor(id) {
    const meta = catalogo()[id];
    if (!meta) return;
    const novo = selecionado !== id;
    selecionado = id;
    editor.hidden = false;
    document.getElementById("edTitulo").textContent = meta.rotulo;
    document.getElementById("edDim").textContent = Math.round(meta.wCm) + " × " + Math.round(meta.hCm) + " cm de área de arte";
    const d = desc(id);
    edTipo.value = d.tipo;
    campos(id, d);
    destacar(id);
    if (novo) editor.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function aplicar() { build(false); }

  function bloco(rotulo, node) {
    const w = document.createElement("div");
    w.className = "est-campo";
    const s = document.createElement("span"); s.className = "rotulo"; s.textContent = rotulo;
    w.append(s, node);
    return w;
  }

  function segmentado(opcoes, valor, aoEscolher) {
    const s = document.createElement("div"); s.className = "segmentado est-quebra";
    opcoes.forEach(([v, r]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = r; b.setAttribute("aria-pressed", v === valor ? "true" : "false");
      b.onclick = () => { aoEscolher(v); };
      s.appendChild(b);
    });
    return s;
  }

  function campoTexto(valor, placeholder, aoDigitar) {
    const i = document.createElement("input");
    i.type = "text"; i.className = "texto est-largo"; i.value = valor || ""; i.placeholder = placeholder || "";
    i.oninput = () => aoDigitar(i.value);
    return i;
  }

  function campos(id, d) {
    edCampos.innerHTML = "";
    const set = (k, v) => { d[k] = v; campos(id, d); aplicar(); };

    if (["frase", "produtos", "marca", "testeira", "balcao", "dados", "tela", "lista", "logos", "letreiro", "faixa"].includes(d.tipo)) {
      edCampos.append(bloco("Fundo", segmentado(FUNDOS_CLARO, d.fundo, (v) => set("fundo", v))));
    }
    if (d.tipo === "frase") {
      const sel = document.createElement("select");
      sel.className = "selecao est-largo";
      TAGLINES.forEach((t, i) => sel.append(new Option(`0${i + 1} · ${t}`, String(i))));
      sel.append(new Option("Frase personalizada", "livre"));
      const idx = TAGLINES.indexOf(d.frase);
      sel.value = idx >= 0 ? String(idx) : "livre";
      sel.onchange = () => { if (sel.value !== "livre") set("frase", TAGLINES[+sel.value]); else { d.frase = ""; campos(id, d); } };
      edCampos.append(bloco("Frase", sel));
      if (TAGLINES.indexOf(d.frase) < 0) {
        edCampos.append(bloco("Texto", campoTexto(d.frase, "digite a frase", (v) => { d.frase = v; aplicar(); })));
      }
    }
    if (d.tipo === "testeira") {
      edCampos.append(bloco("Frase à esquerda", campoTexto(d.frase, "opcional", (v) => { d.frase = v; aplicar(); })));
      edCampos.append(bloco("Nome do evento", campoTexto(d.evento, "opcional", (v) => { d.evento = v; aplicar(); })));
      edCampos.append(bloco("Marca", segmentado([[true, "Com logo"], [false, "Sem logo"]], d.marca !== false, (v) => set("marca", v))));
    }
    if (d.tipo === "dados") {
      edCampos.append(bloco("Número 1", campoTexto(d.valor1 || "215 mil km", "", (v) => { d.valor1 = v; aplicar(); })));
      edCampos.append(bloco("Legenda 1", campoTexto(d.dado1 || "em rodovias monitoradas", "", (v) => { d.dado1 = v; aplicar(); })));
      edCampos.append(bloco("Número 2", campoTexto(d.valor2 || "R$ 632 mi", "", (v) => { d.valor2 = v; aplicar(); })));
      edCampos.append(bloco("Legenda 2", campoTexto(d.dado2 || "em receitas próprias", "", (v) => { d.dado2 = v; aplicar(); })));
    }
    if (d.tipo === "faixa") {
      edCampos.append(bloco("Texto em caixa alta (use / para quebrar linha)", campoTexto(d.frase, "opcional", (v) => { d.frase = v; aplicar(); })));
    }
    if (d.tipo === "nicho") {
      edCampos.append(bloco("Marcas ao lado do logo", campoTexto(d.marcas || "GEP | Just", "", (v) => { d.marcas = v; aplicar(); })));
      edCampos.append(bloco("Frase", campoTexto(d.frase, "", (v) => { d.frase = v; aplicar(); })));
    }
    if (d.tipo === "letreiro") {
      edCampos.append(bloco("Sobretítulo", campoTexto(d.eyebrow || "Estúdio", "", (v) => { d.eyebrow = v; aplicar(); })));
      edCampos.append(bloco("Título", campoTexto(d.titulo || "podcast", "", (v) => { d.titulo = v; aplicar(); })));
    }
    if (d.tipo === "grid") {
      edCampos.append(bloco("Frase (opcional)", campoTexto(d.frase, "opcional", (v) => { d.frase = v; aplicar(); })));
    }
    if (d.tipo === "lista") {
      edCampos.append(bloco("Itens (separados por vírgula)", campoTexto(d.itens || "Cidades, Governo, Justiça, Saúde, Educação", "", (v) => { d.itens = v; aplicar(); })));
    }
    if (d.tipo === "imagem" || d.tipo === "tela") {
      const grid = document.createElement("div"); grid.className = "est-imagens";
      Object.entries(IMAGENS).forEach(([k, [url, rot]]) => {
        const b = document.createElement("button");
        b.type = "button";
        b.title = rot; b.setAttribute("aria-pressed", d.img === k ? "true" : "false");
        const im = document.createElement("img"); im.src = url; im.alt = rot;
        b.appendChild(im);
        b.onclick = () => set("img", k);
        grid.appendChild(b);
      });
      edCampos.append(bloco("Imagem", grid));
      const lab = document.createElement("label"); lab.className = "botao est-largo est-upload";
      lab.textContent = "Enviar imagem própria";
      const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.hidden = true;
      inp.onchange = async () => {
        const f = inp.files && inp.files[0];
        if (!f) return;
        const url = await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(f); });
        const chave = "user-" + Date.now();
        await registrarImagem(chave, f.name, url);
        set("img", chave);
      };
      lab.appendChild(inp);
      edCampos.append(lab);
      edCampos.append(bloco("Frase sobre a imagem", campoTexto(d.frase, "opcional", (v) => { d.frase = v; aplicar(); })));
      edCampos.append(bloco("Marca", segmentado([[true, "Com logo"], [false, "Sem logo"]], !!d.marca, (v) => set("marca", v))));
    }
    if (d.tipo === "cor") {
      const sw = document.createElement("div"); sw.className = "est-amostras";
      Object.entries(CORES).forEach(([k, hex]) => {
        const b = document.createElement("button");
        b.type = "button";
        b.style.background = hex; b.title = k; b.setAttribute("aria-label", k);
        b.setAttribute("aria-pressed", (d.cor || "").toUpperCase() === hex.toUpperCase() ? "true" : "false");
        b.onclick = () => set("cor", hex);
        sw.appendChild(b);
      });
      edCampos.append(bloco("Cor", sw));
    }
  }

  edTipo.onchange = () => {
    const d = cfg.superficies[selecionado];
    const novo = { tipo: edTipo.value };
    if (novo.tipo === "frase") { novo.fundo = d.fundo || "claro"; novo.frase = d.frase || cfg.frase; }
    if (novo.tipo === "produtos" || novo.tipo === "balcao") novo.fundo = d.fundo || (novo.tipo === "balcao" ? "roxo" : "claro");
    if (novo.tipo === "marca") novo.fundo = d.fundo || "roxo";
    if (novo.tipo === "testeira") { novo.fundo = d.fundo || "gradiente"; novo.evento = cfg.evento; novo.marca = true; }
    if (novo.tipo === "dados") novo.fundo = "azul";
    if (novo.tipo === "imagem") novo.img = d.img || "cidades";
    if (novo.tipo === "cor") novo.cor = d.cor || "#F4F5F9";
    if (novo.tipo === "tela") { novo.fundo = "azul"; novo.img = d.img; novo.frase = d.frase || cfg.frase; }
    if (novo.tipo === "lista") novo.fundo = "claro";
    if (novo.tipo === "logos") novo.fundo = "azul";
    if (novo.tipo === "letreiro") novo.fundo = "roxo";
    if (novo.tipo === "faixa") { novo.fundo = "royal"; novo.frase = d.frase || ""; }
    if (novo.tipo === "nicho") { novo.frase = d.frase || "Tecnologia que impulsiona o hoje e o amanhã"; novo.marcas = "GEP | Just"; }
    cfg.superficies[selecionado] = novo;
    campos(selecionado, novo);
    build(false);
  };

  document.getElementById("edTodas").onclick = () => {
    const base = cfg.superficies[selecionado];
    if (!base) return;
    Object.entries(catalogo()).forEach(([id, meta]) => {
      const t = meta.padrao.tipo;
      if (t === "testeira" || t === "balcao") return;
      cfg.superficies[id] = JSON.parse(JSON.stringify(base));
    });
    build(false);
  };

  document.getElementById("edReset").onclick = () => {
    const meta = catalogo()[selecionado];
    cfg.superficies[selecionado] = Object.assign({}, meta.padrao);
    campos(selecionado, desc(selecionado));
    edTipo.value = cfg.superficies[selecionado].tipo;
    build(false);
  };

  sync();
  build(true);
  document.getElementById("carregando").hidden = true;
}
