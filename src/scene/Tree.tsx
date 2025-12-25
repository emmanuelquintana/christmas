import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

type Light = { cx: number; cy: number; hue: number };

export default function Tree({ reducedMotion }: { reducedMotion: boolean }) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [lights, setLights] = useState<Light[]>([]);

    const palette = useMemo(() => [0, 110, 195, 285, 45], []);
    const hueFor = (i: number) => palette[i % palette.length];

    useLayoutEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;

        const pTop = svg.querySelector("#garlandTop") as SVGPathElement | null;
        const pMid = svg.querySelector("#garlandMid") as SVGPathElement | null;
        const pLow = svg.querySelector("#garlandLow") as SVGPathElement | null;
        if (!pTop || !pMid || !pLow) return;

        const sample = (path: SVGPathElement, count: number, offset: number) => {
            const len = path.getTotalLength();
            return Array.from({ length: count }, (_, i) => {
                const p = path.getPointAtLength((i / (count - 1)) * len);
                return { cx: p.x, cy: p.y, hue: hueFor(i + offset) };
            });
        };


        setLights([
            ...sample(pTop, 10, 0),
            ...sample(pMid, 12, 40),
            ...sample(pLow, 14, 80),
        ]);
    }, []);

    useLayoutEffect(() => {
        if (reducedMotion) return;

        const root = rootRef.current;
        const svg = svgRef.current;
        if (!root || !svg) return;

        const ctx = gsap.context(() => {
            const drawEls = svg.querySelectorAll("[data-draw]") as NodeListOf<SVGPathElement>;
            drawEls.forEach((el) => {
                const l = el.getTotalLength();
                el.style.strokeDasharray = `${l}`;
                el.style.strokeDashoffset = `${l}`;
            });

            const fades = svg.querySelectorAll("[data-fade]") as NodeListOf<SVGElement>;
            gsap.set(fades, { opacity: 0 });

            gsap.timeline()
                .to(drawEls, { strokeDashoffset: 0, duration: 1.0, ease: "power2.out", stagger: 0.06 })
                .to(fades, { opacity: 1, duration: 0.75, ease: "power2.out", stagger: 0.05 }, "-=0.7");

            gsap.to(".treeBody", {
                rotate: 0.35,
                duration: 3.2,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut",
                transformOrigin: "50% 92%",
            });

            gsap.to(".treeTopStar", {
                scale: 1.06,
                duration: 0.95,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut",
                transformOrigin: "50% 50%",
            });

            gsap.to(".treeGift", {
                y: -7,
                duration: 1.6,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut",
                stagger: { each: 0.2, from: "random" },
            });
        }, root);

        return () => ctx.revert();
    }, [reducedMotion]);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const bulbs = Array.from(root.querySelectorAll<SVGGElement>(".treeBulb"));
        if (!bulbs.length) return;

        gsap.killTweensOf(bulbs);

        gsap.set(bulbs, { opacity: 0.35, scale: 0.82, transformOrigin: "50% 50%" });

        const tl = gsap.timeline({ repeat: -1 });
        tl.to(bulbs, {
            opacity: 0.95,
            scale: 1.12,
            duration: 0.35,
            ease: "power2.out",
            stagger: { each: 0.06, from: "start" },
        }).to(
            bulbs,
            {
                opacity: 0.35,
                scale: 0.82,
                duration: 0.7,
                ease: "sine.inOut",
                stagger: { each: 0.06, from: "start" },
            },
            0.18
        );

        return () => {
            tl.kill();
        };
    }, [lights.length]);

    return (
        <div ref={rootRef} className="treeRoot">
            <svg ref={svgRef} className="treeSvg" viewBox="0 0 520 720" role="img" aria-label="Árbol de Navidad">
                <defs>
                    <linearGradient id="treeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(70, 230, 150, .92)" />
                        <stop offset="100%" stopColor="rgba(18, 125, 75, .98)" />
                    </linearGradient>

                    <linearGradient id="treeShade" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="rgba(255,255,255,.10)" />
                        <stop offset="100%" stopColor="rgba(0,0,0,.26)" />
                    </linearGradient>

                    <radialGradient id="starGlow" cx="50%" cy="45%" r="60%">
                        <stop offset="0%" stopColor="rgba(255,235,165,.85)" />
                        <stop offset="100%" stopColor="rgba(255,235,165,0)" />
                    </radialGradient>
                </defs>


                <ellipse data-fade className="treeBaseShadow" cx="260" cy="650" rx="170" ry="42" />
                <path
                    data-fade
                    className="treeSnow"
                    d="M120 648
             C175 622, 220 632, 260 646
             C300 632, 345 622, 400 648
             C360 670, 310 678, 260 676
             C210 678, 160 670, 120 648 Z"
                />


                <path id="garlandTop" d="M180 225 C215 260, 305 260, 340 225" fill="none" />
                <path id="garlandMid" d="M155 350 C210 395, 310 395, 365 350" fill="none" />
                <path id="garlandLow" d="M130 490 C200 545, 320 545, 390 490" fill="none" />

                <g className="treeBody">

                    <path
                        data-draw
                        className="treeStroke"
                        d="M260 120
               C218 165, 200 195, 170 232
               C212 218, 242 225, 260 248
               C278 225, 308 218, 350 232
               C318 195, 302 165, 260 120 Z

               M260 230
               C200 290, 180 330, 145 372
               C220 340, 248 352, 260 382
               C272 352, 300 340, 375 372
               C340 330, 320 290, 260 230 Z

               M260 360
               C188 430, 160 475, 120 525
               C220 480, 252 505, 260 535
               C268 505, 300 480, 400 525
               C360 475, 332 430, 260 360 Z"
                        fill="none"
                    />

                    <path
                        data-fade
                        className="treeFill"
                        d="M260 120
               C218 165, 200 195, 170 232
               C212 218, 242 225, 260 248
               C278 225, 308 218, 350 232
               C318 195, 302 165, 260 120 Z

               M260 230
               C200 290, 180 330, 145 372
               C220 340, 248 352, 260 382
               C272 352, 300 340, 375 372
               C340 330, 320 290, 260 230 Z

               M260 360
               C188 430, 160 475, 120 525
               C220 480, 252 505, 260 535
               C268 505, 300 480, 400 525
               C360 475, 332 430, 260 360 Z"
                        fill="url(#treeGrad)"
                    />

                    <path
                        data-fade
                        className="treeLayerShade"
                        d="M260 120
               C218 165, 200 195, 170 232
               C212 218, 242 225, 260 248
               C278 225, 308 218, 350 232
               C318 195, 302 165, 260 120 Z

               M260 230
               C200 290, 180 330, 145 372
               C220 340, 248 352, 260 382
               C272 352, 300 340, 375 372
               C340 330, 320 290, 260 230 Z

               M260 360
               C188 430, 160 475, 120 525
               C220 480, 252 505, 260 535
               C268 505, 300 480, 400 525
               C360 475, 332 430, 260 360 Z"
                        fill="url(#treeShade)"
                        opacity="0.40"
                    />


                    <path
                        data-fade
                        className="trunk"
                        d="M235 535
               C233 575, 228 605, 220 635
               C250 646, 270 646, 300 635
               C292 605, 287 575, 285 535 Z"
                    />


                    <path data-fade className="garlandLine" d="M180 225 C215 260, 305 260, 340 225" />
                    <path data-fade className="garlandLine" d="M155 350 C210 395, 310 395, 365 350" />
                    <path data-fade className="garlandLine" d="M130 490 C200 545, 320 545, 390 490" />


                    <g data-fade className="ornaments">
                        <circle cx="240" cy="260" r="8" className="orn" fill="rgba(255,255,255,.20)" />
                        <circle cx="290" cy="285" r="7" className="orn" fill="rgba(255,255,255,.16)" />
                        <circle cx="215" cy="355" r="8" className="orn" fill="rgba(255,255,255,.18)" />
                        <circle cx="315" cy="370" r="9" className="orn" fill="rgba(255,255,255,.20)" />
                        <circle cx="245" cy="455" r="8" className="orn" fill="rgba(255,255,255,.16)" />
                        <circle cx="305" cy="468" r="9" className="orn" fill="rgba(255,255,255,.20)" />
                    </g>


                    <g data-fade className="lights">
                        {lights.map((p, i) => (
                            <g key={i} className="treeBulb" style={{ ["--h" as any]: p.hue }}>
                                <circle className="tree-light" cx={p.cx} cy={p.cy} r={6.2} />
                                <circle className="bulbHi" cx={p.cx - 2.0} cy={p.cy - 2.0} r={2.0} />
                            </g>
                        ))}
                    </g>


                    <g data-fade className="treeGifts">
                        <g className="treeGift">
                            <rect x="125" y="607" width="84" height="56" rx="14" className="giftA" />
                            <rect x="162" y="607" width="12" height="56" rx="6" className="giftRibbon" />
                            <rect x="125" y="632" width="84" height="12" rx="6" className="giftRibbon" />
                            <circle cx="168" cy="607" r="10" className="giftBow" />
                        </g>

                        <g className="treeGift">
                            <rect x="218" y="590" width="94" height="74" rx="16" className="giftB" />
                            <rect x="260" y="590" width="12" height="74" rx="6" className="giftRibbon2" />
                            <rect x="218" y="622" width="94" height="12" rx="6" className="giftRibbon2" />
                            <circle cx="266" cy="590" r="11" className="giftBow2" />
                        </g>

                        <g className="treeGift">
                            <rect x="326" y="607" width="94" height="56" rx="16" className="giftC" />
                            <rect x="368" y="607" width="12" height="56" rx="6" className="giftRibbon3" />
                            <rect x="326" y="632" width="94" height="12" rx="6" className="giftRibbon3" />
                            <circle cx="374" cy="607" r="10" className="giftBow3" />
                        </g>
                    </g>
                </g>


                <g data-fade className="treeTopStar">
                    <circle cx="260" cy="102" r="44" fill="url(#starGlow)" opacity="0.6" />
                    <path
                        className="star"
                        d="M260 76 L273 103 L303 107 L281 126 L287 156
               L260 141 L233 156 L239 126 L217 107 L247 103 Z"
                    />
                </g>
            </svg>
        </div>
    );
}
