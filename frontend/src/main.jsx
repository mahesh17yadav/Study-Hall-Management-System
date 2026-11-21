import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

// Initialize the particle engine.
const particlesInit = async (engine) => {
  await loadSlim(engine);
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ParticlesProvider init={particlesInit}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ParticlesProvider>
  </React.StrictMode>
);