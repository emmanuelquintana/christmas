import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

type Mode = "night" | "party";

export default function Lantern({
    id,
    start,
    end,
    mode,
    reducedMotion,
    onDone,
}: {
    id: string;
    start: { x: number; y: number };
    end: { x: number; y: number };
    mode: Mode;
    reducedMotion: boolean;
    onDone: (id: string, end: { x: number; y: number }) => void;
}) {
    const ref = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (reducedMotion) {
            // instant
            onDone(id, end);
            return;
        }

        gsap.set(el, {
            x: start.x,
            y: start.y,
            opacity: 0,
            scale: 0.8,
            rotate: gsap.utils.random(-8, 8),
            transformOrigin: "50% 50%",
        });

        const wobble = gsap.to(el, {
            rotate: "+=" + gsap.utils.random(-10, 10),
            duration: 0.55,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
        });

        const driftX = gsap.to(el, {
            x: end.x,
            duration: mode === "party" ? 2.9 : 3.6,
            ease: "power1.inOut",
        });

        const driftY = gsap.to(el, {
            y: end.y,
            duration: mode === "party" ? 2.9 : 3.6,
            ease: "power1.inOut",
            onComplete: () => {
                wobble.kill();
                driftX.kill();
                driftY.kill();
                gsap.to(el, {
                    opacity: 0,
                    scale: 0.6,
                    duration: 0.2,
                    onComplete: () => onDone(id, end),
                });
            },
        });

        const appear = gsap.to(el, {
            opacity: 1,
            scale: 1,
            duration: 0.35,
            ease: "power2.out",
        });

        return () => {
            wobble.kill();
            driftX.kill();
            driftY.kill();
            appear.kill();
        };
    }, [id, start.x, start.y, end.x, end.y, mode, reducedMotion, onDone]);

    return <div ref={ref} className={`lantern ${mode}`} aria-hidden="true" />;
}
