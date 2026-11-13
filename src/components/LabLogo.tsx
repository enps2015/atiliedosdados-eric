import React from 'react';

interface LabLogoProps {
  size?: number;
  className?: string;
}

export const LabLogo: React.FC<LabLogoProps> = ({ size = 30, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer retro brass/walnut instrumentation ring */}
      <circle
        cx="20"
        cy="20"
        r="17.5"
        fill="#131B2B"
        stroke="#D99B52"
        strokeWidth="1.8"
      />
      <circle
        cx="20"
        cy="20"
        r="14.5"
        stroke="#22D3EE"
        strokeWidth="0.8"
        strokeDasharray="3 2.5"
        opacity="0.55"
      />

      {/* Erlenmeyer / Vacuum tube glass silhouette */}
      <path
        d="M16.5 9.5H23.5M17.5 9.5V15.2L12.6 25.4C11.9 26.8 12.9 28.5 14.5 28.5H25.5C27.1 28.5 28.1 26.8 27.4 25.4L22.5 15.2V9.5"
        stroke="#F1F5F9"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Glowing liquid wave inside flask */}
      <path
        d="M14.1 24.2C16.2 22.8 18.2 25.2 20.3 23.9C22.2 22.7 24.1 23.6 25.9 24.3L26.5 25.6C26.9 26.4 26.3 27.3 25.4 27.3H14.6C13.7 27.3 13.1 26.4 13.5 25.6L14.1 24.2Z"
        fill="#10B981"
        opacity="0.85"
      />

      {/* Data scatter & regression spark inside */}
      <circle cx="17.2" cy="20.6" r="1.4" fill="#22D3EE" />
      <circle cx="20.3" cy="18.2" r="1.5" fill="#F59E0B" />
      <circle cx="23.1" cy="15.8" r="1.3" fill="#22D3EE" />
      <path
        d="M16.4 21.3L23.7 15.3"
        stroke="#F59E0B"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
};
