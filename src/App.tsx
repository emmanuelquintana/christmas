import { useEffect, useState } from "react";
import ChristmasScene from "./scene/ChristmasScene";
import WelcomeAuth from "./scene/WelcomeAuth";
import "./styles.css";

export default function App() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const u = params.get("u");
    if (u) setUsername(u);
  }, []);

  const onAll = () => window.dispatchEvent(new Event("show:all"));

  if (!username) {
    return <WelcomeAuth />;
  }

  return (
    <div className="app">
      <header className="hud">
        <div className="brand">
          <div className="badge">🎁</div>
          <div className="titles">
            <div className="title">Feliz Navidad</div>
            <div className="subtitle">Mundo de @{username} ✨</div>
          </div>
        </div>

        <div className="controls">
          <button className="pill" onClick={() => (window.location.href = "/")}>
            <span className="desktop-text">Crear mi espacio 🎄</span>
            <span className="mobile-text">Crear 🎄</span>
          </button>
          <button
            className="pill"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("¡Enlace copiado! Compártelo con quien quieras ❤️");
            }}
          >
            <span className="desktop-text">Compartir 🔗</span>
            <span className="mobile-text">Link 🔗</span>
          </button>
          <button className="pill btn-encender" onClick={onAll}>
            <span className="desktop-text">Encender todo ✨</span>
            <span className="mobile-text">Encender ✨</span>
          </button>
        </div>
      </header>

      <div className="stage">
        <ChristmasScene username={username} />
      </div>
    </div>
  );
}
