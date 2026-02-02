
export const Logo = ({ className = "w-12 h-12" }: { className?: string }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <defs>
            <linearGradient id="logo_gradient" x1="0" y1="100" x2="100" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#9333EA" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        </defs>

        {/* Outer Ring / Link Shape */}
        <path
            d="M50 15 C 30.67 15, 15 30.67, 15 50 C 15 69.33, 30.67 85, 50 85 C 69.33 85, 85 69.33, 85 50 C 85 30.67, 69.33 15, 50 15 Z M 50 70 C 38.95 70, 30 61.05, 30 50 C 30 38.95, 38.95 30, 50 30 C 61.05 30, 70 38.95, 70 50 C 70 61.05, 61.05 70, 50 70 Z"
            fill="url(#logo_gradient)"
            fillRule="evenodd"
            style={{ filter: "drop-shadow(0px 4px 10px rgba(37, 99, 235, 0.3))" }}
        />

        {/* Inner "Link" Accent (The visual connection) */}
        <path
            d="M42 42 L58 58 M58 42 L42 58"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
            strokeOpacity="0.2"
        />

        {/* Shine effect */}
        <circle cx="35" cy="35" r="4" fill="white" fillOpacity="0.4" />
    </svg>
);
