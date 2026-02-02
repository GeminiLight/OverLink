
export const Logo = ({ className = "w-12 h-12" }: { className?: string }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <defs>
            <linearGradient id="lifeline_gradient" x1="0" y1="50" x2="100" y2="50" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#22d3ee" /> {/* Cyan-400 */}
                <stop offset="100%" stopColor="#34d399" /> {/* Emerald-400 */}
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>

        {/* Optional Background Glow */}
        <path
            d="M10 50 L25 50 L35 25 L55 75 L70 35 L80 50 L90 50"
            stroke="url(#lifeline_gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            opacity="0.3"
        />

        {/* Main Lifeline Path */}
        <path
            d="M10 50 L25 50 L35 25 L55 75 L70 35 L80 50 L90 50"
            stroke="url(#lifeline_gradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
        />

        {/* Dot at the end to signify 'Live' */}
        <circle cx="90" cy="50" r="4" fill="#34d399">
            <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
        </circle>
    </svg>
);
