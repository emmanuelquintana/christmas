import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import IntroGift from "./IntroGift";
import StarfieldCanvas from "./StarfieldCanvas";
import SnowCanvas from "./SnowCanvas";
import SkyDecor from "./SkyDecor";
import Tree from "./Tree";
import WishFly from "./WishFly";
import WishModal from "./WishModal";
import WishUI from "./WishUI";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import {
    fetchWishes,
    insertWish,
    subscribeToNewWishes,
    type Wish,
} from "../storage/wishesRemote";

type Flying = {
    id: string;
    name: string;
    message: string;

    startAbs: { x: number; y: number };
    endAbs: { x: number; y: number };

    endPct: { x: number; y: number };
};

function uuidv4() {
    if (globalThis.crypto && "randomUUID" in globalThis.crypto) {
        return (globalThis.crypto as Crypto).randomUUID();
    }

    const bytes = new Uint8Array(16);
    const c = globalThis.crypto as Crypto | undefined;

    if (c?.getRandomValues) c.getRandomValues(bytes);
    else {
        for (let i = 0; i < bytes.length; i++) bytes[i] = (Math.random() * 256) | 0;
    }

    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
        16,
        20
    )}-${hex.slice(20)}`;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const rand = (a: number, b: number) => a + Math.random() * (b - a);

const SAFE = {
    xMin: 0.06,
    xMax: 0.94,
    yMin: 0.10,
    yMax: 0.78,
};

function normalizeWishesToPct(rows: Wish[], skyRect: DOMRect | null) {
    if (!skyRect || skyRect.width <= 0 || skyRect.height <= 0) return { rows, changed: false };

    let changed = false;
    const next = rows.map((w) => {
        const looksPct = w.x >= 0 && w.x <= 1 && w.y >= 0 && w.y <= 1;
        if (looksPct) return w;

        const xPct = clamp(w.x / skyRect.width, SAFE.xMin, SAFE.xMax);
        const yPct = clamp(w.y / skyRect.height, SAFE.yMin, SAFE.yMax);

        changed = true;
        return { ...w, x: xPct, y: yPct };
    });

    return { rows: next, changed };
}

export default function ChristmasScene({ username }: { username: string }) {
    const reduced = usePrefersReducedMotion();

    const sceneRef = useRef<HTMLDivElement | null>(null);
    const skyRef = useRef<HTMLDivElement | null>(null);

    const [introDone, setIntroDone] = useState(false);
    const [flying, setFlying] = useState<Flying[]>([]);
    const [wishes, setWishes] = useState<Wish[]>([]);
    const [selected, setSelected] = useState<Wish | null>(null);

    useEffect(() => {
        let alive = true;

        fetchWishes(username, 200)
            .then((rows) => {
                if (!alive) return;
                setWishes(rows);
            })
            .catch(() => { });

        const unsub = subscribeToNewWishes(username, (w) => {
            setWishes((prev) => {
                if (prev.some((p) => p.id === w.id)) return prev;
                return [...prev, w].slice(-200);
            });
        });

        return () => {
            alive = false;
            unsub();
        };
    }, [username]);

    useLayoutEffect(() => {
        const sky = skyRef.current;
        if (!sky) return;

        const skyRect = sky.getBoundingClientRect();
        const { rows, changed } = normalizeWishesToPct(wishes, skyRect);
        if (changed) setWishes(rows);
    }, [wishes.length]);

    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene || reduced) return;

        const onMove = (e: PointerEvent) => {
            const r = scene.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            scene.style.setProperty("--mx", String(x));
            scene.style.setProperty("--my", String(y));
        };

        const onLeave = () => {
            scene.style.setProperty("--mx", "0");
            scene.style.setProperty("--my", "0");
        };

        scene.addEventListener("pointermove", onMove);
        scene.addEventListener("pointerleave", onLeave);
        return () => {
            scene.removeEventListener("pointermove", onMove);
            scene.removeEventListener("pointerleave", onLeave);
        };
    }, [reduced]);

    useLayoutEffect(() => {
        const el = sceneRef.current;
        if (!el || reduced || !introDone) return;

        const ctx = gsap.context(() => {
            gsap.set(".sceneGrid", { opacity: 0, y: 10, filter: "blur(6px)" });
            gsap.to(".sceneGrid", {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 0.9,
                ease: "power2.out",
            });
        }, el);

        return () => ctx.revert();
    }, [reduced, introDone]);

    useEffect(() => {
        const handler = (ev: Event) => {
            const detail = (ev as CustomEvent).detail as {
                name: string;
                message: string;
                fromRect: DOMRect | null;
            };

            const name = (detail?.name || "").trim();
            const message = (detail?.message || "").trim();
            if (!message) return;

            const scene = sceneRef.current;
            const sky = skyRef.current;
            if (!scene || !sky) return;

            const sRect = scene.getBoundingClientRect();
            const skyRect = sky.getBoundingClientRect();

            const from = detail.fromRect;
            const startX = from ? from.left + from.width / 2 - sRect.left : sRect.width * 0.22;
            const startY = from ? from.top + from.height / 2 - sRect.top : sRect.height * 0.86;

            const endPctX = rand(SAFE.xMin, SAFE.xMax);
            const endPctY = rand(SAFE.yMin, SAFE.yMax);

            const skyOffsetX = skyRect.left - sRect.left;
            const skyOffsetY = skyRect.top - sRect.top;

            const endAbsX = skyOffsetX + endPctX * skyRect.width;
            const endAbsY = skyOffsetY + endPctY * skyRect.height;

            const id = uuidv4();

            setFlying((prev) => [
                ...prev,
                {
                    id,
                    name,
                    message,
                    startAbs: { x: startX, y: startY },
                    endAbs: { x: endAbsX, y: endAbsY },
                    endPct: { x: endPctX, y: endPctY },
                },
            ]);
        };

        window.addEventListener("wish:send", handler as EventListener);
        return () => window.removeEventListener("wish:send", handler as EventListener);
    }, []);

    const onFlyDone = (id: string) => {
        setFlying((prev) => {
            const found = prev.find((f) => f.id === id);
            const next = prev.filter((f) => f.id !== id);

            if (found) {
                const star: Wish = {
                    id: found.id,
                    name: found.name,
                    message: found.message,
                    x: found.endPct.x,
                    y: found.endPct.y,
                    createdAt: Date.now(),
                };

                setWishes((w) => {
                    if (w.some((p) => p.id === star.id)) return w;
                    return [...w, star].slice(-200);
                });

                insertWish({
                    id: star.id,
                    name: star.name,
                    message: star.message,
                    x: star.x,
                    y: star.y,
                    username,
                }).catch(() => { });
            }

            return next;
        });
    };

    useEffect(() => {
        if (reduced) return;

        const onShow = () => {
            const scene = sceneRef.current;
            if (!scene) return;

            const bulbs = scene.querySelectorAll(".treeBulb");
            const star = scene.querySelector(".treeTopStar");
            const gifts = scene.querySelectorAll(".treeGift");

            const tl = gsap.timeline();

            if (star) {
                tl.to(star, { scale: 1.18, duration: 0.18, ease: "power2.out" }, 0).to(
                    star,
                    { scale: 1.0, duration: 0.7, ease: "elastic.out(1,0.45)" },
                    0.18
                );
            }

            tl.to(
                bulbs,
                {
                    opacity: 1,
                    scale: 1.28,
                    duration: 0.18,
                    ease: "power2.out",
                    stagger: { each: 0.02, from: "start" },
                },
                0.06
            ).to(
                bulbs,
                {
                    opacity: 0.75,
                    scale: 1,
                    duration: 0.65,
                    ease: "sine.inOut",
                    stagger: { each: 0.02, from: "start" },
                },
                0.22
            );

            tl.fromTo(
                gifts,
                { y: 0 },
                { y: -10, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out", stagger: 0.06 },
                0.1
            );
        };

        window.addEventListener("show:all", onShow as EventListener);
        return () => window.removeEventListener("show:all", onShow as EventListener);
    }, [reduced]);

    return (
        <div ref={sceneRef} className="scene">
            {!introDone && <IntroGift reducedMotion={reduced} onDone={() => setIntroDone(true)} />}

            <div className="sceneGrid">
                <div ref={skyRef} className="skyArea">
                    <StarfieldCanvas mode="night" reducedMotion={reduced} />
                    <SkyDecor reducedMotion={reduced} />
                    <SnowCanvas mode="night" reducedMotion={reduced} />

                    <div className="wishStarsLayer">
                        {wishes.map((w) => {
                            const looksPct = w.x >= 0 && w.x <= 1 && w.y >= 0 && w.y <= 1;
                            const left = looksPct ? `${w.x * 100}%` : `${w.x}px`;
                            const top = looksPct ? `${w.y * 100}%` : `${w.y}px`;

                            return (
                                <button
                                    key={w.id}
                                    className="wishStar"
                                    style={{ left, top }}
                                    onClick={() => setSelected(w)}
                                    aria-label="Ver deseo"
                                    title="Ver deseo"
                                >
                                    <span className="wishStarCore" />
                                </button>
                            );
                        })}
                    </div>

                    <div className="skyHint">✨ Haz click en las estrellas para ver los mensajes.</div>
                </div>

                <div className="treeArea">
                    <Tree reducedMotion={reduced} />
                </div>
            </div>

            <div className="flyLayer">
                {flying.map((f) => (
                    <WishFly
                        key={f.id}
                        id={f.id}
                        start={f.startAbs}
                        end={f.endAbs}
                        reducedMotion={reduced}
                        onDone={onFlyDone}
                    />
                ))}
            </div>

            <WishUI />

            {selected && <WishModal wish={selected} onClose={() => setSelected(null)} />}
        </div>
    );
}
