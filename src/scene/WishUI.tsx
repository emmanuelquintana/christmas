import { useRef, useState } from "react";
import gsap from "gsap";

export default function WishUI() {
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");

    const send = (e: React.FormEvent) => {
        e.preventDefault();
        const msg = message.trim();
        if (!msg) return;

        const rect = btnRef.current?.getBoundingClientRect() ?? null;

        // micro feedback
        if (btnRef.current) {
            gsap.fromTo(btnRef.current, { scale: 1 }, { scale: 0.94, duration: 0.08, yoyo: true, repeat: 1, ease: "power2.out" });
        }

        window.dispatchEvent(
            new CustomEvent("wish:send", {
                detail: {
                    name: name.trim(),
                    message: msg,
                    fromRect: rect,
                },
            })
        );

        setMessage("");
    };

    return (
        <div className="wishUI">
            <form className="wishCard" onSubmit={send}>
                <div className="wishRow">
                    <div className="wishLabel">Tu nombre (opcional)</div>
                    <input className="wishInput" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Juan" />
                </div>

                <div className="wishRow">
                    <div className="wishLabel">Mensaje</div>
                    <textarea className="wishText" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Escribe tu deseo navideño…" />
                </div>

                <div className="wishActions">
                    <button ref={btnRef} className="send" type="submit">
                        Enviar ✨
                    </button>
                    <div className="hint">Tip: al enviarlo, se convierte en estrella. Haz click para leer ✨</div>
                </div>
            </form>
        </div>
    );
}
