/**
 * --------------------------------------------------------
 * Module: Figures / Figure
 * Feature: Figure Gallery Component
 * Description:
 * Grid list displaying saved figures with filterable categories, search capabilities,
 * selection handlers, and quick preview thumbnails.
 * --------------------------------------------------------
 */

import React, { useState, useMemo } from 'react';
import { Search, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import type { FigureModel } from '../types';
import { FIGURE_CATEGORIES } from '../constants';

interface FigureGalleryProps {
  figures: FigureModel[];
  activeFigureId?: string;
  onSelectFigure: (figure: FigureModel) => void;
}

export const FigureGallery: React.FC<FigureGalleryProps> = ({
  figures,
  activeFigureId,
  onSelectFigure,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredFigures = useMemo(() => {
    return figures.filter((fig) => {
      const matchesSearch =
        fig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fig.caption.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        selectedCategory === 'ALL' || fig.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [figures, searchQuery, selectedCategory]);

  return (
    <div className="space-y-4">
      {/* Search & Category Filter */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search figures..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option value="ALL">All Categories</option>
          {FIGURE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {filteredFigures.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-800">
          <ImageIcon className="h-8 w-8 text-slate-400" />
          <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-400">
            No figures match your query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filteredFigures.map((fig) => {
            const isSelected = fig.id === activeFigureId;
            return (
              <div
                key={fig.id}
                onClick={() => onSelectFigure(fig)}
                className={`group relative cursor-pointer overflow-hidden rounded-xl border p-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20 dark:bg-blue-950/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-[#111D29]'
                }`}
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900">
                  <img
                    src={fig.src}
                    alt={fig.altText || fig.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {isSelected && (
                    <div className="absolute right-2 top-2 rounded-full bg-blue-600 p-0.5 text-white shadow">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                    {fig.title}
                  </p>
                  <p className="truncate text-[10px] text-slate-500">
                    {fig.category} • {fig.width}px
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
