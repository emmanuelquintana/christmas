import { useEffect, useRef } from "react";

type Mode = "night" | "party";

type Flake = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    a: number;
    wob: number;
    ws: number;
};

export default function SnowCanvas({
    mode,
    reducedMotion,
}: {
    mode: Mode;
    reducedMotion: boolean;
}) {
    const ref = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas || reducedMotion) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let w = 0;
        let h = 0;
        let raf = 0;

        const flakes: Flake[] = [];

        const seed = () => {
            flakes.length = 0;

            const base = mode === "party" ? 140 : 220;

            // ✅ menos nieve en tablet/móvil
            const factor =
                w <= 520 ? 0.40 :   // móvil
                    w <= 980 ? 0.62 :   // tablet
                        1.0;                // desktop

            const n = Math.max(40, Math.round(base * factor));

            for (let i = 0; i < n; i++) {
                flakes.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.35,
                    vy: 0.25 + Math.random() * 0.95,
                    r: 0.7 + Math.random() * 2.2,
                    a: 0.10 + Math.random() * 0.55,
                    wob: Math.random() * Math.PI * 2,
                    ws: 0.006 + Math.random() * 0.02,
                });
            }
        };

        const resize = () => {
            const parent = canvas.parentElement;
            if (!parent) return;

            w = parent.clientWidth;
            h = parent.clientHeight;

            const dpr = window.devicePixelRatio || 1;

            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            seed();
        };

        const loop = () => {
            ctx.clearRect(0, 0, w, h);

            ctx.globalCompositeOperation = "lighter";

            for (const f of flakes) {
                f.wob += f.ws;
                const drift = Math.sin(f.wob) * 0.55;

                f.x += f.vx + drift * 0.15;
                f.y += f.vy;

                if (f.y > h + 12) {
                    f.y = -12;
                    f.x = Math.random() * w;
                }
                if (f.x < -12) f.x = w + 12;
                if (f.x > w + 12) f.x = -12;

                const alpha = f.a * (mode === "party" ? 0.75 : 1);
                ctx.fillStyle = `rgba(255,255,255,${alpha})`;
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalCompositeOperation = "source-over";
            raf = requestAnimationFrame(loop);
        };

        resize();
        window.addEventListener("resize", resize);
        raf = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
        };
    }, [mode, reducedMotion]);

    return <canvas ref={ref} className="snowCanvas" aria-hidden="true" />;
}
