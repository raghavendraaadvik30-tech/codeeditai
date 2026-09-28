import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
  Trash2,
  FileSpreadsheet,
  Palette,
  Table,
} from 'lucide-react';

export interface ChartContextMenuProps {
  x: number;
  y: number;
  isSpreadsheetOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  onSelectData: () => void;
  onChangeColors: () => void;
  onChartStyle?: () => void;
  onToggleEditData: () => void;
  onChangeType?: () => void;
  onSwitchRowColumn?: () => void;
  onRefresh?: () => void;
}

export const ChartContextMenu: React.FC<ChartContextMenuProps> = ({
  x,
  y,
  isSpreadsheetOpen,
  onClose,
  onDelete,
  onSelectData,
  onChangeColors,
  onToggleEditData,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing ESC
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Adjust coordinates so the menu remains entirely inside the visible window viewport
  const menuWidth = 230;
  const menuHeight = 300;
  const clampedX = Math.max(8, Math.min(x, window.innerWidth - menuWidth - 12));
  const clampedY = Math.max(8, Math.min(y, window.innerHeight - menuHeight - 12));

  const items = [
    {
      label: 'Edit Data',
      icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" />,
      action: () => {
        onToggleEditData();
        onClose();
      },
      active: isSpreadsheetOpen,
    },
    {
      label: 'Select Data',
      icon: <Table className="w-4 h-4 text-cyan-600" />,
      action: () => {
        onSelectData();
        onClose();
      },
    },
    {
      label: 'Change Colors',
      icon: <Palette className="w-4 h-4 text-emerald-600" />,
      action: () => {
        onChangeColors();
        onClose();
      },
    },
    null, // Separator
    {
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4 text-red-500" />,
      action: () => {
        onDelete();
        onClose();
      },
      danger: true,
    },
  ];

  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      className="fixed z-[99999] w-[230px] rounded-lg border border-slate-200 bg-white/98 backdrop-blur-md p-1 shadow-xl text-slate-800 animate-in fade-in zoom-in-95 duration-100 select-none dark:bg-[#111D29] dark:border-slate-800 dark:text-slate-200"
      style={{ top: `${clampedY}px`, left: `${clampedX}px` }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {items.map((item, index) => {
        if (!item) {
          return (
            <div
              key={`sep-${index}`}
              className="my-1 h-px bg-slate-100 dark:bg-slate-800"
            />
          );
        }

        return (
          <button
            key={item.label}
            type="button"
            onClick={item.action}
            className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-left transition-colors ${
              item.danger
                ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40'
                : item.active
                ? 'bg-emerald-50 text-emerald-800 font-semibold dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
          </button>
        );
      })}
    </div>,
    document.body
  );
};
