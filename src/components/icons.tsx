export const Icons = {
  Logo: () => (
    <div className="flex flex-col items-center justify-center text-primary">
      <svg
        width="150"
        height="40"
        viewBox="0 0 150 40"
        className="text-sidebar-foreground"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))' }} />
            <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))' }} />
          </linearGradient>
        </defs>
        <path
          d="M20,30 A60,60 0 0,1 130,30"
          stroke="url(#logo-gradient)"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="20" cy="30" r="1.5" fill="hsl(var(--primary))" />
        <circle cx="130" cy="30" r="1.5" fill="hsl(var(--accent))" />
        <circle cx="50" cy="11.5" r="1" fill="url(#logo-gradient)" />
        <circle cx="75" cy="10" r="1" fill="url(#logo-gradient)" />
        <circle cx="100" cy="11.5" r="1" fill="url(#logo-gradient)" />
      </svg>
      <div
        className="flex items-center justify-center gap-2 font-headline text-lg font-bold"
        style={{ marginTop: -32 }}
      >
        <span>ARK-Z</span>
      </div>
      <p className="text-xs text-muted-foreground mt-2 group-data-[collapsible=icon]:hidden">
        Knowledge Hub
      </p>
    </div>
  ),
};
