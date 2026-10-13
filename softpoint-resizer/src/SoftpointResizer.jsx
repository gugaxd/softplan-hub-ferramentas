import { useMemo, useState } from "react";
import { Controle, Linha, Segmentado } from "../../src/comum/controles.jsx";
import Header from "../../src/comum/Header.jsx";
import { HUB_URL } from "../../src/comum/hub.js";
import { useTema } from "../../src/comum/tema.js";

/* ---------------------------------------------------------------------------
   Softpoint Resizer — o Softpoint, a forma da marca, em qualquer
   tamanho e raio. É também o molde das ferramentas do hub: a menor ferramenta
   completa, para copiar ao começar uma nova.

   Fica igual em todas: o Header com homeHref={HUB_URL}, o useTema e o
   esqueleto .ferramenta / .painel / .palco (src/comum/ferramenta.css).
   Muda: o estado, a função que desenha (gerarSvg) e quais controles entram.
   Os controles (Controle, Linha, Segmentado, Marcador) vêm de src/comum/controles.jsx.

   O que você vê é o que sai: o palco e a exportação usam a mesma string SVG,
   saída de uma função só — nunca dois caminhos paralelos.
--------------------------------------------------------------------------- */

const NOME = "Softpoint Resizer";

/* Cores do arquivo exportado, não da interface. Por isso são valores e não
   tokens: o SVG baixado precisa levar a cor dentro dele. */
const CORES = [
  { id: "roxo-80", nome: "Roxo 80", hex: "#5C5CFF" },
  { id: "roxo-40", nome: "Roxo 40", hex: "#9A7CFF" },
  { id: "azul-80", nome: "Azul 80", hex: "#2D2A58" },
];
const FUNDOS = [
  { id: "transparente", nome: "Transparente", hex: null },
  { id: "roxo-10", nome: "Roxo 10", hex: "#F7F5FF" },
];

const INICIAL = { largura: 640, altura: 400, raio: 24, cor: "roxo-80", fundo: "transparente" };

/* Softpoint: cantos superior-esquerdo e inferior-direito arredondados.
   O raio é uma porcentagem do lado menor. */
function gerarSvg({ largura: w, altura: h, raio, cor, fundo }) {
  const r = Math.round((Math.min(w, h) * raio) / 100);
  const preenchimento = CORES.find((c) => c.id === cor).hex;
  const fundoHex = FUNDOS.find((f) => f.id === fundo).hex;
  const forma = `M0 ${r}A${r} ${r} 0 0 1 ${r} 0H${w}V${h - r}A${r} ${r} 0 0 1 ${w - r} ${h}H0Z`;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
    fundoHex ? `<rect width="${w}" height="${h}" fill="${fundoHex}"/>` : "",
    `<path d="${forma}" fill="${preenchimento}"/>`,
    "</svg>",
  ].join("");
}

const dataUrl = (svg) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);

function baixar(blob, nomeArquivo) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function svgParaPng(svg, w, h, escala) {
  return new Promise((resolver, falhar) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = w * escala;
      canvas.height = h * escala;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => (b ? resolver(b) : falhar(new Error("PNG vazio"))), "image/png");
    };
    img.onerror = falhar;
    img.src = dataUrl(svg);
  });
}

export default function SoftpointResizer() {
  const [tema, alternarTema] = useTema();
  const [estado, setEstado] = useState(INICIAL);
  const definir = (chave) => (valor) => setEstado((e) => ({ ...e, [chave]: valor }));

  const svg = useMemo(() => gerarSvg(estado), [estado]);
  const { largura, altura } = estado;

  const exportarSvg = () => baixar(new Blob([svg], { type: "image/svg+xml" }), "softpoint.svg");
  const exportarPng = () =>
    svgParaPng(svg, largura, altura, 2).then((b) => baixar(b, "softpoint.png"));

  return (
    <div className="ferramenta">
      <aside className="painel">
        <Header tool={NOME} homeHref={HUB_URL} tema={tema} onToggleTema={alternarTema} />

        <section className="secao">
          <h2 className="secao-titulo">Formato</h2>
          <Controle rotulo="Largura" unidade="px" min={80} max={1600} valor={largura} onChange={definir("largura")} />
          <Controle rotulo="Altura" unidade="px" min={80} max={1600} valor={altura} onChange={definir("altura")} />
          <Controle rotulo="Raio" unidade="%" min={0} max={50} valor={estado.raio} onChange={definir("raio")} />
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Cor</h2>
          <Linha rotulo="Preenchimento">
            <Segmentado rotulo="Preenchimento" opcoes={CORES} valor={estado.cor} onChange={definir("cor")} />
          </Linha>
          <Linha rotulo="Fundo">
            <Segmentado rotulo="Fundo" opcoes={FUNDOS} valor={estado.fundo} onChange={definir("fundo")} />
          </Linha>
        </section>

        <section className="secao">
          <h2 className="secao-titulo">Exportar</h2>
          <div className="botoes">
            <button type="button" className="botao" onClick={exportarSvg}>
              SVG
            </button>
            <button type="button" className="botao botao--primario" onClick={exportarPng}>
              PNG
            </button>
          </div>
          <p className="nota">O arquivo sai da mesma função que desenha o palco. PNG em 2×.</p>
        </section>
      </aside>

      <main className="palco">
        <div className="barra">
          <span>
            Softpoint · <span className="num">{largura} × {altura}</span> px
          </span>
          <span>Tudo roda no navegador</span>
        </div>
        <div className="palco-area">
          <img
            className="documento"
            src={dataUrl(svg)}
            alt={`Softpoint de ${largura} por ${altura} pixels`}
          />
        </div>
      </main>
    </div>
  );
}
