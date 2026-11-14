/**
 * Abstract, clearly-conceptual architectural visuals drawn in SVG.
 * They stand in for official renders and never depict a real building.
 */
export type VisualKind =
  | "tower"
  | "tower-light"
  | "tower-section"
  | "tower-night"
  | "interior"
  | "retail"
  | "dining"
  | "office"
  | "lobby"
  | "skyline"
  | "map";

type Props = { kind: VisualKind; className?: string };

const svgProps = {
  "aria-hidden": true,
  width: "100%",
  height: "100%",
  preserveAspectRatio: "xMidYMid slice",
  focusable: "false",
} as const;

export default function ConceptVisual({ kind, className = "" }: Props) {
  const cls = `block h-full w-full ${className}`;
  switch (kind) {
    case "tower":
      /* Standalone tower for the hero (transparent background) */
      return (
        <svg {...svgProps} preserveAspectRatio="xMidYMax meet" viewBox="0 0 300 900" className={cls}>
          <defs>
            <linearGradient id="tw-body" x1="0" x2="1">
              <stop offset="0" stopColor="#17223a" />
              <stop offset="0.5" stopColor="#1d2942" />
              <stop offset="1" stopColor="#0b1324" />
            </linearGradient>
            <linearGradient id="tw-edge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ead8b4" />
              <stop offset="1" stopColor="#d4b483" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="tw-base" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d4b483" stopOpacity="0.22" />
              <stop offset="1" stopColor="#d4b483" stopOpacity="0.04" />
            </linearGradient>
          </defs>
          <path d="M150 0 V50" stroke="#d4b483" strokeWidth="1.2" />
          <path d="M30 900 L70 130 L150 50 L230 130 L270 900 Z" fill="url(#tw-body)" />
          <path d="M150 50 L230 130 L270 900 L200 900 Z" fill="#0b1324" opacity="0.55" />
          <path d="M70 130 L150 50 L230 130" stroke="url(#tw-edge)" strokeWidth="1.4" fill="none" />
          <path d="M70 130 L30 900" stroke="#d4b483" strokeWidth="0.9" opacity="0.6" />
          <path d="M150 50 V900" stroke="#ead8b4" strokeWidth="0.8" opacity="0.3" />
          <g stroke="#d4b483" strokeWidth="0.6" opacity="0.25">
            {[200, 270, 340, 410, 480, 550, 620].map((y, i) => (
              <path key={y} d={`M${66 - i * 4 + 0} ${y} H${234 + i * 4}`} />
            ))}
          </g>
          <g fill="#ead8b4" opacity="0.55">
            <rect x="85" y="225" width="26" height="3" />
            <rect x="170" y="295" width="40" height="3" />
            <rect x="95" y="365" width="18" height="3" />
            <rect x="160" y="435" width="30" height="3" />
            <rect x="78" y="505" width="44" height="3" />
            <rect x="185" y="575" width="22" height="3" />
            <rect x="110" y="645" width="34" height="3" />
          </g>
          <path d="M38 690 H262" stroke="#ead8b4" strokeWidth="1.2" opacity="0.9" />
          <rect x="44" y="720" width="212" height="180" fill="url(#tw-base)" />
          <g stroke="#d4b483" opacity="0.45">
            <path d="M44 770 H256" />
            <path d="M42 830 H258" />
          </g>
        </svg>
      );

    case "tower-light":
      return (
        <svg {...svgProps} viewBox="0 0 880 520" className={cls}>
          <defs>
            <linearGradient id="tl-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#D8CEBC" />
              <stop offset="1" stopColor="#ECE7DD" />
            </linearGradient>
          </defs>
          <rect width="880" height="520" fill="url(#tl-sky)" />
          <path d="M380 520 L410 80 L470 25 L530 80 L560 520 Z" fill="#C6BAA4" />
          <path d="M470 25 L530 80 L560 520 L515 520 Z" fill="#B1A288" />
          <g stroke="#a08055" strokeWidth="0.7" opacity="0.5">
            <path d="M407 140 H533" /><path d="M403 210 H537" /><path d="M399 280 H541" /><path d="M395 350 H545" />
          </g>
          <path d="M388 400 H552" stroke="#a08055" strokeWidth="1.4" />
          <rect x="0" y="470" width="880" height="50" fill="#D6CCBA" />
          <g fill="#C9BEAB">
            <rect x="80" y="420" width="90" height="50" /><rect x="190" y="440" width="70" height="30" />
            <rect x="640" y="430" width="110" height="40" /><rect x="770" y="445" width="60" height="25" />
          </g>
        </svg>
      );

    case "tower-section":
      return (
        <svg {...svgProps} viewBox="0 0 540 900" className={cls}>
          <rect width="540" height="900" fill="#0b1324" />
          <path d="M170 900 L200 120 L270 60 L340 120 L370 900 Z" fill="#18233b" />
          <path d="M270 60 L340 120 L370 900 L320 900 Z" fill="#0f182c" />
          <path d="M200 120 L270 60 L340 120" stroke="#ead8b4" strokeWidth="1.2" fill="none" />
          <g stroke="#9aa3b5" strokeWidth="0.5" opacity="0.3">
            <path d="M196 220 H344" /><path d="M192 320 H348" /><path d="M188 420 H352" /><path d="M184 520 H356" /><path d="M181 600 H359" />
          </g>
          <g fill="#ead8b4" opacity="0.5">
            <rect x="215" y="260" width="30" height="3" /><rect x="290" y="360" width="24" height="3" />
            <rect x="210" y="460" width="40" height="3" /><rect x="280" y="560" width="30" height="3" />
          </g>
          <rect x="178" y="690" width="184" height="210" fill="#d4b483" opacity="0.14" />
          <path d="M160 690 H380" stroke="#d4b483" strokeWidth="1.5" />
          <g stroke="#d4b483" opacity="0.5"><path d="M176 760 H364" /><path d="M174 830 H366" /></g>
          <path d="M392 140 V680" stroke="#9aa3b5" strokeWidth="0.6" opacity="0.6" />
          <path d="M392 696 V900" stroke="#d4b483" strokeWidth="0.8" />
        </svg>
      );

    case "tower-night":
      return (
        <svg {...svgProps} viewBox="0 0 1440 900" className={cls}>
          <defs>
            <radialGradient id="tn-glow" cx="50%" cy="70%" r="60%">
              <stop offset="0" stopColor="#2a3550" />
              <stop offset="1" stopColor="#0b1324" />
            </radialGradient>
          </defs>
          <rect width="1440" height="900" fill="url(#tn-glow)" />
          <g fill="#d4b483" opacity="0.5">
            {[60, 180, 300, 420, 540, 900, 1020, 1140, 1260, 1380].map((x, i) => (
              <rect key={x} x={x} y={840 + (i % 3) * 12} width="2" height="2" />
            ))}
          </g>
          <path d="M620 900 L650 230 L720 170 L790 230 L820 900 Z" fill="#131d33" />
          <path d="M650 230 L720 170 L790 230" stroke="#ead8b4" strokeWidth="1.2" fill="none" />
          <path d="M720 170 V900" stroke="#d4b483" strokeWidth="0.7" opacity="0.4" />
          <path d="M720 130 V170" stroke="#d4b483" />
          <g fill="#ead8b4" opacity="0.6">
            <rect x="670" y="320" width="22" height="3" /><rect x="740" y="400" width="30" height="3" /><rect x="660" y="480" width="34" height="3" /><rect x="735" y="560" width="22" height="3" />
          </g>
          <path d="M628 740 H812" stroke="#d4b483" strokeWidth="1.2" />
          <rect x="632" y="740" width="176" height="160" fill="#d4b483" opacity="0.1" />
        </svg>
      );

    case "interior":
      return (
        <svg {...svgProps} viewBox="0 0 800 500" className={cls}>
          <defs>
            <linearGradient id="in-dusk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#172138" />
              <stop offset="1" stopColor="#3d4a6a" />
            </linearGradient>
          </defs>
          <rect width="800" height="500" fill="#101a2e" />
          <rect x="70" y="40" width="660" height="300" fill="url(#in-dusk)" />
          <g fill="#ead8b4" opacity="0.7">
            {[110, 170, 240, 330, 410, 480, 560, 640, 700].map((x, i) => (
              <rect key={x} x={x} y={300 - (i % 4) * 10} width="2" height="2" />
            ))}
          </g>
          <g stroke="#0a1222" strokeWidth="8">
            <path d="M70 40 V340" /><path d="M290 40 V340" /><path d="M510 40 V340" /><path d="M730 40 V340" />
          </g>
          <rect x="0" y="340" width="800" height="160" fill="#0c1527" />
          <rect x="150" y="370" width="330" height="40" fill="#24304a" />
          <rect x="150" y="360" width="330" height="10" fill="#2e3a55" />
          <path d="M150 360 H480" stroke="#d4b483" strokeWidth="0.8" />
          <rect x="540" y="380" width="120" height="8" fill="#d4b483" opacity="0.5" />
          <path d="M600 388 V430" stroke="#d4b483" opacity="0.5" />
        </svg>
      );

    case "retail":
      return (
        <svg {...svgProps} viewBox="0 0 800 600" className={cls}>
          <rect width="800" height="600" fill="#e2dccf" />
          <rect x="60" y="80" width="680" height="440" fill="#232f48" />
          <g fill="#34405e">
            <rect x="90" y="140" width="190" height="380" /><rect x="305" y="140" width="190" height="380" /><rect x="520" y="140" width="190" height="380" />
          </g>
          <g fill="#d4b483" opacity="0.85">
            <rect x="90" y="140" width="190" height="2" /><rect x="305" y="140" width="190" height="2" /><rect x="520" y="140" width="190" height="2" />
          </g>
          <g fill="#ead8b4" opacity="0.35">
            <rect x="140" y="300" width="90" height="140" /><rect x="355" y="320" width="90" height="120" /><rect x="570" y="290" width="90" height="150" />
          </g>
          <path d="M60 100 H740" stroke="#a08055" strokeWidth="2" />
          <rect x="0" y="520" width="800" height="80" fill="#d3cbbb" />
        </svg>
      );

    case "dining":
      return (
        <svg {...svgProps} viewBox="0 0 600 700" className={cls}>
          <rect width="600" height="700" fill="#16203a" />
          <g stroke="#d4b483" strokeWidth="1" opacity="0.6">
            <path d="M150 0 V140" /><path d="M300 0 V110" /><path d="M450 0 V150" />
          </g>
          <g fill="#ead8b4">
            <ellipse cx="150" cy="150" rx="28" ry="10" opacity="0.8" /><ellipse cx="300" cy="120" rx="28" ry="10" opacity="0.8" /><ellipse cx="450" cy="160" rx="28" ry="10" opacity="0.8" />
          </g>
          <g fill="#ead8b4" opacity="0.08">
            <ellipse cx="150" cy="420" rx="140" ry="40" /><ellipse cx="300" cy="400" rx="140" ry="40" /><ellipse cx="450" cy="430" rx="140" ry="40" />
          </g>
          <g fill="#283350">
            <rect x="90" y="430" width="120" height="14" /><rect x="240" y="410" width="120" height="14" /><rect x="390" y="440" width="120" height="14" />
          </g>
          <rect x="0" y="560" width="600" height="140" fill="#0d1628" />
        </svg>
      );

    case "office":
      return (
        <svg {...svgProps} viewBox="0 0 600 500" className={cls}>
          <rect width="600" height="500" fill="#efeae1" />
          <g fill="#ddd5c6">
            <rect x="40" y="40" width="160" height="300" /><rect x="220" y="40" width="160" height="300" /><rect x="400" y="40" width="160" height="300" />
          </g>
          <rect x="0" y="340" width="600" height="160" fill="#cbbfa9" />
          <rect x="110" y="300" width="380" height="16" fill="#1c2536" />
          <path d="M140 316 V380 M460 316 V380" stroke="#1c2536" strokeWidth="4" />
          <path d="M110 300 H490" stroke="#a08055" />
        </svg>
      );

    case "lobby":
      return (
        <svg {...svgProps} viewBox="0 0 700 900" className={cls}>
          <rect width="700" height="900" fill="#d9d0c0" />
          <path d="M120 900 V200 Q350 40 580 200 V900 Z" fill="#cbbfaa" />
          <path d="M180 900 V240 Q350 110 520 240 V900 Z" fill="#24304a" />
          <path d="M180 240 Q350 110 520 240" stroke="#a08055" strokeWidth="2" fill="none" />
          <g stroke="#d4b483" strokeWidth="1" opacity="0.7"><path d="M350 140 V330" /></g>
          <ellipse cx="350" cy="340" rx="60" ry="14" fill="#ead8b4" opacity="0.9" />
          <path d="M180 760 H520" stroke="#d4b483" opacity="0.5" />
          <rect x="0" y="780" width="700" height="120" fill="#bfb29b" />
          <path d="M0 780 L350 840 L700 780" stroke="#a89a82" fill="none" />
        </svg>
      );

    case "skyline":
      return (
        <svg {...svgProps} viewBox="0 0 1200 600" className={cls}>
          <defs>
            <linearGradient id="sk-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0c1527" />
              <stop offset="0.7" stopColor="#33405e" />
              <stop offset="1" stopColor="#7a5c37" />
            </linearGradient>
          </defs>
          <rect width="1200" height="600" fill="url(#sk-sky)" />
          <path d="M0 470 Q300 455 600 465 T1200 460" stroke="#d4b483" strokeWidth="0.8" opacity="0.6" fill="none" />
          <g fill="#0a1222">
            <rect x="40" y="430" width="80" height="170" /><rect x="140" y="400" width="50" height="200" /><rect x="220" y="445" width="120" height="155" />
            <rect x="380" y="410" width="60" height="190" /><rect x="470" y="440" width="140" height="160" /><rect x="650" y="420" width="70" height="180" />
            <rect x="760" y="450" width="130" height="150" /><rect x="920" y="405" width="55" height="195" /><rect x="1000" y="440" width="160" height="160" />
          </g>
          <g fill="#ead8b4" opacity="0.6">
            {[60, 155, 250, 300, 395, 500, 560, 670, 790, 850, 935, 1040, 1110].map((x, i) => (
              <rect key={x} x={x} y={470 + (i % 4) * 22} width="3" height="3" />
            ))}
          </g>
        </svg>
      );

    case "map":
      return (
        <svg {...svgProps} viewBox="0 0 600 600" className={cls}>
          <rect width="600" height="600" fill="#eae5db" />
          <g stroke="#d4cbbb" strokeWidth="1">
            {Array.from({ length: 12 }, (_, i) => (
              <path key={`h${i}`} d={`M0 ${i * 50 + 25} H600`} />
            ))}
            {Array.from({ length: 12 }, (_, i) => (
              <path key={`v${i}`} d={`M${i * 50 + 25} 0 V600`} />
            ))}
          </g>
          <path d="M-20 420 C120 380 220 460 330 400 S520 300 640 330" stroke="#c9d3d6" strokeWidth="38" fill="none" opacity="0.8" />
          <path d="M0 180 L600 260" stroke="#ffffff" strokeWidth="10" />
          <path d="M240 0 L310 600" stroke="#ffffff" strokeWidth="8" />
          <circle cx="285" cy="230" r="44" fill="#a08055" opacity="0.12" />
          <circle cx="285" cy="230" r="8" fill="#1c2536" />
          <circle cx="285" cy="230" r="16" stroke="#a08055" fill="none" />
        </svg>
      );
  }
}
