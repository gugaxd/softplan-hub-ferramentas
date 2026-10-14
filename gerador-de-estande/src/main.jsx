import React from "react";
import { createRoot } from "react-dom/client";
import Header from "../../src/comum/Header.jsx";
import { HUB_URL } from "../../src/comum/hub.js";
import { useTema } from "../../src/comum/tema.js";
import "../../src/comum/casca.css";
import "../../src/comum/ferramenta.css";
import "./estilos.css";
import "./three-d-stage.js";
import { iniciar } from "./app.js";

/* Só o cabeçalho é React (o mesmo de todas as ferramentas); o resto da
   interface é o HTML + JavaScript do original, em index.html e app.js. */
function Cabecalho() {
  const [tema, alternarTema] = useTema();
  return <Header tool="Gerador de estande" homeHref={HUB_URL} tema={tema} onToggleTema={alternarTema} />;
}

createRoot(document.getElementById("cabecalho")).render(
  <React.StrictMode>
    <Cabecalho />
  </React.StrictMode>
);

iniciar().catch((erro) => {
  console.error(erro);
  const aviso = document.getElementById("carregando");
  aviso.textContent = "Não foi possível montar o estande. Recarregue a página.";
});
