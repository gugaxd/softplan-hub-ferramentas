import MarcaSoftplan from "./MarcaSoftplan.jsx";

/* A casca de todas as páginas: marca Softplan, risco de 1px, nome da ferramenta
   e, à direita, voltar ao menu e alternar tema. Com `homeHref`, a marca também
   vira link para o menu; sem ele, o cabeçalho funciona igual, só sem os links.
   Ícones: Tabler (o conjunto do DS), em SVG inline para não depender de CDN. */
export default function Header({ tool, homeHref, tema, onToggleTema }) {
  const Marca = homeHref ? "a" : "div";
  const marcaProps = homeHref ? { href: homeHref, title: "Todas as ferramentas" } : {};
  const escuro = tema === "escuro";

  return (
    <header className="cabecalho">
      <Marca className="cabecalho-marca" {...marcaProps}>
        <MarcaSoftplan className="cabecalho-logo" />
        <span className="cabecalho-risco" aria-hidden="true" />
        <h1 className="cabecalho-nome">{tool}</h1>
      </Marca>

      <div className="cabecalho-acoes">
        {homeHref && (
          <a
            className="botao-icone"
            href={homeHref}
            aria-label="Voltar ao menu de ferramentas"
            title="Todas as ferramentas"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
              <path d="M14 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z" />
              <path d="M4 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
              <path d="M14 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z" />
            </svg>
          </a>
        )}
        <button
          type="button"
          className="botao-icone"
          onClick={onToggleTema}
          aria-label={escuro ? "Mudar para tema claro" : "Mudar para tema escuro"}
          title={escuro ? "Tema claro" : "Tema escuro"}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {escuro ? (
              <>
                <path d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0-8 0" />
                <path d="M3 12h1m8-9v1m8 8h1m-9 8v1M5.6 5.6l.7.7m12.1-.7l-.7.7m0 11.4l.7.7m-12.1-.7l-.7.7" />
              </>
            ) : (
              <path d="M12 3h.393a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 2.992z" />
            )}
          </svg>
        </button>
      </div>
    </header>
  );
}
