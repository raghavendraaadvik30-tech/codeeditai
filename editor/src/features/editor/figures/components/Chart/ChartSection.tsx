import React, { useState } from 'react';
import { BarChart2, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/components/ui/dropdown-menu';
import { useEditor } from '@/features/editor/context/EditorContext';
import type { ChartType } from '@/features/editor/charts/types';
import { createDefaultChartModel, generateChartHTML } from '@/features/editor/charts/utils';
import { InsertChartModal } from './InsertChartModal';

export const ChartSection: React.FC = () => {
  const { insertHTML } = useEditor();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInsertChart = (type: ChartType) => {
    const chartModel = createDefaultChartModel(type);
    const html = generateChartHTML(chartModel);
    insertHTML(html);
  };

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-[#111D29]">
        <div className="flex items-center justify-between">
          {/* Chart Header Icon + Title & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <BarChart2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Chart
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chart
              </p>
            </div>
          </div>

          {/* Insert Dropdown Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-md bg-[#0078d4] px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#005a9e] focus:outline-none"
              >
                <span>Insert</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer font-medium"
              >
                <BarChart2 className="mr-2 h-4 w-4 text-blue-600" />
                <span>Insert Chart...</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Insert Chart Modal */}
      <InsertChartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInsertChart={handleInsertChart}
      />
    </>
  );
};
