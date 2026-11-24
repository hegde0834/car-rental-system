// Fallback car drawing, tinted with the car's colour from the database.
export default function CarIllustration({ color = '#2F5DA8' }) {
  return (
    <svg viewBox="0 0 300 150" className="car-svg" role="img" aria-label="Car illustration">
      <ellipse cx="150" cy="128" rx="115" ry="8" fill="rgba(16,32,46,.14)" />
      <path
        d="M24 100 Q24 80 52 74 L88 46 Q94 41 104 41 L192 41 Q202 41 209 47 L236 74 Q272 77 276 100 L276 110 Q276 116 270 116 L30 116 Q24 116 24 110 Z"
        fill={color}
      />
      <path d="M100 50 L188 50 Q194 50 198 54 L220 74 L84 74 Z" fill="rgba(255,255,255,.62)" />
      <path d="M143 50 L143 74" stroke={color} strokeWidth="5" />
      <rect x="252" y="88" width="14" height="8" rx="3" fill="#FFE59A" />
      <rect x="34" y="90" width="10" height="7" rx="3" fill="#FF8B8B" />
      <rect x="118" y="90" width="36" height="5" rx="2.5" fill="rgba(0,0,0,.18)" />
      {[84, 216].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="116" r="20" fill="#10202E" />
          <circle cx={cx} cy="116" r="9" fill="#C9D1D9" />
          <circle cx={cx} cy="116" r="3" fill="#10202E" />
        </g>
      ))}
    </svg>
  );
}
