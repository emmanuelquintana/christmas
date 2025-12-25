import { useEffect, useRef } from "react";

type Mode = "night" | "party";

type Star = { x: number; y: number; r: number; a: number; tw: number; s: number };

export default function StarfieldCanvas({
    mode,
    reducedMotion,
}: {
    mode: Mode;
    reducedMotion: boolean;
}) {
    const ref = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let w = 0;
        let h = 0;
        let raf = 0;

        const stars: Star[] = [];

        const resize = () => {
            const parent = canvas.parentElement;
            if (!parent) return;
            w = parent.clientWidth;
            h = parent.clientHeight;

            canvas.width = Math.floor(w * devicePixelRatio);
            canvas.height = Math.floor(h * devicePixelRatio);
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

            seed();
            drawStatic();
        };

        const seed = () => {
            stars.length = 0;

            let factor = 1.0;
            let base = 70;
            let sizeFactor = 1.0;

            if (w < 768) {
                factor = 0.5;
                base = 30;
                sizeFactor = 0.6;
            } else if (w < 1024) {
                factor = 0.7;
                base = 50;
            }

            const n = Math.floor(((w * h) / 14000) * factor) + base;
            for (let i = 0; i < n; i++) {
                stars.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    r: (0.5 + Math.random() * 1.2) * sizeFactor,
                    a: 0.25 + Math.random() * 0.75,
                    tw: Math.random() * Math.PI * 2,
                    s: 0.006 + Math.random() * 0.012,
                });
            }
        };

        const drawStatic = () => {
            ctx.clearRect(0, 0, w, h);

            ctx.clearRect(0, 0, w, h);

            const g = ctx.createRadialGradient(w * 0.25, h * 0.15, 0, w * 0.25, h * 0.15, Math.max(w, h));
            if (mode === "party") {
                g.addColorStop(0, "rgba(160,120,255,.10)");
                g.addColorStop(1, "rgba(0,0,0,0)");
            } else {
                g.addColorStop(0, "rgba(120,200,255,.08)");
                g.addColorStop(1, "rgba(0,0,0,0)");
            }
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);

            ctx.fillRect(0, 0, w, h);

            for (const s of stars) {
                ctx.fillStyle = `rgba(255,255,255,${s.a})`;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const loop = () => {
            if (reducedMotion) return;

            if (reducedMotion) return;

            ctx.clearRect(0, 0, w, h);
            drawStatic();

            drawStatic();

            for (const s of stars) {
                s.tw += s.s * (mode === "party" ? 1.6 : 1.0);
                const pulse = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s.tw));
                ctx.fillStyle = `rgba(255,255,255,${Math.min(1, s.a * pulse)})`;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            }

            raf = requestAnimationFrame(loop);
        };

        resize();
        window.addEventListener("resize", resize);

        if (!reducedMotion) raf = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
        };
    }, [mode, reducedMotion]);

    return <canvas ref={ref} className="starCanvas" aria-hidden="true" />;
}
