import {
  Paintbrush,
  Square,
  Maximize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/components/ui/dropdown-menu';
import RibbonDivider from '../controls/RibbonDivider';
import { useChartContext } from '@/features/editor/modules/figures/modules/chart';

export default function ChartFormatTab() {
  const { activeChart, updateActiveChart, deleteActiveChart } = useChartContext();

  if (!activeChart) {
    return (
      <div className="flex items-center h-9 px-3 text-xs text-muted-foreground">
        Select a chart in the document to configure formatting.
      </div>
    );
  }

  const handleWidthChange = (delta: number) => {
    const newWidth = Math.max(300, Math.min(800, activeChart.width + delta));
    updateActiveChart({ width: newWidth });
  };

  const handleHeightChange = (delta: number) => {
    const newHeight = Math.max(200, Math.min(600, activeChart.height + delta));
    updateActiveChart({ height: newHeight });
  };

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 text-secondary-foreground dark:text-muted-foreground">
      {/* --------------------------------------------------------
          1. SHAPE FILL (BACKGROUND)
          -------------------------------------------------------- */}
      <DropdownMenu>
        <DropdownMenuTrigger render={<button
            type="button"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 h-8 text-xs font-medium transition-colors hover:bg-muted dark:hover:bg-muted text-secondary-foreground dark:text-muted-foreground"
          >
            <Paintbrush className="h-4 w-4 text-primary dark:text-primary" />
            <span>Shape Fill</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>} />

        <DropdownMenuContent align="start" className="w-48 p-2">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 px-1">
            Background Colors
          </div>
          <div className="grid grid-cols-5 gap-1.5 p-1">
            {[
              { label: 'White', color: '#ffffff' },
              { label: 'Off-White', color: '#f8fafc' },
              { label: 'Soft Gray', color: '#f1f5f9' },
              { label: 'Light Blue', color: '#eff6ff' },
              { label: 'Dark Slate', color: '#0f172a' },
            ].map((bg) => (
              <button
                key={bg.color}
                type="button"
                onClick={() => updateActiveChart({ backgroundColor: bg.color })}
                className="w-6 h-6 rounded border border-border shadow-2xs hover:scale-110 transition-transform"
                style={{ backgroundColor: bg.color }}
                title={bg.label}
              />
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* --------------------------------------------------------
          2. SHAPE OUTLINE (BORDER)
          -------------------------------------------------------- */}
      <DropdownMenu>
        <DropdownMenuTrigger render={<button
            type="button"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 h-8 text-xs font-medium transition-colors hover:bg-muted dark:hover:bg-muted text-secondary-foreground dark:text-muted-foreground"
          >
            <Square className="h-4 w-4 text-secondary-foreground dark:text-muted-foreground" />
            <span>Outline</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>} />

        <DropdownMenuContent align="start" className="w-44">
          <DropdownMenuItem
            onClick={() => updateActiveChart({ borderWidth: 0, borderColor: 'transparent' })}
            className="text-xs"
          >
            No Outline
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => updateActiveChart({ borderWidth: 1, borderColor: '#e2e8f0' })}
            className="text-xs"
          >
            Standard Border (1px)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => updateActiveChart({ borderWidth: 2, borderColor: '#2563eb' })}
            className="text-xs font-semibold text-primary"
          >
            Blue Accent (2px)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => updateActiveChart({ borderWidth: 2, borderColor: '#64748b' })}
            className="text-xs"
          >
            Slate Border (2px)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RibbonDivider />

      {/* --------------------------------------------------------
          3. DIMENSIONS (WIDTH / HEIGHT)
          -------------------------------------------------------- */}
      <div className="flex items-center gap-2 text-xs">
        <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />

        {/* Width stepper */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-muted-foreground font-medium">W:</span>
          <button
            type="button"
            onClick={() => handleWidthChange(-40)}
            className="w-5 h-6 flex items-center justify-center rounded border border-secondary bg-card text-xs font-semibold text-secondary-foreground hover:bg-muted"
          >
            -
          </button>
          <span className="w-12 text-center text-xs font-mono font-medium">
            {activeChart.width}px
          </span>
          <button
            type="button"
            onClick={() => handleWidthChange(40)}
            className="w-5 h-6 flex items-center justify-center rounded border border-secondary bg-card text-xs font-semibold text-secondary-foreground hover:bg-muted"
          >
            +
          </button>
        </div>

        {/* Height stepper */}
        <div className="flex items-center gap-1 ml-1">
          <span className="text-[11px] text-muted-foreground font-medium">H:</span>
          <button
            type="button"
            onClick={() => handleHeightChange(-30)}
            className="w-5 h-6 flex items-center justify-center rounded border border-secondary bg-card text-xs font-semibold text-secondary-foreground hover:bg-muted"
          >
            -
          </button>
          <span className="w-12 text-center text-xs font-mono font-medium">
            {activeChart.height}px
          </span>
          <button
            type="button"
            onClick={() => handleHeightChange(30)}
            className="w-5 h-6 flex items-center justify-center rounded border border-secondary bg-card text-xs font-semibold text-secondary-foreground hover:bg-muted"
          >
            +
          </button>
        </div>
      </div>

      <RibbonDivider />

      {/* --------------------------------------------------------
          4. ALIGNMENT
          -------------------------------------------------------- */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => updateActiveChart({ alignment: 'left' })}
          className={`p-1.5 rounded transition-colors ${
            activeChart.alignment === 'left' ? 'bg-primary/15 text-primary/90' : 'hover:bg-muted text-secondary-foreground'
          }`}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => updateActiveChart({ alignment: 'center' })}
          className={`p-1.5 rounded transition-colors ${
            activeChart.alignment === 'center' || !activeChart.alignment
              ? 'bg-primary/15 text-primary/90'
              : 'hover:bg-muted text-secondary-foreground'
          }`}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => updateActiveChart({ alignment: 'right' })}
          className={`p-1.5 rounded transition-colors ${
            activeChart.alignment === 'right' ? 'bg-primary/15 text-primary/90' : 'hover:bg-muted text-secondary-foreground'
          }`}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </button>
      </div>

      <RibbonDivider />

      {/* --------------------------------------------------------
          5. DELETE CHART
          -------------------------------------------------------- */}
      <button
        type="button"
        onClick={deleteActiveChart}
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 h-8 text-xs font-medium text-destructive hover:bg-destructive/10 dark:hover:bg-red-950/40 transition-colors"
        title="Delete chart from document"
      >
        <Trash2 className="h-4 w-4" />
        <span>Delete</span>
      </button>
    </div>
  );
}
