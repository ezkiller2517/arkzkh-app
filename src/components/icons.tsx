export const Icons = {
  Logo: () => (
    <div className="flex flex-col items-center justify-center p-2">
      <svg
        width="140"
        height="60"
        viewBox="0 0 140 60"
        className="text-foreground"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        
        {/* Arc */}
        <path
          d="M20,35 A60,60 0 0,1 120,35"
          stroke="url(#logo-gradient)"
          strokeWidth="1.5"
          fill="none"
        />
        
        {/* Dots on arc */}
        <circle cx="22" cy="33.5" r="0.8" fill="hsl(var(--primary))" />
        <circle cx="45" cy="19" r="0.8" fill="url(#logo-gradient)" />
        <circle cx="70" cy="15" r="0.8" fill="url(#logo-gradient)" />
        <circle cx="95" cy="19" r="0.8" fill="url(#logo-gradient)" />
        <circle cx="118" cy="33.5" r="0.8" fill="hsl(var(--accent))" />

        {/* Text */}
        <text
          x="70"
          y="38"
          fontFamily="Space Grotesk, sans-serif"
          fontSize="20"
          fontWeight="bold"
          fill="currentColor"
          textAnchor="middle"
        >
          ARK-Z
        </text>
        <text
          x="70"
          y="52"
          fontFamily="Inter, sans-serif"
          fontSize="6"
          fill="hsl(var(--muted-foreground))"
          textAnchor="middle"
          className="group-data-[collapsible=icon]:hidden"
        >
          Corporate communication from A-Z
        </text>
      </svg>
    </div>
  ),
};
