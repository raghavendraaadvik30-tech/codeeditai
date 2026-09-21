/**
 * --------------------------------------------------------
 * Module: Figures / SmartArt
 * Feature: SmartArt Preview & Thumbnail Graphic Renderers
 * Description:
 * High-fidelity visual diagrams representing each layout in the
 * 6 SmartArt categories (List, Cycle, Hierarchy, Matrix, Pyramid, Text Card).
 * --------------------------------------------------------
 */

import React from 'react';
import type { SmartArtCategory } from '@/features/editor/smart-art/types';
import { SMARTART_COLOR_SCHEMES } from '@/features/editor/smart-art/constants';

interface SmartArtPreviewProps {
  layoutId: string;
  category?: SmartArtCategory;
  colorSchemeId?: string;
  size?: 'thumbnail' | 'large';
  className?: string;
}

export const SmartArtPreview: React.FC<SmartArtPreviewProps> = ({
  layoutId,
  category: _category,
  colorSchemeId = 'colorful',
  size = 'thumbnail',
  className = '',
}) => {
  const scheme = SMARTART_COLOR_SCHEMES.find((s) => s.id === colorSchemeId) || SMARTART_COLOR_SCHEMES[0];
  const colors = scheme.colors;
  const isLarge = size === 'large';

  // Helper to render layout SVGs
  const renderGraphic = () => {
    switch (layoutId) {
      // ==========================================
      // LIST CATEGORY LAYOUTS
      // ==========================================
      case 'basicList':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(8, ${8 + i * 18})`}>
                <rect width="10" height="13" rx="2" fill={colors[i % colors.length]} />
                <rect x="14" width="70" height="13" rx="2" fill={colors[i % colors.length]} fillOpacity="0.2" />
                <line x1="18" y1="6.5" x2="65" y2="6.5" stroke={colors[i % colors.length]} strokeWidth="2" strokeLinecap="round" />
              </g>
            ))}
          </svg>
        );

      case 'verticalList':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(10, ${8 + i * 17})`}>
                <circle cx="7" cy="6.5" r="5" fill={colors[i % colors.length]} />
                <rect x="18" width="62" height="13" rx="2" fill="#f8fafc" stroke={colors[i % colors.length]} strokeWidth="1" />
                <line x1="22" y1="6.5" x2="68" y2="6.5" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
              </g>
            ))}
          </svg>
        );

      case 'horizontalList':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${8 + i * 29}, 10)`}>
                <rect width="26" height="45" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                <rect width="26" height="12" rx="3" fill={colors[i % colors.length]} />
                <line x1="4" y1="20" x2="22" y2="20" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="4" y1="27" x2="18" y2="27" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="4" y1="34" x2="20" y2="34" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            ))}
          </svg>
        );

      case 'groupedList':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            {[0, 1].map((i) => (
              <g key={i} transform={`translate(8, ${8 + i * 26})`}>
                <rect width="24" height="21" rx="2" fill={colors[i % colors.length]} />
                <rect x="28" width="56" height="9" rx="1.5" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />
                <rect x="28" y="12" width="56" height="9" rx="1.5" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />
              </g>
            ))}
          </svg>
        );

      case 'stackedList':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(10, ${8 + i * 17})`}>
                <rect width="80" height="13" rx="2" fill={colors[i % colors.length]} fillOpacity="0.15" />
                <rect width="4" height="13" rx="1" fill={colors[i % colors.length]} />
                <line x1="10" y1="6.5" x2="70" y2="6.5" stroke={colors[i % colors.length]} strokeWidth="2" strokeLinecap="round" />
              </g>
            ))}
          </svg>
        );

      case 'numberedList':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(10, ${8 + i * 17})`}>
                <circle cx="7" cy="6.5" r="6" fill={colors[i % colors.length]} />
                <text x="7" y="9" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">
                  {i + 1}
                </text>
                <rect x="18" width="62" height="13" rx="2" fill={colors[i % colors.length]} fillOpacity="0.1" />
                <line x1="24" y1="6.5" x2="70" y2="6.5" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
              </g>
            ))}
          </svg>
        );

      // ==========================================
      // PROCESS CATEGORY LAYOUTS
      // ==========================================
      case 'basicProcess':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${6 + i * 31}, 20)`}>
                <rect width="22" height="25" rx="3" fill={colors[i % colors.length]} />
                <line x1="4" y1="12.5" x2="18" y2="12.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                {i < 2 && (
                  <path
                    d={`M ${23} ${12.5} L ${29} ${12.5} M ${27} ${9.5} L ${30} ${12.5} L ${27} ${15.5}`}
                    stroke={colors[i % colors.length]}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </g>
            ))}
          </svg>
        );

      case 'basicBlockProcess':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${6 + i * 31}, 18)`}>
                <rect width="24" height="28" rx="2" fill={colors[i % colors.length]} />
                <line x1="4" y1="14" x2="20" y2="14" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                {i < 2 && (
                  <polygon
                    points="25,14 30,10 30,18"
                    fill={colors[(i + 1) % colors.length]}
                  />
                )}
              </g>
            ))}
          </svg>
        );

      case 'stepDownProcess':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${8 + i * 27}, ${8 + i * 17})`}>
                <rect width="28" height="15" rx="2" fill={colors[i % colors.length]} />
                <line x1="4" y1="7.5" x2="24" y2="7.5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                {i < 2 && (
                  <path
                    d="M 28 7.5 L 34 7.5 L 34 16 L 34 17"
                    stroke={colors[i % colors.length]}
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    fill="none"
                  />
                )}
              </g>
            ))}
          </svg>
        );

      case 'continuousProcess':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            <line x1="10" y1="32.5" x2="90" y2="32.5" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
            {[0, 1, 2, 3].map((i) => (
              <g key={i} transform={`translate(${8 + i * 22}, 20)`}>
                <rect width="18" height="25" rx="2" fill={colors[i % colors.length]} />
                <circle cx="9" cy="12.5" r="3" fill="#ffffff" fillOpacity="0.8" />
              </g>
            ))}
          </svg>
        );

      case 'chevronProcess':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            {[0, 1, 2].map((i) => (
              <polygon
                key={i}
                points={`${6 + i * 30},18 ${28 + i * 30},18 ${36 + i * 30},32.5 ${28 + i * 30},47 ${6 + i * 30},47 ${14 + i * 30},32.5`}
                fill={colors[i % colors.length]}
              />
            ))}
          </svg>
        );

      case 'verticalProcess':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(20, ${6 + i * 19})`}>
                <rect width="60" height="14" rx="2" fill={colors[i % colors.length]} />
                <line x1="8" y1="7" x2="52" y2="7" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                {i < 2 && (
                  <path
                    d="M 50 14 L 50 19 M 48 17 L 50 19 L 52 17"
                    stroke="#94a3b8"
                    strokeWidth="1.2"
                    fill="none"
                  />
                )}
              </g>
            ))}
          </svg>
        );

      case 'alternatingProcess':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            <line x1="8" y1="32.5" x2="92" y2="32.5" stroke="#cbd5e1" strokeWidth="2" />
            {[0, 1, 2, 3].map((i) => {
              const isTop = i % 2 === 0;
              const x = 10 + i * 20;
              const y = isTop ? 10 : 38;
              return (
                <g key={i}>
                  <rect x={x} y={y} width="18" height="17" rx="2" fill={colors[i % colors.length]} />
                  <line
                    x1={x + 9}
                    y1={isTop ? 27 : 38}
                    x2={x + 9}
                    y2="32.5"
                    stroke={colors[i % colors.length]}
                    strokeWidth="1.5"
                  />
                </g>
              );
            })}
          </svg>
        );

      case 'circleProcess':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            <line x1="16" y1="32.5" x2="84" y2="32.5" stroke="#cbd5e1" strokeWidth="2" />
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${16 + i * 30}, 32.5)`}>
                <circle cx="0" cy="0" r="10" fill={colors[i % colors.length]} />
                <circle cx="0" cy="0" r="4" fill="#ffffff" fillOpacity="0.8" />
              </g>
            ))}
          </svg>
        );

      // ==========================================
      // CYCLE CATEGORY LAYOUTS
      // ==========================================
      case 'basicCycle':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            {/* Center circular ring nodes */}
            {[0, 72, 144, 216, 288].map((deg, i) => {
              const rad = (deg - 90) * (Math.PI / 180);
              const cx = 50 + 22 * Math.cos(rad);
              const cy = 32.5 + 20 * Math.sin(rad);
              return (
                <g key={deg}>
                  <circle cx={cx} cy={cy} r="6.5" fill={colors[i % colors.length]} />
                  <circle cx={cx} cy={cy} r="3" fill="#ffffff" fillOpacity="0.5" />
                </g>
              );
            })}
            <circle cx="50" cy="32.5" r="16" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
          </svg>
        );

      case 'continuousCycle':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            {[0, 90, 180, 270].map((deg, i) => {
              const rad = (deg - 45) * (Math.PI / 180);
              const cx = 50 + 24 * Math.cos(rad);
              const cy = 32.5 + 18 * Math.sin(rad);
              return (
                <rect
                  key={deg}
                  x={cx - 10}
                  y={cy - 6}
                  width="20"
                  height="12"
                  rx="3"
                  fill={colors[i % colors.length]}
                />
              );
            })}
            <circle cx="50" cy="32.5" r="14" stroke="#94a3b8" strokeWidth="1.8" strokeDasharray="4 2" />
          </svg>
        );

      case 'radialCycle':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            <circle cx="50" cy="32.5" r="9" fill={colors[0]} />
            {[0, 90, 180, 270].map((deg, i) => {
              const rad = deg * (Math.PI / 180);
              const cx = 50 + 27 * Math.cos(rad);
              const cy = 32.5 + 19 * Math.sin(rad);
              return (
                <g key={deg}>
                  <line x1="50" y1="32.5" x2={cx} y2={cy} stroke="#cbd5e1" strokeWidth="1.5" />
                  <circle cx={cx} cy={cy} r="6" fill={colors[(i + 1) % colors.length]} />
                </g>
              );
            })}
          </svg>
        );

      case 'segmentedCycle':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            <circle cx="50" cy="32.5" r="22" stroke={colors[0]} strokeWidth="6" strokeDasharray="36 8" />
            <circle cx="50" cy="32.5" r="22" stroke={colors[1]} strokeWidth="6" strokeDasharray="36 8" strokeDashoffset="44" />
            <circle cx="50" cy="32.5" r="22" stroke={colors[2]} strokeWidth="6" strokeDasharray="36 8" strokeDashoffset="88" />
            <circle cx="50" cy="32.5" r="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
          </svg>
        );

      case 'circularCycle':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            {[0, 120, 240].map((deg, i) => {
              const rad = (deg - 90) * (Math.PI / 180);
              const cx = 50 + 22 * Math.cos(rad);
              const cy = 32.5 + 18 * Math.sin(rad);
              return (
                <g key={deg}>
                  <circle cx={cx} cy={cy} r="8" fill={colors[i % colors.length]} />
                  <line x1="50" y1="32.5" x2={cx} y2={cy} stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="2 2" />
                </g>
              );
            })}
            <circle cx="50" cy="32.5" r="5" fill="#64748b" />
          </svg>
        );

      // ==========================================
      // HIERARCHY CATEGORY LAYOUTS
      // ==========================================
      case 'basicHierarchy':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            {/* Top Root */}
            <rect x="36" y="8" width="28" height="12" rx="2" fill={colors[0]} />
            <line x1="50" y1="20" x2="50" y2="28" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Horizontal Branch Line */}
            <line x1="20" y1="28" x2="80" y2="28" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Vertical Sub Drops */}
            <line x1="20" y1="28" x2="20" y2="36" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="50" y1="28" x2="50" y2="36" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="80" y1="28" x2="80" y2="36" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Child nodes */}
            <rect x="7" y="36" width="26" height="14" rx="2" fill={colors[1 % colors.length]} />
            <rect x="37" y="36" width="26" height="14" rx="2" fill={colors[2 % colors.length]} />
            <rect x="67" y="36" width="26" height="14" rx="2" fill={colors[3 % colors.length]} />
          </svg>
        );

      case 'horizontalHierarchy':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            {/* Left Origin */}
            <rect x="8" y="24" width="24" height="16" rx="2" fill={colors[0]} />
            <line x1="32" y1="32" x2="42" y2="32" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="42" y1="14" x2="42" y2="50" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Branches to Right */}
            <line x1="42" y1="14" x2="52" y2="14" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="42" y1="32" x2="52" y2="32" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="42" y1="50" x2="52" y2="50" stroke="#94a3b8" strokeWidth="1.5" />
            <rect x="52" y="8" width="40" height="12" rx="2" fill={colors[1 % colors.length]} />
            <rect x="52" y="26" width="40" height="12" rx="2" fill={colors[2 % colors.length]} />
            <rect x="52" y="44" width="40" height="12" rx="2" fill={colors[3 % colors.length]} />
          </svg>
        );

      case 'labeledHierarchy':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            <rect x="10" y="8" width="80" height="10" rx="2" fill={colors[0]} />
            <line x1="50" y1="18" x2="50" y2="28" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="28" y1="28" x2="72" y2="28" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="28" y1="28" x2="28" y2="35" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="72" y1="28" x2="72" y2="35" stroke="#94a3b8" strokeWidth="1.5" />
            <rect x="10" y="35" width="36" height="20" rx="2" fill={colors[1 % colors.length]} />
            <rect x="54" y="35" width="36" height="20" rx="2" fill={colors[2 % colors.length]} />
          </svg>
        );

      case 'organizationHierarchy':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            <rect x="34" y="6" width="32" height="14" rx="2" fill={colors[0]} />
            <line x1="50" y1="20" x2="50" y2="30" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="20" y1="30" x2="80" y2="30" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="20" y1="30" x2="20" y2="36" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="50" y1="30" x2="50" y2="36" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="80" y1="30" x2="80" y2="36" stroke="#94a3b8" strokeWidth="1.5" />
            <rect x="8" y="36" width="24" height="18" rx="2" fill="#f8fafc" stroke={colors[1 % colors.length]} strokeWidth="1" />
            <rect x="8" y="36" width="24" height="5" fill={colors[1 % colors.length]} />
            <rect x="38" y="36" width="24" height="18" rx="2" fill="#f8fafc" stroke={colors[2 % colors.length]} strokeWidth="1" />
            <rect x="38" y="36" width="24" height="5" fill={colors[2 % colors.length]} />
            <rect x="68" y="36" width="24" height="18" rx="2" fill="#f8fafc" stroke={colors[3 % colors.length]} strokeWidth="1" />
            <rect x="68" y="36" width="24" height="5" fill={colors[3 % colors.length]} />
          </svg>
        );

      case 'multiLevelHierarchy':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            <rect x="38" y="6" width="24" height="10" rx="2" fill={colors[0]} />
            <line x1="50" y1="16" x2="50" y2="24" stroke="#94a3b8" strokeWidth="1.2" />
            <line x1="28" y1="24" x2="72" y2="24" stroke="#94a3b8" strokeWidth="1.2" />
            <line x1="28" y1="24" x2="28" y2="30" stroke="#94a3b8" strokeWidth="1.2" />
            <line x1="72" y1="24" x2="72" y2="30" stroke="#94a3b8" strokeWidth="1.2" />
            <rect x="16" y="30" width="24" height="10" rx="2" fill={colors[1 % colors.length]} />
            <rect x="60" y="30" width="24" height="10" rx="2" fill={colors[2 % colors.length]} />
            <line x1="28" y1="40" x2="28" y2="48" stroke="#94a3b8" strokeWidth="1.2" />
            <line x1="72" y1="40" x2="72" y2="48" stroke="#94a3b8" strokeWidth="1.2" />
            <rect x="18" y="48" width="20" height="9" rx="1.5" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="62" y="48" width="20" height="9" rx="1.5" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />
          </svg>
        );

      // ==========================================
      // MATRIX CATEGORY LAYOUTS
      // ==========================================
      case 'basicMatrix':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            <rect x="14" y="6" width="34" height="24" rx="3" fill={colors[0]} />
            <rect x="52" y="6" width="34" height="24" rx="3" fill={colors[1 % colors.length]} />
            <rect x="14" y="34" width="34" height="24" rx="3" fill={colors[2 % colors.length]} />
            <rect x="52" y="34" width="34" height="24" rx="3" fill={colors[3 % colors.length]} />
            <circle cx="50" cy="32" r="7" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
          </svg>
        );

      case 'gridMatrix':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            <rect x="12" y="8" width="36" height="22" rx="2" fill={colors[0]} fillOpacity="0.8" />
            <rect x="52" y="8" width="36" height="22" rx="2" fill={colors[1 % colors.length]} fillOpacity="0.8" />
            <rect x="12" y="34" width="36" height="22" rx="2" fill={colors[2 % colors.length]} fillOpacity="0.8" />
            <rect x="52" y="34" width="36" height="22" rx="2" fill={colors[3 % colors.length]} fillOpacity="0.8" />
          </svg>
        );

      case 'titledMatrix':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            {[0, 1, 2, 3].map((i) => {
              const col = i % 2;
              const row = Math.floor(i / 2);
              const x = 12 + col * 40;
              const y = 8 + row * 26;
              return (
                <g key={i}>
                  <rect x={x} y={y} width="36" height="22" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                  <rect x={x} y={y} width="36" height="7" rx="2" fill={colors[i % colors.length]} />
                  <line x1={x + 4} y1={y + 13} x2={x + 30} y2={y + 13} stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                </g>
              );
            })}
          </svg>
        );

      case 'fourQuadrantMatrix':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            {/* Axes */}
            <line x1="50" y1="6" x2="50" y2="58" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="10" y1="32" x2="90" y2="32" stroke="#94a3b8" strokeWidth="1.5" />
            <rect x="14" y="9" width="32" height="20" rx="3" fill={colors[0]} fillOpacity="0.2" stroke={colors[0]} strokeWidth="1" />
            <rect x="54" y="9" width="32" height="20" rx="3" fill={colors[1 % colors.length]} fillOpacity="0.2" stroke={colors[1 % colors.length]} strokeWidth="1" />
            <rect x="14" y="35" width="32" height="20" rx="3" fill={colors[2 % colors.length]} fillOpacity="0.2" stroke={colors[2 % colors.length]} strokeWidth="1" />
            <rect x="54" y="35" width="32" height="20" rx="3" fill={colors[3 % colors.length]} fillOpacity="0.2" stroke={colors[3 % colors.length]} strokeWidth="1" />
          </svg>
        );

      case 'cycleMatrix':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            <rect x="15" y="8" width="32" height="21" rx="2" fill={colors[0]} />
            <rect x="53" y="8" width="32" height="21" rx="2" fill={colors[1 % colors.length]} />
            <rect x="53" y="35" width="32" height="21" rx="2" fill={colors[2 % colors.length]} />
            <rect x="15" y="35" width="32" height="21" rx="2" fill={colors[3 % colors.length]} />
            <circle cx="50" cy="32" r="5" stroke="#94a3b8" strokeWidth="1.5" fill="#ffffff" />
          </svg>
        );

      // ==========================================
      // PYRAMID CATEGORY LAYOUTS
      // ==========================================
      case 'basicPyramid':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            {/* Top Tier */}
            <polygon points="50,8 39,24 61,24" fill={colors[0]} />
            {/* Middle Tier */}
            <polygon points="37,27 63,27 72,42 28,42" fill={colors[1 % colors.length]} />
            {/* Base Tier */}
            <polygon points="26,45 74,45 84,59 16,59" fill={colors[2 % colors.length]} />
          </svg>
        );

      case 'segmentedPyramid':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            <polygon points="50,6 40,20 60,20" fill={colors[0]} />
            <polygon points="38,23 62,23 70,36 30,36" fill={colors[1 % colors.length]} />
            <polygon points="28,39 72,39 79,50 21,50" fill={colors[2 % colors.length]} />
            <polygon points="19,53 81,53 88,60 12,60" fill={colors[3 % colors.length]} />
          </svg>
        );

      case 'pyramidList':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            {/* Left Pyramid */}
            <polygon points="25,8 18,24 32,24" fill={colors[0]} />
            <polygon points="16,26 34,26 40,41 10,41" fill={colors[1 % colors.length]} />
            <polygon points="9,43 41,43 47,58 3,58" fill={colors[2 % colors.length]} />
            {/* Right Callouts */}
            <rect x="42" y="10" width="52" height="12" rx="2" fill={colors[0]} fillOpacity="0.2" />
            <rect x="48" y="27" width="46" height="12" rx="2" fill={colors[1 % colors.length]} fillOpacity="0.2" />
            <rect x="54" y="44" width="40" height="12" rx="2" fill={colors[2 % colors.length]} fillOpacity="0.2" />
          </svg>
        );

      case 'layeredPyramid':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            <rect x="36" y="8" width="28" height="10" rx="2" fill={colors[0]} />
            <rect x="28" y="21" width="44" height="10" rx="2" fill={colors[1 % colors.length]} />
            <rect x="20" y="34" width="60" height="10" rx="2" fill={colors[2 % colors.length]} />
            <rect x="12" y="47" width="76" height="10" rx="2" fill={colors[3 % colors.length]} />
          </svg>
        );

      // ==========================================
      // TEXT CARD CATEGORY LAYOUTS
      // ==========================================
      case 'standardCards':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${8 + i * 29}, 10)`}>
                <rect width="26" height="44" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                <rect width="26" height="4" rx="2" fill={colors[i % colors.length]} />
                <line x1="4" y1="12" x2="22" y2="12" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
                <line x1="4" y1="20" x2="18" y2="20" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="4" y1="26" x2="20" y2="26" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            ))}
          </svg>
        );

      case 'headerCards':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${8 + i * 29}, 10)`}>
                <rect width="26" height="44" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <rect width="26" height="13" rx="3" fill={colors[i % colors.length]} />
                <line x1="4" y1="22" x2="22" y2="22" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="4" y1="28" x2="18" y2="28" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            ))}
          </svg>
        );

      case 'multiColumnCards':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${8 + i * 29}, 8)`}>
                <rect width="26" height="48" rx="2" fill="#f1f5f9" />
                <circle cx="13" cy="11" r="5" fill={colors[i % colors.length]} />
                <line x1="4" y1="22" x2="22" y2="22" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="4" y1="28" x2="18" y2="28" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="4" y1="34" x2="20" y2="34" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            ))}
          </svg>
        );

      case 'calloutCard':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            <rect x="10" y="10" width="80" height="44" rx="4" fill="#f8fafc" stroke={colors[0]} strokeWidth="1.5" />
            <rect x="10" y="10" width="6" height="44" rx="2" fill={colors[0]} />
            <circle cx="26" cy="24" r="5" fill={colors[0]} />
            <line x1="36" y1="24" x2="80" y2="24" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="22" y1="36" x2="80" y2="36" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="22" y1="43" x2="68" y2="43" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );

      case 'statCard':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${8 + i * 29}, 12)`}>
                <rect width="26" height="40" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
                <rect x="4" y="6" width="18" height="10" rx="1.5" fill={colors[i % colors.length]} fillOpacity="0.2" />
                <text x="13" y="14" textAnchor="middle" fill={colors[i % colors.length]} fontSize="8" fontWeight="bold">
                  99%
                </text>
                <line x1="4" y1="23" x2="22" y2="23" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="4" y1="29" x2="18" y2="29" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            ))}
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full" fill="none">
            <rect x="10" y="10" width="80" height="45" rx="3" fill={colors[0]} fillOpacity="0.1" stroke={colors[0]} strokeWidth="1" />
            <line x1="20" y1="25" x2="80" y2="25" stroke={colors[0]} strokeWidth="2" strokeLinecap="round" />
            <line x1="20" y1="35" x2="65" y2="35" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center select-none overflow-hidden ${
        isLarge ? 'w-full h-full p-4' : 'w-full h-full p-2'
      } ${className}`}
    >
      {renderGraphic()}
    </div>
  );
};
