import React from "react";
import { createRoot } from "react-dom/client";
import Softpoint3DStudio from "./Softpoint3DStudio.jsx";
import "../../src/comum/casca.css";
import "../../src/comum/ferramenta.css";
import "./estilos.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Softpoint3DStudio />
  </React.StrictMode>
);
