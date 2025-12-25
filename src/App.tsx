import ChristmasScene from "./scene/ChristmasScene";
import "./styles.css";

export default function App() {
  const onAll = () => window.dispatchEvent(new Event("show:all"));

  return (
    <div className="app">
      <header className="hud">
        <div className="brand">
          <div className="badge">🎁</div>
          <div className="titles">
            <div className="title">Feliz Navidad</div>
            <div className="subtitle">Escribe un deseo y conviértelo en estrella ✨</div>
          </div>
        </div>

        <div className="controls">
          <button className="pill" onClick={onAll}>
            Encender todo ✨
          </button>
        </div>
      </header>

      <div className="stage">
        <ChristmasScene />
      </div>
    </div>
  );
}
