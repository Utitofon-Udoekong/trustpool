export function Logo({ className = "w-8 h-8" }: { className?: string }) {
    return (
      <svg 
        viewBox="0 0 24 24" 
        className={className} 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M12 3L4 7V12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12V7L12 3Z" 
          className="fill-purple-500/20 stroke-purple-500" 
          strokeWidth="2"
        />
        <circle 
          cx="12" 
          cy="12" 
          r="3" 
          className="fill-purple-500"
        />
        <path 
          d="M12 9V15M9 12H15" 
          className="stroke-white" 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />
      </svg>
    );
  } 