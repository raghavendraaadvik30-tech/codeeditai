import React from 'react';
import type { ChartType } from '@/features/editor/modules/figures/modules/chart/types';

interface ChartPreviewProps {
  type: ChartType;
  className?: string;
}

export const ChartPreview: React.FC<ChartPreviewProps> = ({ type, className = 'w-full h-24' }) => {
  switch (type) {
    case 'column':
      return (
        <svg viewBox="0 0 120 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Axes */}
          <line x1="16" y1="68" x2="108" y2="68" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="12" x2="16" y2="68" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
          {/* Vertical Columns */}
          <rect x="24" y="38" width="14" height="30" rx="2" fill="#3b82f6" />
          <rect x="44" y="24" width="14" height="44" rx="2" fill="#2563eb" />
          <rect x="64" y="14" width="14" height="54" rx="2" fill="#1d4ed8" />
          <rect x="84" y="32" width="14" height="36" rx="2" fill="#60a5fa" />
        </svg>
      );

    case 'bar':
      return (
        <svg viewBox="0 0 120 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Axes */}
          <line x1="20" y1="68" x2="108" y2="68" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="20" y1="12" x2="20" y2="68" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
          {/* Horizontal Bars */}
          <rect x="20" y="18" width="48" height="9" rx="2" fill="#3b82f6" />
          <rect x="20" y="31" width="76" height="9" rx="2" fill="#2563eb" />
          <rect x="20" y="44" width="60" height="9" rx="2" fill="#1d4ed8" />
          <rect x="20" y="57" width="38" height="9" rx="2" fill="#60a5fa" />
        </svg>
      );

    case 'horizontalBar':
      return (
        <svg viewBox="0 0 120 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Grid lines */}
          <line x1="20" y1="68" x2="108" y2="68" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="20" y1="12" x2="20" y2="68" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="50" y1="12" x2="50" y2="68" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="80" y1="12" x2="80" y2="68" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 2" />
          {/* Extended Horizontal Bars */}
          <rect x="20" y="16" width="78" height="8" rx="2" fill="#0284c7" />
          <rect x="20" y="29" width="55" height="8" rx="2" fill="#0369a1" />
          <rect x="20" y="42" width="84" height="8" rx="2" fill="#0ea5e9" />
          <rect x="20" y="55" width="42" height="8" rx="2" fill="#38bdf8" />
        </svg>
      );

    case 'line':
      return (
        <svg viewBox="0 0 120 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Axes */}
          <line x1="16" y1="68" x2="108" y2="68" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="12" x2="16" y2="68" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
          {/* Connected Line Points */}
          <polyline
            points="24,52 48,22 72,42 98,18"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="52" r="3.5" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
          <circle cx="48" cy="22" r="3.5" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
          <circle cx="72" cy="42" r="3.5" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
          <circle cx="98" cy="18" r="3.5" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
        </svg>
      );

    case 'area':
      return (
        <svg viewBox="0 0 120 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          {/* Axes */}
          <line x1="16" y1="68" x2="108" y2="68" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="12" x2="16" y2="68" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
          {/* Filled Area */}
          <polygon points="24,68 24,50 48,24 72,40 98,16 98,68" fill="url(#areaGradient)" />
          {/* Line boundary */}
          <polyline
            points="24,50 48,24 72,40 98,16"
            stroke="#2563eb"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="98" cy="16" r="2.5" fill="#2563eb" />
        </svg>
      );

    case 'pie':
      return (
        <svg viewBox="0 0 120 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Slices of Pie */}
          <g transform="translate(60, 40)">
            {/* Slice 1 (0 to 120 deg) */}
            <path d="M 0 0 L 0 -28 A 28 28 0 0 1 24.2 14 Z" fill="#2563eb" />
            {/* Slice 2 (120 to 220 deg) */}
            <path d="M 0 0 L 24.2 14 A 28 28 0 0 1 -18 21.4 Z" fill="#60a5fa" />
            {/* Slice 3 (220 to 310 deg) */}
            <path d="M 0 0 L -18 21.4 A 28 28 0 0 1 -21.4 -18 Z" fill="#93c5fd" />
            {/* Slice 4 (310 to 360 deg) */}
            <path d="M 0 0 L -21.4 -18 A 28 28 0 0 1 0 -28 Z" fill="#1d4ed8" />
          </g>
        </svg>
      );

    case 'doughnut':
      return (
        <svg viewBox="0 0 120 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(60, 40)">
            {/* Outer ring segments */}
            <circle cx="0" cy="0" r="28" fill="none" stroke="#2563eb" strokeWidth="12" strokeDasharray="50 150" />
            <circle cx="0" cy="0" r="28" fill="none" stroke="#60a5fa" strokeWidth="12" strokeDasharray="40 150" strokeDashoffset="-50" />
            <circle cx="0" cy="0" r="28" fill="none" stroke="#93c5fd" strokeWidth="12" strokeDasharray="35 150" strokeDashoffset="-90" />
            <circle cx="0" cy="0" r="28" fill="none" stroke="#1d4ed8" strokeWidth="12" strokeDasharray="51 150" strokeDashoffset="-125" />
          </g>
        </svg>
      );

    case 'scatter':
      return (
        <svg viewBox="0 0 120 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Axes */}
          <line x1="18" y1="66" x2="106" y2="66" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="18" y1="14" x2="18" y2="66" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
          {/* Scatter points */}
          <circle cx="32" cy="54" r="3.5" fill="#2563eb" opacity="0.9" />
          <circle cx="44" cy="36" r="3.5" fill="#2563eb" opacity="0.9" />
          <circle cx="56" cy="48" r="3.5" fill="#0284c7" opacity="0.9" />
          <circle cx="68" cy="26" r="3.5" fill="#2563eb" opacity="0.9" />
          <circle cx="82" cy="38" r="3.5" fill="#0284c7" opacity="0.9" />
          <circle cx="94" cy="20" r="3.5" fill="#1d4ed8" opacity="0.9" />
          <circle cx="50" cy="58" r="3" fill="#60a5fa" opacity="0.8" />
          <circle cx="76" cy="44" r="3" fill="#60a5fa" opacity="0.8" />
        </svg>
      );

    case 'stackedColumn':
      return (
        <svg viewBox="0 0 120 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Axes */}
          <line x1="16" y1="68" x2="108" y2="68" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="12" x2="16" y2="68" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
          {/* Column 1 */}
          <rect x="28" y="50" width="16" height="18" fill="#1d4ed8" rx="1" />
          <rect x="28" y="34" width="16" height="15" fill="#3b82f6" />
          <rect x="28" y="20" width="16" height="13" fill="#93c5fd" rx="1" />
          {/* Column 2 */}
          <rect x="52" y="44" width="16" height="24" fill="#1d4ed8" rx="1" />
          <rect x="52" y="26" width="16" height="17" fill="#3b82f6" />
          <rect x="52" y="14" width="16" height="11" fill="#93c5fd" rx="1" />
          {/* Column 3 */}
          <rect x="76" y="52" width="16" height="16" fill="#1d4ed8" rx="1" />
          <rect x="76" y="38" width="16" height="13" fill="#3b82f6" />
          <rect x="76" y="24" width="16" height="13" fill="#93c5fd" rx="1" />
        </svg>
      );

    case 'combo':
      return (
        <svg viewBox="0 0 120 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Axes */}
          <line x1="16" y1="68" x2="108" y2="68" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="12" x2="16" y2="68" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
          {/* Columns */}
          <rect x="26" y="38" width="12" height="30" rx="1.5" fill="#93c5fd" opacity="0.9" />
          <rect x="48" y="24" width="12" height="44" rx="1.5" fill="#93c5fd" opacity="0.9" />
          <rect x="70" y="16" width="12" height="52" rx="1.5" fill="#93c5fd" opacity="0.9" />
          <rect x="90" y="32" width="12" height="36" rx="1.5" fill="#93c5fd" opacity="0.9" />
          {/* Overlapping Line */}
          <polyline
            points="32,48 54,30 76,22 96,38"
            stroke="#ea580c"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="48" r="2.8" fill="#ea580c" />
          <circle cx="54" cy="30" r="2.8" fill="#ea580c" />
          <circle cx="76" cy="22" r="2.8" fill="#ea580c" />
          <circle cx="96" cy="38" r="2.8" fill="#ea580c" />
        </svg>
      );

    default:
      return null;
  }
};
