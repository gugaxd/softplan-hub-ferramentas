import React from "react";
import { createRoot } from "react-dom/client";
import GradientStudio from "./GradientStudio.jsx";
import "../../src/comum/casca.css";
import "../../src/comum/ferramenta.css";
import "./estilos.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GradientStudio />
  </React.StrictMode>
);
