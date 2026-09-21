import React from "react";

export const Logo = ({ className = "w-10 h-10" }: { className?: string }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      {/* Сердцеобразная/геометрическая M-форма */}
      <path
        d="M 50 85 L 15 50 L 32 30 L 50 48 L 68 30 L 85 50 Z"
        stroke="url(#logo-gradient)"
        strokeWidth="10"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* Темный крышеобразный элемент */}
      <path
        d="M 33 45 L 50 28 L 67 45"
        stroke="#1E293B"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};
