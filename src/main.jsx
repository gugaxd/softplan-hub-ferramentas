import React from "react";
import { createRoot } from "react-dom/client";
import Hub from "./Hub.jsx";
import "./comum/casca.css";
import "./styles/hub.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Hub />
  </React.StrictMode>
);
