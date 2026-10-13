/* Rodapé do menu. As ferramentas não têm rodapé: quem leva de uma para outra é
   o botão de menu no cabeçalho. */
export default function Rodape({ links = [] }) {
  return (
    <footer className="hub-rodape">
      <div className="hub-rodape-conteudo">
        {links.map((l) => (
          <a key={l.href} href={l.href} target="_blank" rel="noreferrer noopener">
            {l.label}
          </a>
        ))}
        <span className="hub-rodape-direitos">
          © <span className="num">{new Date().getFullYear()}</span> Softplan. Todos os direitos
          reservados.
        </span>
      </div>
    </footer>
  );
}
