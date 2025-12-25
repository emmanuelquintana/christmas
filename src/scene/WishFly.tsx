import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

type Point = { x: number; y: number };

function bezier(p0: Point, p1: Point, p2: Point, p3: Point, t: number) {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    const x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
    const y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;


    const dx =
        3 * uu * (p1.x - p0.x) +
        6 * u * t * (p2.x - p1.x) +
        3 * tt * (p3.x - p2.x);

    const dy =
        3 * uu * (p1.y - p0.y) +
        6 * u * t * (p2.y - p1.y) +
        3 * tt * (p3.y - p2.y);

    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    return { x, y, angle };
}

export default function WishFly({
    id,
    start,
    end,
    reducedMotion,
    onDone,
}: {
    id: string;
    start: Point;
    end: Point;
    reducedMotion: boolean;
    onDone: (id: string) => void;
}) {
    const ref = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (reducedMotion) {
            onDone(id);
            return;
        }

        const dx = end.x - start.x;

        const cp1: Point = {
            x: start.x + dx * 0.25 + (Math.random() * 40 - 20),
            y: start.y - 140 + (Math.random() * 35 - 10),
        };
        const cp2: Point = {
            x: start.x + dx * 0.75 + (Math.random() * 40 - 20),
            y: end.y - 120 + (Math.random() * 35 - 10),
        };

        const prog = { t: 0 };

        gsap.set(el, { opacity: 0, x: 0, y: 0 });

        const tween = gsap.to(prog, {
            t: 1,
            duration: 1.15,
            ease: "power2.out",
            onStart: () => {
                gsap.to(el, { opacity: 1, duration: 0.12, ease: "power2.out" });
            },
            onUpdate: () => {
                const p = bezier(start, cp1, cp2, end, prog.t);
                el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.angle}deg)`;
            },
            onComplete: () => {
                gsap.to(el, {
                    opacity: 0,
                    duration: 0.12,
                    ease: "power2.inOut",
                    onComplete: () => onDone(id),
                });
            },
        });

        return () => {
            tween.kill();
        };
    }, [id, start.x, start.y, end.x, end.y, reducedMotion, onDone]);

    return (
        <div ref={ref} className="wishFly2" aria-hidden="true">
            <span className="wishFlyTail2" />
            <span className="wishFlyCore2" />
        </div>
    );
}
