import imagemMask from "./assets/miniaturas/mask-studio.jpg";
import imagem3D from "./assets/miniaturas/softpoint-3d.jpg";
import imagemGradiente from "./assets/miniaturas/gradient-studio.jpg";
import imagemEstande from "./assets/miniaturas/gerador-de-estande.jpg";

/* Catálogo do hub — a única fonte da verdade do menu. Ferramenta nova entra aqui
   e o menu se monta sozinho; registre a pasta também em PAGINAS, no vite.config.js.

   id         casa com o desenho em components/Miniatura.jsx (sem desenho, usa o genérico)
   imagem     opcional: uma imagem de resultado no lugar do desenho (src/assets/miniaturas/)
   nome       em sentence case, como manda o DS: "Gerador de grids"
   descricao  uma frase sobre o que ela resolve, não sobre o que ela tem
   formatos   etiquetas no rodapé do card
   url        pasta da ferramenta, relativa à raiz do site: "gerador-de-grids/"
              null = o card aparece como "Em breve", sem link
   apenasDev  true = só aparece no `npm run dev`. É o caso do card "Em breve"
              de demonstração, no fim da lista. Em produção, ele some. */
export const FERRAMENTAS = [
  {
    id: "mask",
    nome: "Mask Studio",
    descricao:
      "Uma foto revelada por uma grade de furos softpoint, com o recorte da pessoa escapando da máscara.",
    formatos: ["PNG", "SVG"],
    url: "mask-studio/",
    imagem: imagemMask,
  },
  {
    id: "tres-d",
    nome: "3D Studio",
    descricao:
      "Softpoints e o S da Softplan em 3D, no material esmaltado da marca, para imagem ou vídeo com fundo transparente.",
    formatos: ["PNG", "JPG", "WebM"],
    url: "softpoint-3d/",
    imagem: imagem3D,
  },
  {
    id: "resizer",
    nome: "Softpoint Resizer",
    descricao:
      "O Softpoint, a forma da marca, em qualquer tamanho e raio, nas cores do design system.",
    formatos: ["SVG", "PNG"],
    url: "softpoint-resizer/",
  },
  {
    id: "gradiente",
    nome: "Gradient Studio",
    descricao:
      "Os nove gradientes oficiais da marca, editáveis e animados, com variações de intensidade na paleta do DS.",
    formatos: ["PNG", "SVG", "vídeo", "CSS"],
    url: "gradient-studio/",
    imagem: imagemGradiente,
  },
  {
    id: "grid",
    nome: "Gerador de grids",
    descricao:
      "Grids modulares com o Softpoint e outras formas, ocupação de várias células e escalonamento progressivo.",
    formatos: ["SVG", "PNG"],
    url: "gerador-de-grids/",
  },
  {
    id: "estande",
    nome: "Gerador de estande",
    descricao:
      "Estandes Softplan para eventos e feiras em 3D: tipologia, medidas, elementos e a arte de cada parede.",
    formatos: ["GLB", "OBJ", "PNG"],
    url: "gerador-de-estande/",
    imagem: imagemEstande,
  },
  {
    id: "breve",
    nome: "Próxima ferramenta",
    descricao:
      "Com url: null o card aparece assim, sem link. Serve para anunciar uma ferramenta antes de ela existir.",
    formatos: ["PDF"],
    url: null,
    apenasDev: true,
  },
];

export const LINKS_RODAPE = [{ label: "softplan.com.br", href: "https://www.softplan.com.br" }];
