interface LibraGoLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function LibraGoLogo({ size = "md", showText = true, className = "" }: LibraGoLogoProps) {
  const sizes = {
    sm: { container: "w-10 h-10", text: "text-lg" },
    md: { container: "w-16 h-16", text: "text-3xl" },
    lg: { container: "w-24 h-24", text: "text-4xl" },
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon - Modern Book with "L" */}
      <div className="relative">
        {/* Main Container */}
        <div className={`${currentSize.container} rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 shadow-xl flex items-center justify-center relative overflow-hidden`}>
          {/* Animated Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/20 via-transparent to-orange-500/20 animate-pulse" />
          
          {/* Book Shape with "L" Letter */}
          <svg 
            viewBox="0 0 100 100" 
            className="w-full h-full p-2 relative z-10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Book Pages (Right Side) */}
            <path
              d="M45 20 L80 25 L80 85 L45 80 Z"
              fill="white"
              fillOpacity="0.9"
            />
            <path
              d="M48 25 L48 75"
              stroke="white"
              strokeWidth="0.5"
              strokeOpacity="0.3"
            />
            <path
              d="M52 26 L52 76"
              stroke="white"
              strokeWidth="0.5"
              strokeOpacity="0.3"
            />
            
            {/* Book Cover (Left Side) with "L" */}
            <path
              d="M20 25 L45 20 L45 80 L20 85 Z"
              fill="#FBBF24"
              className="drop-shadow-lg"
            />
            
            {/* Letter "L" on Cover */}
            <path
              d="M30 35 L30 70 L40 70"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Bookmark Ribbon */}
            <path
              d="M60 25 L60 45 L65 40 L70 45 L70 25 Z"
              fill="#F59E0B"
            />
            
            {/* Spine Shadow */}
            <path
              d="M45 20 L45 80"
              stroke="#1E40AF"
              strokeWidth="2"
              strokeOpacity="0.3"
            />
            
            {/* Go Arrow */}
            <g transform="translate(75, 55)">
              <circle cx="0" cy="0" r="8" fill="#F59E0B" />
              <path
                d="M-2 0 L3 0 M1 -2 L3 0 L1 2"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        </div>
        
        {/* Sparkle Accent */}
        <div className="absolute -top-1 -right-1">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 0 L9 7 L16 8 L9 9 L8 16 L7 9 L0 8 L7 7 Z" fill="#FBBF24" />
          </svg>
        </div>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <h1 
            className={`${currentSize.text} bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 bg-clip-text text-transparent leading-none`}
            style={{ 
              fontWeight: 800,
              letterSpacing: '-0.02em'
            }}
          >
            LibraGO
          </h1>
          {size !== "sm" && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 tracking-wider">
              READ • LEARN • GROW
            </p>
          )}
        </div>
      )}
    </div>
  );
}
