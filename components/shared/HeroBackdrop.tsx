type HeroBackdropProps = { id: string };

export function HeroBackdrop({ id }: HeroBackdropProps) {
  const mesh = id + "-mesh",
    cool = id + "-cool",
    hot = id + "-hot";
  return (
    <div className="hero-backdrop" aria-hidden="true">
      <span className="hero-backdrop-beam hero-backdrop-beam--blue" />
      <span className="hero-backdrop-beam hero-backdrop-beam--pink" />
      <svg
        className="hero-light-floor"
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <linearGradient id={cool} x1="0" y1="1" x2="1" y2="0">
            <stop stopColor="var(--brand-blue)" stopOpacity="0" />
            <stop offset=".5" stopColor="var(--info)" stopOpacity=".8" />
            <stop offset=".8" stopColor="var(--brand-blue)" stopOpacity=".55" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity=".1" />
          </linearGradient>
          <linearGradient id={hot} x1="0" y1="0" x2="1" y2=".2">
            <stop stopColor="var(--brand-pink)" stopOpacity=".9" />
            <stop offset=".4" stopColor="var(--accent)" stopOpacity=".45" />
            <stop
              offset=".75"
              stopColor="var(--brand-pink)"
              stopOpacity=".85"
            />
            <stop offset="1" stopColor="var(--info)" stopOpacity=".1" />
          </linearGradient>
          <pattern
            id={mesh}
            width="13"
            height="11"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r=".85" fill="var(--info)" />
          </pattern>
        </defs>
        <g className="hero-floor-mesh" opacity=".45">
          <path
            d="M390 240C665 208 892 26 1115 65S1320 158 1440 115V240Z"
            fill={`url(#${mesh})`}
            opacity=".6"
          />
          {Array.from({ length: 8 }, (_, row) => (
            <path
              key={row}
              d={`M${440 - row * 30} 240C${690 - row * 16} ${200 + row * 3} ${895 + row * 12} ${26 + row * 18} ${1115 + row * 14} ${65 + row * 17}S1370 ${167 + row * 4} 1440 ${115 + row * 13}`}
              fill="none"
              stroke={`url(#${cool})`}
              strokeWidth=".6"
              opacity=".65"
            />
          ))}
        </g>
        <path
          d="M0 145C240 325 475 237 742 210S1160 210 1440 45"
          fill="none"
          stroke={`url(#${hot})`}
          strokeWidth="12"
          opacity=".06"
        />
        <path
          d="M0 145C240 325 475 237 742 210S1160 210 1440 45"
          fill="none"
          stroke={`url(#${hot})`}
          strokeWidth="2"
        />
        <path
          d="M180 240C492 250 744 159 985 84S1235 162 1440 115"
          fill="none"
          stroke={`url(#${cool})`}
          strokeWidth="9"
          opacity=".07"
        />
        <path
          d="M180 240C492 250 744 159 985 84S1235 162 1440 115"
          fill="none"
          stroke={`url(#${cool})`}
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

export function HeroOrbits() {
  return (
    <svg
      className="hero-light-orbits"
      viewBox="0 0 640 640"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse
        className="hero-orbit-muted"
        cx="320"
        cy="355"
        rx="283"
        ry="193"
        transform="rotate(-25 320 355)"
      />
      <ellipse
        className="hero-orbit-muted"
        cx="320"
        cy="350"
        rx="270"
        ry="190"
        transform="rotate(24 320 350)"
      />
      <path
        className="hero-orbit-blue hero-orbit-glow"
        d="M64 430C-12 274 124 123 298 139S589 249 578 387"
      />
      <path
        className="hero-orbit-pink hero-orbit-glow"
        d="M61 421C124 527 430 539 555 399S520 252 398 294"
      />
      <path
        className="hero-orbit-blue"
        d="M64 430C-12 274 124 123 298 139S589 249 578 387"
      />
      <path
        className="hero-orbit-pink"
        d="M61 421C124 527 430 539 555 399S520 252 398 294"
      />
      <g className="hero-orbit-stars">
        <circle cx="59" cy="405" r="3" />
        <circle cx="218" cy="151" r="3" />
        <circle cx="517" cy="321" r="2.5" />
        <circle cx="461" cy="192" r="2" />
      </g>
    </svg>
  );
}
