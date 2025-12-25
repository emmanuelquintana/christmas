import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export default function SkyDecor({ reducedMotion }: { reducedMotion: boolean }) {
    const ref = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        const root = ref.current;
        if (!root || reducedMotion) return;

        const ctx = gsap.context(() => {
            gsap.to(".cloud1", { x: 36, duration: 18, yoyo: true, repeat: -1, ease: "sine.inOut" });
            gsap.to(".cloud2", { x: -44, duration: 22, yoyo: true, repeat: -1, ease: "sine.inOut" });
            gsap.to(".moonGlow", { opacity: 0.55, duration: 1.6, yoyo: true, repeat: -1, ease: "sine.inOut" });
        }, root);

        return () => ctx.revert();
    }, [reducedMotion]);

    return (
        <div ref={ref} className="skyDecor" aria-hidden="true">
            <svg
                className="skyDecorSvg"
                viewBox="0 0 1000 600"
                /* ✅ CLAVE: no se deforma y NO se “pierde” la luna */
                preserveAspectRatio="xMinYMin slice"
            >
                <defs>
                    <radialGradient id="moonGlowG" cx="50%" cy="50%" r="60%">
                        <stop offset="0%" stopColor="rgba(255,255,255,.22)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </radialGradient>

                    <radialGradient id="moonBodyG" cx="35%" cy="30%" r="80%">
                        <stop offset="0%" stopColor="rgba(255,255,255,.98)" />
                        <stop offset="100%" stopColor="rgba(225,235,255,.78)" />
                    </radialGradient>
                </defs>

                {/* Luna */}
                <g className="moonGroup" transform="translate(110,90)">
                    <circle className="moonGlow" cx="0" cy="0" r="120" fill="url(#moonGlowG)" opacity="0.45" />
                    <circle cx="0" cy="0" r="44" fill="url(#moonBodyG)" />
                    <circle cx="-12" cy="-8" r="6" fill="rgba(0,0,0,.05)" />
                    <circle cx="14" cy="10" r="10" fill="rgba(0,0,0,.04)" />
                    <circle cx="18" cy="-14" r="4" fill="rgba(0,0,0,.04)" />
                </g>

                {/* Nubes */}
                <g className="cloud1" opacity="0.10">
                    <path
                        d="M170 190 C200 165, 250 168, 270 192 C295 184, 320 195, 324 214 C290 231, 230 230, 185 216 C172 210, 165 200, 170 190 Z"
                        fill="rgba(255,255,255,1)"
                    />
                </g>

                <g className="cloud2" opacity="0.08">
                    <path
                        d="M680 150 C720 122, 780 128, 805 158 C835 148, 865 165, 862 188 C820 205, 750 204, 702 188 C688 182, 672 168, 680 150 Z"
                        fill="rgba(255,255,255,1)"
                    />
                </g>

                {/* Suelo suave */}
                <path
                    d="M0 545
             C220 505, 360 520, 520 540
             C700 560, 840 550, 1000 535
             L1000 600 L0 600 Z"
                    fill="rgba(255,255,255,.04)"
                />
            </svg>
        </div>
    );
}
