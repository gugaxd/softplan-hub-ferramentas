# Hub de ferramentas Softplan

Um site só: o menu na raiz, cada ferramenta num caminho próprio e, em toda
ferramenta, um botão que volta ao menu. A pessoa recebe um link, não vários.

Tudo roda no navegador. Nenhum arquivo que a pessoa carrega sai da máquina dela.
Não há servidor, banco nem login. Se precisar de controle de acesso, proteja o
site inteiro na borda (SSO do provedor, VPN ou rede interna).

```
/                      menu
/<nome-da-ferramenta>/ uma ferramenta
```

## Rodando

```bash
npm install
npm run dev
```

O menu abre em `http://localhost:5173/`. No `npm run dev` aparece também um card
"Em breve" de demonstração, que some em produção (`apenasDev: true` no catálogo).

## Estrutura

```
index.html                 menu (raiz)
vite.config.js             PAGINAS, URL_DO_SITE e BASE
public/                    favicon.svg, apple-touch-icon.png, og.png
src/
  Hub.jsx                  o menu
  ferramentas.js           o catálogo: a única fonte da verdade do menu
  components/
    Miniatura.jsx          desenho de cada card
    Rodape.jsx             rodapé do menu
  styles/hub.css           estilos do menu
  assets/                  Softpoint 3D da faixa de abertura
  comum/                   a casca, importada por todas as páginas
    Header.jsx             marca + nome + voltar ao menu + tema
    MarcaSoftplan.jsx      wordmark em vetor, com a cor vinda do tema
    tema.js                useTema(): claro/escuro com localStorage
    hub.js                 HUB_URL
    controles.jsx          Controle, Linha, Segmentado, Marcador
    tokens.css             o design system em variáveis
    base.css               Sora + reset
    casca.css              tokens + base + cabeçalho
    ferramenta.css         layout painel/palco e os controles
    fontes/                Sora (variable)
mask-studio/               Mask Studio
softpoint-3d/              3D Studio (components/ e types/ em TypeScript, como no original)
softpoint-resizer/         Softpoint Resizer — e o molde: copie para começar uma ferramenta
gradient-studio/           Gradient Studio
gerador-de-grids/          Gerador de grids
gerador-de-estande/        Gerador de estande (HTML + JavaScript puro; só o cabeçalho é React)
```

## Ferramentas

| Caminho | Ferramenta |
|---|---|
| `/mask-studio/` | **Mask Studio** — foto revelada por uma grade de furos softpoint, com o recorte da pessoa escapando da máscara. PNG e SVG. Cópia independente, sem ligação com o repositório de origem. |
| `/softpoint-resizer/` | **Softpoint Resizer** — o Softpoint em qualquer largura, altura e raio, nas cores do DS. SVG e PNG. É a menor ferramenta completa do hub, e por isso o molde das novas. |
| `/gradient-studio/` | **Gradient Studio** — feito a partir do gradient maker do the hub (mesmo motor: mesh animado, distorção, granulação, PNG, SVG, vídeo em loop e código CSS). Os presets são os nove renders oficiais do DS (`assets/gradients/`), refeitos como mesh editável por otimização sobre cada render; as cores ficam presas à paleta Softplan, com quatro intensidades (suave, original, intensa e noturna). |
| `/gerador-de-grids/` | **Gerador de grids** — feito a partir do grid maker do the hub (mesma geometria: malha, ocupação de várias células, escalonamento, formas paramétricas, SVG próprio; exporta SVG vetorial e PNG). Começa no Softpoint, roxo 80 sobre roxo 10; as cores saem da paleta Softplan, com uma cor livre para casos fora da marca. |
| `/gerador-de-estande/` | **Gerador de estande** — estande Softplan em 3D para eventos: 9 tipologias, metragem, elementos, e a arte de cada parede, testeira ou balcão (frase, imagem, produtos, cor, vídeo). Exporta GLB, OBJ + MTL e PNG. Feito pela equipe e recebido como HTML empacotado; desempacotado aqui, com o Three.js e todas as imagens servidos pelo hub — funciona offline. O vídeo da TV foi reduzido de 9,5 MB para 0,9 MB. |
| `/softpoint-3d/` | **3D Studio** — softpoints e o S da Softplan em 3D (Three.js), com animação e exportação PNG, JPG e vídeo WebM. Cópia independente; o servidor de IA do original ficou de fora. As luzes de ambiente (8 HDRIs do Poly Haven, CC0, ~12 MB) ficam em `public/hdri/`: funciona sem internet. Cada peça pode ter forma e cor próprias. |

As versões de `react`, `react-dom`, `three` e `@react-three/*` estão fixas no
`package.json` de propósito: o `@react-three/fiber` 9.7 só aceita React abaixo de 19.3.

A casca fica em `src/comum/` e as ferramentas importam de lá. Não existe cópia
do `Header` por pasta, então uma correção vale para todas de uma vez.

## Ferramenta nova

1. Copie `softpoint-resizer/` para `nome-da-ferramenta/` (minúsculas, com hífen)
   e troque o estado, a função que desenha e os controles pelos da ferramenta nova.
2. Registre `"nome-da-ferramenta"` em `PAGINAS`, no `vite.config.js`.
3. Acrescente a entrada em `src/ferramentas.js`, com `url: "nome-da-ferramenta/"`.
4. Desenhe a miniatura em `src/components/Miniatura.jsx`, com o mesmo `id`.
5. No `index.html` da pasta, troque o título, a descrição e o `og:url`.
6. Confira o tema claro e o escuro, o celular, o tablet e o botão de voltar.

Com `url: null`, o card aparece como "Em breve", sem link. Serve para anunciar
uma ferramenta antes de ela existir.

## Trazendo uma ferramenta que já existe

O que muda numa ferramenta feita fora daqui:

- **Cabeçalho**: apague o `Header.jsx` próprio e use o de `src/comum/`, com
  `homeHref={HUB_URL}`. Veja como em `SoftpointResizer.jsx`.
- **Tema**: apague o `useState` e o `useEffect` de tema e use `useTema()`.
- **Rodapé**: as ferramentas não têm. Quem leva de uma para outra é o botão de menu.
- **CSS**: importe `casca.css` e `ferramenta.css` no `main.jsx`, e troque os
  tokens antigos pelos daqui. Se a ferramenta veio do the hub (`--gm-*`):

| the hub | aqui |
|---|---|
| `--gm-ink`, `--gm-ink2`, `--gm-ink3` | `--ink`, `--ink2`, `--ink3` |
| `--gm-line`, `--gm-text`, `--gm-muted` | `--line`, `--text`, `--muted` |
| `--gm-cyan` (estrutura, foco) | `--acento` |
| `--gm-mag`, `--gm-mag-btn` (seleção, botão principal) | `--acento-2` |
| `--gm-mag-hover` | `--acento-2-hover` |
| `--gm-sobre-cyan`, `--gm-sobre-mag` | `--sobre-acento`, `--sobre-acento-2` |
| `--gm-stage`, `--gm-stage-alt`, `--gm-sombra` | `--stage`, `--stage-alt`, `--sombra` |
| `--gm-radius` | `--radius` (8) ou `--radius-sm` (4) |
| `--gm-sans`, `--gm-mono` | `--sans` (Sora); número usa `.num`, não mono |

- **Esqueleto**: `.ferramenta` > `.painel` (com o `Header` e as `.secao`) +
  `.palco` (com `.barra` e `.palco-area`). É isso que faz o layout de celular
  funcionar sem mexer no JSX.

## Design system

`src/comum/tokens.css` traduz o design system da pasta acima (`../tokens/`).
As decisões que não estavam escritas lá:

- **Claro é o padrão.** O DS manda priorizar o fundo claro. O escuro usa os azuis
  do DS (azul-100, azul-90, azul-80). Os tons que o DS não tem estão marcados como
  "derivado" no arquivo.
- **Dois acentos.** `--acento` é estrutura (eyebrow, foco, link): roxo-80 no
  claro e roxo-40 no escuro, porque o roxo-80 como texto não passa contraste
  sobre azul. `--acento-2` é seleção e botão principal: roxo-80 nos dois temas.
- **Número em Sora tabular** (`.num`, `font-variant-numeric: tabular-nums`), em
  vez de fonte mono. A Sora tem o recurso, e a marca continua uma família só.
- **Raio 8** em tudo, 4 em chips e campos pequenos, e o **Softpoint**
  (`8px 0 8px 0`) na etiqueta de índice e no recorte da miniatura.
- **Sentence case** em títulos e botões; caixa alta só no eyebrow.
- **Painel de 320px.** O wordmark é largo; o nome da ferramenta quebra em até
  duas linhas no cabeçalho antes de ganhar reticências.

**Regra dura:** nenhum componente escreve cor, raio ou espaçamento literal. A
exceção são as cores do arquivo exportado (as do SVG que a pessoa baixa), que
são dados da ferramenta e não da interface.

## Publicando

Vercel ou Netlify: importe o repositório. A detecção é automática (Vite, build
`npm run build`, saída `dist`). Numa intranet (nginx, IIS, S3), publique o
conteúdo de `dist/`.

Antes de publicar, no `vite.config.js`:

- **`URL_DO_SITE`**: o endereço público. As metatags `og:*` precisam de URL
  absoluta, senão o link colado no Teams ou no WhatsApp aparece sem imagem.
  Hoje está um endereço provisório.
- **`BASE`**: só se o hub não ficar na raiz do domínio
  (`/ferramentas/`, por exemplo). O botão de menu e os links do catálogo
  acompanham sozinhos.

As redes guardam cache da primeira leitura do link. Depois de publicar, force a
releitura nos validadores de cada plataforma.

**Renomeou uma ferramenta já publicada?** Redirecione o caminho antigo. No
Vercel, num `vercel.json`, com as três formas (sem a do meio, o link com barra
no fim cai em 404):

```json
{
  "redirects": [
    { "source": "/nome-antigo", "destination": "/nome-novo/", "permanent": true },
    { "source": "/nome-antigo/", "destination": "/nome-novo/", "permanent": true },
    { "source": "/nome-antigo/:caminho+", "destination": "/nome-novo/:caminho+", "permanent": true }
  ]
}
```

## Revisão antes de publicar cada ferramenta

- [ ] Nenhuma cor, raio ou espaçamento literal fora dos tokens
- [ ] Tema claro conferido, não só o escuro
- [ ] Celular: cabeçalho e palco no topo, controles rolando por baixo
- [ ] Tablet em pé e deitado
- [ ] Arraste funciona com o dedo (`.arrastavel` no alvo, eventos `pointer*`)
- [ ] Botão de voltar ao menu presente e funcionando
- [ ] Foco visível em todos os controles, navegável por teclado
- [ ] O arquivo exportado bate com o que está na tela
- [ ] Título, descrição e metatags da página preenchidos
- [ ] Entrada no catálogo, com miniatura própria
