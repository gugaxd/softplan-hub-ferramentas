import { useEffect, useState } from "react";

/* Tema claro e escuro, igual em todas as páginas do hub.
   O <head> de cada index.html já aplica o tema salvo antes da primeira pintura
   (o script anti-piscada); aqui o React lê esse valor e passa a mantê-lo.
   Se um dia o nome do hub mudar, leia a chave antiga como alternativa no
   script do <head>, para ninguém perder a preferência. */
export const CHAVE_TEMA = "softplan-hub:tema";

function temaInicial() {
  return document.documentElement.dataset.tema === "escuro" ? "escuro" : "claro";
}

export function useTema() {
  const [tema, setTema] = useState(temaInicial);

  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    try {
      localStorage.setItem(CHAVE_TEMA, tema);
    } catch (e) {
      /* aba anônima com storage bloqueado: o tema só não persiste */
    }
  }, [tema]);

  const alternarTema = () => setTema((t) => (t === "escuro" ? "claro" : "escuro"));
  return [tema, alternarTema];
}
