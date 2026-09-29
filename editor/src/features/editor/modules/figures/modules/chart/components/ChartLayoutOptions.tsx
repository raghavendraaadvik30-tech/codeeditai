import React from 'react';
import { X } from 'lucide-react';
import type { ChartModel, TextWrapMode, ChartPositionMode } from '../types/chart.types';
export type { TextWrapMode, ChartPositionMode };

interface ChartLayoutOptionsProps {
  chart: ChartModel;
  isOpen: boolean;
  onClose: () => void;
  onUpdateChart: (updated: ChartModel) => void;
  onSeeMore?: () => void;
}

export const ChartLayoutOptions: React.FC<ChartLayoutOptionsProps> = ({
  chart,
  isOpen,
  onClose,
  onUpdateChart,
  onSeeMore,
}) => {
  const selectedWrap: TextWrapMode = chart.wrapMode || 'inline';
  const positionMode: ChartPositionMode = chart.positionMode || 'moveWithText';

  if (!isOpen) return null;

  const handleSelectWrap = (mode: TextWrapMode) => {
    onUpdateChart({
      ...chart,
      wrapMode: mode,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSelectPositionMode = (mode: ChartPositionMode) => {
    onUpdateChart({
      ...chart,
      positionMode: mode,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div
      data-editor-ui="true"
      className="absolute left-10 top-0 w-[230px] bg-[#242424] border border-[#444444] rounded-xs shadow-2xl p-3 z-50 text-white font-sans select-none animate-in fade-in zoom-in-95 duration-100"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Left triangular notch pointing to the Layout Options button */}
      <div className="absolute -left-2 top-3 w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] border-r-[#242424]" />
      <div className="absolute -left-[9px] top-3 w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] border-r-[#444444] -z-10" />

      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-[#383838]">
        <h4 className="text-[13px] font-medium text-[#5fa5f9] tracking-wide">
          Layout Options
        </h4>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Section 1: In Line with Text */}
      <div className="mt-2.5">
        <p className="text-[11px] font-bold text-white mb-1.5">
          In Line with Text
        </p>
        <button
          type="button"
          onClick={() => handleSelectWrap('inline')}
          className={`p-1 rounded-xs border transition-all ${
            selectedWrap === 'inline'
              ? 'border-[#5fa5f9] bg-[#1a1a1a] ring-1 ring-[#5fa5f9]'
              : 'border-[#555555] hover:border-slate-300 bg-[#1e1e1e]'
          }`}
          title="In Line with Text"
        >
          <svg width="42" height="30" viewBox="0 0 42 30" fill="none">
            {/* Top horizontal blue line */}
            <line x1="4" y1="7" x2="38" y2="7" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
            {/* Arch on the left */}
            <path d="M 6 25 C 6 15, 20 15, 20 25" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Two horizontal blue lines beside arch */}
            <line x1="24" y1="19" x2="38" y2="19" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
            <line x1="24" y1="25" x2="38" y2="25" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Section 2: With Text Wrapping */}
      <div className="mt-3">
        <p className="text-[11px] font-bold text-white mb-1.5">
          With Text Wrapping
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {/* 1. Square */}
          <button
            type="button"
            onClick={() => handleSelectWrap('square')}
            className={`p-1 rounded-xs border transition-all flex items-center justify-center ${
              selectedWrap === 'square'
                ? 'border-[#5fa5f9] bg-[#1a1a1a] ring-1 ring-[#5fa5f9]'
                : 'border-[#555555] hover:border-slate-300 bg-[#1e1e1e]'
            }`}
            title="Square"
          >
            <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
              <line x1="3" y1="6" x2="10" y2="6" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="12" x2="10" y2="12" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="18" x2="10" y2="18" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="24" x2="10" y2="24" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 13 24 C 13 13, 27 13, 27 24" stroke="#ffffff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
              <line x1="30" y1="6" x2="37" y2="6" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="30" y1="12" x2="37" y2="12" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="30" y1="18" x2="37" y2="18" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="30" y1="24" x2="37" y2="24" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          {/* 2. Tight */}
          <button
            type="button"
            onClick={() => handleSelectWrap('tight')}
            className={`p-1 rounded-xs border transition-all flex items-center justify-center ${
              selectedWrap === 'tight'
                ? 'border-[#5fa5f9] bg-[#1a1a1a] ring-1 ring-[#5fa5f9]'
                : 'border-[#555555] hover:border-slate-300 bg-[#1e1e1e]'
            }`}
            title="Tight"
          >
            <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
              <line x1="3" y1="6" x2="13" y2="6" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="12" x2="11" y2="12" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="18" x2="10" y2="18" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="24" x2="10" y2="24" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 13 24 C 13 13, 27 13, 27 24" stroke="#ffffff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
              <line x1="27" y1="6" x2="37" y2="6" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="29" y1="12" x2="37" y2="12" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="30" y1="18" x2="37" y2="18" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="30" y1="24" x2="37" y2="24" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          {/* 3. Through */}
          <button
            type="button"
            onClick={() => handleSelectWrap('through')}
            className={`p-1 rounded-xs border transition-all flex items-center justify-center ${
              selectedWrap === 'through'
                ? 'border-[#5fa5f9] bg-[#1a1a1a] ring-1 ring-[#5fa5f9]'
                : 'border-[#555555] hover:border-slate-300 bg-[#1e1e1e]'
            }`}
            title="Through"
          >
            <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
              <line x1="3" y1="6" x2="14" y2="6" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="12" x2="12" y2="12" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="18" x2="11" y2="18" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="24" x2="10" y2="24" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 13 24 C 13 13, 27 13, 27 24" stroke="#ffffff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
              <line x1="26" y1="6" x2="37" y2="6" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="28" y1="12" x2="37" y2="12" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="29" y1="18" x2="37" y2="18" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="30" y1="24" x2="37" y2="24" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          {/* 4. Top and Bottom */}
          <button
            type="button"
            onClick={() => handleSelectWrap('topBottom')}
            className={`p-1 rounded-xs border transition-all flex items-center justify-center ${
              selectedWrap === 'topBottom'
                ? 'border-[#5fa5f9] bg-[#1a1a1a] ring-1 ring-[#5fa5f9]'
                : 'border-[#555555] hover:border-slate-300 bg-[#1e1e1e]'
            }`}
            title="Top and Bottom"
          >
            <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
              <line x1="3" y1="6" x2="37" y2="6" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 13 22 C 13 12, 27 12, 27 22" stroke="#ffffff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
              <line x1="3" y1="25" x2="37" y2="25" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          {/* 5. Behind Text */}
          <button
            type="button"
            onClick={() => handleSelectWrap('behind')}
            className={`p-1 rounded-xs border transition-all flex items-center justify-center ${
              selectedWrap === 'behind'
                ? 'border-[#5fa5f9] bg-[#1a1a1a] ring-1 ring-[#5fa5f9]'
                : 'border-[#555555] hover:border-slate-300 bg-[#1e1e1e]'
            }`}
            title="Behind Text"
          >
            <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
              {/* Shaded gray arch in background */}
              <path d="M 13 24 C 13 13, 27 13, 27 24" stroke="#6b7280" strokeWidth="3.2" fill="#3f3f46" strokeLinecap="round" />
              {/* Blue lines over it */}
              <line x1="3" y1="6" x2="37" y2="6" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="12" x2="37" y2="12" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="18" x2="37" y2="18" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="24" x2="37" y2="24" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          {/* 6. In Front of Text */}
          <button
            type="button"
            onClick={() => handleSelectWrap('inFront')}
            className={`p-1 rounded-xs border transition-all flex items-center justify-center ${
              selectedWrap === 'inFront'
                ? 'border-[#5fa5f9] bg-[#1a1a1a] ring-1 ring-[#5fa5f9]'
                : 'border-[#555555] hover:border-slate-300 bg-[#1e1e1e]'
            }`}
            title="In Front of Text"
          >
            <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
              {/* Blue lines in background */}
              <line x1="3" y1="6" x2="37" y2="6" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="12" x2="37" y2="12" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="18" x2="37" y2="18" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="24" x2="37" y2="24" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              {/* White opaque arch in front */}
              <path d="M 13 24 C 13 13, 27 13, 27 24" stroke="#ffffff" strokeWidth="3" fill="#242424" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Section 3: Radio Options */}
      <div className="mt-3.5 space-y-2 text-[11px] text-slate-300">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name={`layout-pos-${chart.id}`}
            checked={positionMode === 'moveWithText'}
            onChange={() => handleSelectPositionMode('moveWithText')}
            className="accent-blue-500 w-3 h-3 cursor-pointer"
          />
          <span className="group-hover:text-white flex-1">
            <span className="underline">M</span>ove with text
          </span>
          <span className="text-[10px] text-slate-400 border border-slate-600 rounded-full w-3.5 h-3.5 flex items-center justify-center font-serif">
            i
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name={`layout-pos-${chart.id}`}
            checked={positionMode === 'fixPosition'}
            onChange={() => handleSelectPositionMode('fixPosition')}
            className="accent-blue-500 w-3 h-3 cursor-pointer"
          />
          <span className="group-hover:text-white flex-1">
            Fix positio<span className="underline">n</span> on page
          </span>
          <span className="text-[10px] text-slate-400 border border-slate-600 rounded-full w-3.5 h-3.5 flex items-center justify-center font-serif">
            i
          </span>
        </label>
      </div>

      {/* Bottom Link: See more... */}
      <div className="mt-3 pt-1 text-right">
        <button
          type="button"
          onClick={() => {
            if (onSeeMore) {
              onSeeMore();
            }
          }}
          className="text-[11px] text-[#5fa5f9] hover:underline cursor-pointer"
        >
          See more...
        </button>
      </div>
    </div>
  );
};
