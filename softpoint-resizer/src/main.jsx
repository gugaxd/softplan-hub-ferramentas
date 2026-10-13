import React from "react";
import { createRoot } from "react-dom/client";
import SoftpointResizer from "./SoftpointResizer.jsx";
import "../../src/comum/casca.css";
import "../../src/comum/ferramenta.css";
/* Estilos próprios da ferramenta entram aqui, depois destes dois, num
   ./estilos.css — sempre com os tokens, nunca com cor ou medida literal. */

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SoftpointResizer />
  </React.StrictMode>
);
