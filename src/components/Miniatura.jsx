/* Miniatura de cada ferramenta — um retrato do que ela produz, não um ícone.
   Tudo em viewBox 160×100; cor só pelas classes .mini-* (tokens --arte-*).
   Ferramenta nova ganha um desenho aqui, registrado em DESENHOS pelo mesmo id
   do catálogo — ou uma imagem real de resultado, pelo campo `imagem` do
   catálogo, que tem precedência. Sem nenhum dos dois, o card usa o genérico. */

/* Softpoint: cantos superior-esquerdo e inferior-direito arredondados. */
function softpoint(x, y, w, h, r) {
  return `M${x} ${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}H${x + w}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x}Z`;
}

/* uma peça qualquer: forma da marca, título e texto */
function Generica() {
  return (
    <>
      <rect x="40" y="16" width="80" height="68" rx="2" className="mini-papel" />
      <path d={softpoint(50, 26, 26, 26, 8)} className="mini-cor" />
      <rect x="84" y="30" width="26" height="4" rx="2" className="mini-linha" />
      <rect x="84" y="40" width="18" height="4" rx="2" className="mini-linha" />
      <rect x="50" y="62" width="60" height="4" rx="2" className="mini-cor-2" />
      <rect x="50" y="70" width="40" height="4" rx="2" className="mini-linha" />
    </>
  );
}

/* softpoint resizer: um Softpoint com as cotas de largura e altura */
function Modelo() {
  return (
    <>
      <path d={softpoint(50, 20, 56, 56, 18)} className="mini-cor" />
      <path d="M50 86H106M50 83v6M106 83v6" className="mini-cota" />
      <path d="M116 20V76M113 20h6M113 76h6" className="mini-cota" />
    </>
  );
}

/* grid maker: malha de softpoints que cresce para a direita, com um bloco 2×2 */
function Grid() {
  const pecas = [];
  for (let l = 0; l < 4; l++) {
    for (let c = 0; c < 7; c++) {
      if (c >= 1 && c <= 2 && l >= 1 && l <= 2) continue;
      const lado = 6 + (c / 6) * 7;
      const cx = 29 + c * 17;
      const cy = 24.5 + l * 17;
      pecas.push(
        <path key={`${l}-${c}`} d={softpoint(cx - lado / 2, cy - lado / 2, lado, lado, lado * 0.28)} className="mini-cor" />
      );
    }
  }
  return (
    <>
      {pecas}
      <path d={softpoint(41.5, 37, 25, 25, 7)} className="mini-cor-2" />
    </>
  );
}

const DESENHOS = { resizer: Modelo, grid: Grid };

export default function Miniatura({ id }) {
  const Desenho = DESENHOS[id] || Generica;
  return (
    <svg className="hub-mini" viewBox="0 0 160 100" aria-hidden="true">
      <Desenho />
    </svg>
  );
}
