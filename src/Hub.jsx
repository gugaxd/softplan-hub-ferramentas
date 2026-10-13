import Header from "./comum/Header.jsx";
import { useTema } from "./comum/tema.js";
import Miniatura from "./components/Miniatura.jsx";
import Rodape from "./components/Rodape.jsx";
import { FERRAMENTAS, LINKS_RODAPE } from "./ferramentas.js";
import grafismo from "./assets/softpoint-3d.png";

const BASE = import.meta.env.BASE_URL;
const VISIVEIS = FERRAMENTAS.filter((f) => !f.apenasDev || import.meta.env.DEV);

const doisDigitos = (n) => String(n).padStart(2, "0");

function Card({ f, indice }) {
  const ativo = Boolean(f.url);
  const Tag = ativo ? "a" : "div";
  const props = ativo ? { href: BASE + f.url } : { "aria-disabled": "true" };
  return (
    <Tag className={`hub-card${ativo ? "" : " hub-card--breve"}`} {...props}>
      <div className="hub-card-palco">
        {f.imagem ? (
          <img className="hub-mini hub-mini--imagem" src={f.imagem} alt="" loading="lazy" />
        ) : (
          <Miniatura id={f.id} />
        )}
      </div>
      <div className="hub-card-corpo">
        <div className="hub-card-topo">
          <span className="hub-card-indice num">{doisDigitos(indice + 1)}</span>
          <span className="hub-card-estado">
            {ativo ? "Abrir" : "Em breve"}
            {ativo && (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 18l6-6M13 6l6 6" />
              </svg>
            )}
          </span>
        </div>
        <h2 className="hub-card-nome">{f.nome}</h2>
        <p className="hub-card-desc">{f.descricao}</p>
        <ul className="hub-card-formatos" aria-label="Formatos de exportação">
          {f.formatos.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>
    </Tag>
  );
}

export default function Hub() {
  const [tema, alternarTema] = useTema();
  const prontas = VISIVEIS.filter((f) => f.url).length;

  return (
    <div className="hub">
      <Header tool="Hub de ferramentas" tema={tema} onToggleTema={alternarTema} />

      <main className="hub-main">
        <section className="hub-faixa">
          <div className="hub-faixa-conteudo">
            <div className="hub-intro">
              <p className="hub-eyebrow">Ferramentas</p>
              <h2 className="hub-chamada">Escolha uma ferramenta para começar.</h2>
              <p className="hub-nota">
                <span className="num">{doisDigitos(prontas)}</span> disponíveis · tudo roda no
                navegador · nenhum arquivo sai do seu computador
              </p>
            </div>
            <img className="hub-grafismo" src={grafismo} alt="" width="611" height="399" />
          </div>
        </section>

        <div className="hub-grade-area">
          {VISIVEIS.length ? (
            <nav className="hub-grade" aria-label="Ferramentas">
              {VISIVEIS.map((f, i) => (
                <Card key={f.id} f={f} indice={i} />
              ))}
            </nav>
          ) : (
            <p className="hub-vazio">Nenhuma ferramenta publicada ainda.</p>
          )}
        </div>
      </main>

      <Rodape links={LINKS_RODAPE} />
    </div>
  );
}
