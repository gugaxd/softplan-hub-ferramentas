import { useEffect, useId, useState } from "react";

/* Vocabulário de controles que toda ferramenta repete. Estilos em ferramenta.css. */

const limitar = (n, min, max) => Math.min(max, Math.max(min, n));
const casasDe = (passo) => (String(passo).split(".")[1] || "").length;

/* Campo numérico + slider. O campo aceita digitação livre e só confirma no
   Enter ou ao sair, para "6" não virar o mínimo antes de a pessoa digitar "640". */
export function Controle({ rotulo, unidade = "", min, max, passo = 1, valor, onChange, slider = true }) {
  const id = useId();
  const casas = casasDe(passo);
  const mostrar = (v) => Number(v).toFixed(casas);
  const [texto, setTexto] = useState(mostrar(valor));
  useEffect(() => setTexto(mostrar(valor)), [valor]); // eslint-disable-line react-hooks/exhaustive-deps

  const confirmar = () => {
    const n = Number(texto.replace(",", "."));
    const final =
      texto.trim() === "" || Number.isNaN(n)
        ? valor
        : Number(limitar(Math.round(n / passo) * passo, min, max).toFixed(casas));
    setTexto(mostrar(final));
    onChange(final);
  };

  return (
    <div className="controle">
      <label className="rotulo" htmlFor={id}>
        {rotulo}
      </label>
      <span className="campo">
        <input
          id={id}
          className="valor"
          inputMode={casas ? "decimal" : "numeric"}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onBlur={confirmar}
          onKeyDown={(e) => e.key === "Enter" && confirmar()}
        />
        <span className="unidade">{unidade}</span>
      </span>
      {slider && (
        <input
          className="slider"
          type="range"
          min={min}
          max={max}
          step={passo}
          value={valor}
          aria-label={rotulo}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      )}
    </div>
  );
}

/* Rótulo à esquerda e qualquer controle à direita. Um .segmentado dentro dela
   desce para a linha de baixo e ocupa a largura toda. */
export function Linha({ rotulo, htmlFor, children }) {
  return (
    <div className="controle">
      {htmlFor ? (
        <label className="rotulo" htmlFor={htmlFor}>
          {rotulo}
        </label>
      ) : (
        <span className="rotulo">{rotulo}</span>
      )}
      {children}
    </div>
  );
}

/* Opções exclusivas. `nome` pode ser texto ou um ícone; com ícone, passe `titulo`. */
export function Segmentado({ rotulo, opcoes, valor, onChange, className = "" }) {
  return (
    <div className={`segmentado ${className}`.trim()} role="group" aria-label={rotulo}>
      {opcoes.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={valor === o.id}
          aria-label={o.titulo}
          title={o.titulo}
          onClick={() => onChange(o.id)}
        >
          {o.nome}
        </button>
      ))}
    </div>
  );
}

export function Marcador({ marcado, onChange, children }) {
  return (
    <label className="marcador">
      <input type="checkbox" checked={marcado} onChange={(e) => onChange(e.target.checked)} />
      {children}
    </label>
  );
}
