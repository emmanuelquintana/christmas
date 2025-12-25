import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

type Wish = {
    id: string;
    name: string;
    message: string;
    x: number;
    y: number;
    createdAt: number;
};

export default function WishModal({ wish, onClose }: { wish: Wish; onClose: () => void }) {
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const cardRef = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        const overlay = overlayRef.current;
        const card = cardRef.current;
        if (!overlay || !card) return;

        gsap.set(overlay, { opacity: 0 });
        gsap.set(card, { opacity: 0, y: 10, scale: 0.98, filter: "blur(6px)" });

        const tl = gsap.timeline();
        tl.to(overlay, { opacity: 1, duration: 0.18, ease: "power2.out" })
            .to(card, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.32, ease: "power2.out" }, 0.02);

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);

        return () => {
            window.removeEventListener("keydown", onKey);
            tl.kill();
        };
    }, [onClose]);

    const closeAnimated = () => {
        const overlay = overlayRef.current;
        const card = cardRef.current;
        if (!overlay || !card) return onClose();

        gsap.timeline({
            onComplete: onClose,
        })
            .to(card, { opacity: 0, y: 8, scale: 0.985, filter: "blur(6px)", duration: 0.18, ease: "power2.in" })
            .to(overlay, { opacity: 0, duration: 0.16, ease: "power2.in" }, 0.02);
    };

    const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) closeAnimated();
    };

    const fromName = (wish.name || "").trim() || "Anónimo";

    return (
        <div ref={overlayRef} className="modalOverlay" onMouseDown={handleOverlayMouseDown} role="dialog" aria-modal="true">
            <div ref={cardRef} className="modalCard">
                <div className="modalHeader">
                    <div className="modalTitle">🎄 Mensaje de Navidad</div>
                    <button className="modalClose" onClick={closeAnimated} aria-label="Cerrar">
                        ✕
                    </button>
                </div>

                <div className="modalMeta">
                    <div className="metaRow">
                        <span className="metaLabel">De:</span>
                        <span className="metaValue">{fromName}</span>
                    </div>
                    <div className="metaRow">
                        <span className="metaLabel">Mensaje:</span>
                    </div>
                </div>

                <div className="modalBody">
                    <div className="modalMessage">{wish.message}</div>
                </div>

                <div className="modalFooter">
                    ✨ Puedes seguir enviando deseos y se guardarán como estrellas.
                </div>
            </div>
        </div>
    );
}
