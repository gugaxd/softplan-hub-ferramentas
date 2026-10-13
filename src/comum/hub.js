/* Endereço do menu. Sai do `base` do vite.config.js, então continua certo se o
   hub for publicado fora da raiz do domínio (intranet.empresa.com/ferramentas/). */
export const HUB_URL = import.meta.env.BASE_URL;
