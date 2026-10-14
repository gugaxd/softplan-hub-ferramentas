import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

/* Um único site: o menu na raiz e cada ferramenta numa pasta própria, que vira
   uma página do build (minha-ferramenta/ → /minha-ferramenta/). Ferramenta nova
   entra aqui e no catálogo, em src/ferramentas.js. */
const PAGINAS = ["mask-studio", "softpoint-3d", "softpoint-resizer", "gradient-studio", "gerador-de-grids", "gerador-de-estande"];

/* Endereço público do hub, para as metatags og:* de todas as páginas (as redes
   só leem URL absoluta). Troque quando o domínio estiver definido. */
const URL_DO_SITE = "https://hub-softplan.vercel.app";

/* Fora da raiz do domínio — intranet.empresa.com/ferramentas/, por exemplo —
   troque para "/ferramentas/". O botão de menu e os links do catálogo acompanham
   sozinhos, porque leem import.meta.env.BASE_URL. */
const BASE = "/";

const semBarraFinal = (s) => s.replace(/\/$/, "");

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    {
      /* troca %URL_DO_SITE% nos index.html pelo endereço + base */
      name: "url-do-site",
      transformIndexHtml: {
        order: "pre",
        handler: (html) =>
          html.replaceAll("%URL_DO_SITE%", semBarraFinal(URL_DO_SITE) + semBarraFinal(BASE)),
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        hub: resolve(__dirname, "index.html"),
        ...Object.fromEntries(PAGINAS.map((p) => [p, resolve(__dirname, p, "index.html")])),
      },
    },
  },
});
