import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export default function IntroGift({
    reducedMotion,
    onDone,
}: {
    reducedMotion: boolean;
    onDone: () => void;
}) {
    const rootRef = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const lid = root.querySelector(".giftLid") as SVGGElement | null;
        const base = root.querySelector(".giftBase") as SVGGElement | null;
        const bow = root.querySelector(".giftBow") as SVGGElement | null;
        const glow = root.querySelector(".giftGlow") as SVGCircleElement | null;
        const txt = root.querySelector(".introText") as HTMLDivElement | null;

        if (!lid || !base || !bow || !glow || !txt) {
            onDone();
            return;
        }


        if (reducedMotion) {
            const t = setTimeout(onDone, 450);
            return () => clearTimeout(t);
        }

        gsap.set(root, { opacity: 1 });
        gsap.set([base, bow], { scale: 0.92, opacity: 0, transformOrigin: "50% 60%" });
        gsap.set(lid, { rotation: 0, y: 0, transformOrigin: "50% 92%" });
        gsap.set(glow, { opacity: 0.0, scale: 0.9, transformOrigin: "50% 50%" });
        gsap.set(txt, { opacity: 0, y: 6, filter: "blur(6px)" });

        const tl = gsap.timeline({
            onComplete: () => {
                gsap.to(root, {
                    opacity: 0,
                    duration: 0.25,
                    ease: "power2.inOut",
                    onComplete: onDone,
                });
            },
        });

        tl.to([base, bow], { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out", stagger: 0.03 }, 0)
            .to(txt, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.3, ease: "power2.out" }, 0.08)
            .to(glow, { opacity: 0.65, scale: 1.05, duration: 0.45, ease: "sine.inOut" }, 0.1)
            .to(lid, { rotation: -18, y: -14, duration: 0.45, ease: "power2.out" }, 0.55)
            .to(glow, { opacity: 0.9, scale: 1.25, duration: 0.35, ease: "power2.out" }, 0.62)
            .to(lid, { rotation: -28, y: -18, duration: 0.35, ease: "power2.out" }, 0.78)
            .to(txt, { opacity: 0, y: -4, duration: 0.18, ease: "power2.in" }, 1.05);


        const onSkip = () => {
            tl.kill();
            gsap.to(root, { opacity: 0, duration: 0.16, ease: "power2.inOut", onComplete: onDone });
        };
        root.addEventListener("pointerdown", onSkip);

        return () => {
            root.removeEventListener("pointerdown", onSkip);
            tl.kill();
        };
    }, [reducedMotion, onDone]);

    return (
        <div ref={rootRef} className="introOverlay" aria-hidden="true">
            <div className="introCenter">
                <div className="introText">Cargando experiencia… ✨</div>

                <svg className="introGift" viewBox="0 0 260 240">
                    <defs>
                        <radialGradient id="giftGlowG" cx="50%" cy="50%" r="60%">
                            <stop offset="0%" stopColor="rgba(255,255,255,.65)" />
                            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                        </radialGradient>
                        <linearGradient id="boxG" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="rgba(255,90,160,.85)" />
                            <stop offset="100%" stopColor="rgba(120,60,255,.55)" />
                        </linearGradient>
                        <linearGradient id="lidG" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="rgba(120,200,255,.75)" />
                            <stop offset="100%" stopColor="rgba(60,120,255,.35)" />
                        </linearGradient>
                    </defs>

                    <circle className="giftGlow" cx="130" cy="120" r="110" fill="url(#giftGlowG)" opacity="0.0" />

                    <g className="giftBase">
                        <rect x="55" y="110" width="150" height="90" rx="18" fill="url(#boxG)" stroke="rgba(255,255,255,.18)" />
                        <rect x="123" y="110" width="14" height="90" rx="7" fill="rgba(255,255,255,.22)" />
                        <rect x="55" y="148" width="150" height="14" rx="7" fill="rgba(255,255,255,.18)" />
                    </g>

                    <g className="giftLid">
                        <rect x="45" y="78" width="170" height="44" rx="16" fill="url(#lidG)" stroke="rgba(255,255,255,.18)" />
                        <rect x="123" y="78" width="14" height="44" rx="7" fill="rgba(255,255,255,.22)" />
                    </g>

                    <g className="giftBow">
                        <path d="M120 70 C105 58, 92 54, 86 62 C82 68, 86 78, 98 80 C108 82, 118 78, 120 70 Z" fill="rgba(255,255,255,.30)" />
                        <path d="M140 70 C155 58, 168 54, 174 62 C178 68, 174 78, 162 80 C152 82, 142 78, 140 70 Z" fill="rgba(255,255,255,.30)" />
                        <circle cx="130" cy="70" r="8" fill="rgba(255,255,255,.34)" />
                    </g>
                </svg>

                <div className="introTip">Click para saltar</div>
                <div className="introTip">Desarrollado por <a href="https://github.com/emmanuelquintana">Emmanuel Quintana</a></div>

            </div>
        </div>
    );
}
