import {
  PlusCircle,
  LayoutGrid,
  Palette,
  ArrowUpDown,
  Table,
  FileSpreadsheet,
  RefreshCw,
  BarChart3,
  ChevronDown,
  Check,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/shared/components/ui/dropdown-menu';
import RibbonButton from '../controls/RibbonButton';
import RibbonDivider from '../controls/RibbonDivider';
import {
  useChartContext,
  COLOR_SCHEMES,
  CHART_STYLES,
  QUICK_LAYOUTS,
  ChangeChartTypeModal,
  SelectDataModal,
} from '@/features/editor/modules/figures/modules/chart';

export default function ChartDesignTab() {
  const {
    activeChart,
    updateActiveChart,
    isSpreadsheetOpen,
    setIsSpreadsheetOpen,
    isChangeTypeModalOpen,
    setIsChangeTypeModalOpen,
    isSelectDataModalOpen,
    setIsSelectDataModalOpen,
    changeChartType,
    switchRowColumn,
    changeColorScheme,
    changeChartStyle,
    applyQuickLayout,
    refreshActiveChart,
  } = useChartContext();

  if (!activeChart) {
    return (
      <div className="flex items-center h-9 px-3 text-xs text-muted-foreground">
        Select a chart in the document to configure design and layouts.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 text-secondary-foreground dark:text-muted-foreground">
      {/* --------------------------------------------------------
          1. CHART LAYOUTS GROUP
          -------------------------------------------------------- */}
      <div className="flex items-center gap-1">
        {/* ADD CHART ELEMENT DROPDOWN */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<button
              type="button"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 h-8 text-xs font-medium transition-colors hover:bg-muted dark:hover:bg-muted text-secondary-foreground dark:text-muted-foreground"
            >
              <PlusCircle className="h-4 w-4 text-primary dark:text-primary" />
              <span>Add Element</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>} />

          <DropdownMenuContent align="start" className="w-52">
            {/* Chart Title Submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-xs">
                <span>Chart Title</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-44">
                <DropdownMenuItem
                  onClick={() => updateActiveChart({ showTitle: false })}
                  className="text-xs justify-between"
                >
                  <span>None</span>
                  {!activeChart.showTitle && <Check className="w-3.5 h-3.5 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateActiveChart({ showTitle: true, titleAlignment: 'center' })}
                  className="text-xs justify-between"
                >
                  <span>Above Chart</span>
                  {activeChart.showTitle && <Check className="w-3.5 h-3.5 text-primary" />}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* Axis Titles Submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-xs">
                <span>Axis Titles</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                <DropdownMenuItem
                  onClick={() =>
                    updateActiveChart({ showXAxisTitle: !activeChart.showXAxisTitle })
                  }
                  className="text-xs justify-between"
                >
                  <span>Primary Horizontal</span>
                  {activeChart.showXAxisTitle && <Check className="w-3.5 h-3.5 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateActiveChart({ showYAxisTitle: !activeChart.showYAxisTitle })
                  }
                  className="text-xs justify-between"
                >
                  <span>Primary Vertical</span>
                  {activeChart.showYAxisTitle && <Check className="w-3.5 h-3.5 text-primary" />}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* Legend Submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-xs">
                <span>Legend</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-40">
                <DropdownMenuItem
                  onClick={() => updateActiveChart({ showLegend: false })}
                  className="text-xs justify-between"
                >
                  <span>None</span>
                  {!activeChart.showLegend && <Check className="w-3.5 h-3.5 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateActiveChart({ showLegend: true, legendPosition: 'right' })}
                  className="text-xs justify-between"
                >
                  <span>Right</span>
                  {activeChart.showLegend && activeChart.legendPosition === 'right' && (
                    <Check className="w-3.5 h-3.5 text-primary" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateActiveChart({ showLegend: true, legendPosition: 'top' })}
                  className="text-xs justify-between"
                >
                  <span>Top</span>
                  {activeChart.showLegend && activeChart.legendPosition === 'top' && (
                    <Check className="w-3.5 h-3.5 text-primary" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateActiveChart({ showLegend: true, legendPosition: 'bottom' })}
                  className="text-xs justify-between"
                >
                  <span>Bottom</span>
                  {activeChart.showLegend && activeChart.legendPosition === 'bottom' && (
                    <Check className="w-3.5 h-3.5 text-primary" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* Data Labels Submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-xs">
                <span>Data Labels</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-40">
                <DropdownMenuItem
                  onClick={() => updateActiveChart({ showDataLabels: false, dataLabelPosition: 'none' })}
                  className="text-xs justify-between"
                >
                  <span>None</span>
                  {!activeChart.showDataLabels && <Check className="w-3.5 h-3.5 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateActiveChart({ showDataLabels: true, dataLabelPosition: 'center' })}
                  className="text-xs justify-between"
                >
                  <span>Center</span>
                  {activeChart.showDataLabels && activeChart.dataLabelPosition === 'center' && (
                    <Check className="w-3.5 h-3.5 text-primary" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateActiveChart({ showDataLabels: true, dataLabelPosition: 'outsideEnd' })}
                  className="text-xs justify-between"
                >
                  <span>Outside End</span>
                  {activeChart.showDataLabels && activeChart.dataLabelPosition === 'outsideEnd' && (
                    <Check className="w-3.5 h-3.5 text-primary" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* Gridlines Submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-xs">
                <span>Gridlines</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                <DropdownMenuItem
                  onClick={() => updateActiveChart({ showGridlines: !activeChart.showGridlines })}
                  className="text-xs justify-between"
                >
                  <span>Major Gridlines</span>
                  {activeChart.showGridlines && <Check className="w-3.5 h-3.5 text-primary" />}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* QUICK LAYOUT DROPDOWN */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<button
              type="button"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 h-8 text-xs font-medium transition-colors hover:bg-muted dark:hover:bg-muted text-secondary-foreground dark:text-muted-foreground"
            >
              <LayoutGrid className="h-4 w-4 text-secondary-foreground dark:text-muted-foreground" />
              <span>Quick Layout</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>} />

          <DropdownMenuContent align="start" className="w-60">
            {QUICK_LAYOUTS.map((layout: { id: string; name: string; description: string }) => (
              <DropdownMenuItem
                key={layout.id}
                onClick={() => applyQuickLayout(layout.id)}
                className="flex flex-col items-start p-2 cursor-pointer text-xs"
              >
                <span className="font-semibold text-foreground">{layout.name}</span>
                <span className="text-[11px] text-muted-foreground">{layout.description}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <RibbonDivider />

      {/* --------------------------------------------------------
          2. CHART STYLES & COLORS GROUP
          -------------------------------------------------------- */}
      <div className="flex items-center gap-1">
        {/* CHANGE COLORS DROPDOWN */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<button
              type="button"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 h-8 text-xs font-medium transition-colors hover:bg-muted dark:hover:bg-muted text-secondary-foreground dark:text-muted-foreground"
            >
              <Palette className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Change Colors</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>} />

          <DropdownMenuContent align="start" className="w-56 p-1.5 space-y-1">
            {COLOR_SCHEMES.map((scheme: { id: string; name: string; colors: string[] }) => (
              <DropdownMenuItem
                key={scheme.id}
                onClick={() => changeColorScheme(scheme.id)}
                className="flex items-center justify-between p-2 cursor-pointer rounded text-xs"
              >
                <div className="space-y-1 w-full">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-secondary-foreground">{scheme.name}</span>
                    {activeChart.colorScheme === scheme.id && (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {scheme.colors.slice(0, 5).map((color: string, cIdx: number) => (
                      <span
                        key={cIdx}
                        className="w-4 h-3.5 rounded-xs"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* CHART STYLES GALLERY */}
        <div className="flex items-center gap-1 ml-1">
          {CHART_STYLES.map((style: { id: string; name: string; description: string }) => {
            const isSelected = activeChart.chartStyle === style.id;

            return (
              <button
                key={style.id}
                type="button"
                onClick={() => changeChartStyle(style.id)}
                className={`
                  flex flex-col items-center justify-center w-14 h-8 rounded border px-1 transition-all text-center
                  ${
                    isSelected
                      ? 'border-primary bg-primary/60 shadow-xs'
                      : 'border-secondary hover:border-border hover:bg-muted'
                  }
                `}
                title={`${style.name}: ${style.description}`}
              >
                <div className="flex items-end gap-0.5 h-3.5 w-8 justify-center">
                  <div className="w-1.5 h-2.5 bg-primary rounded-[2px]" />
                  <div className="w-1.5 h-3.5 bg-primary rounded-[2px]" />
                  <div className="w-1.5 h-1.5 bg-primary rounded-[2px]" />
                </div>
                <span className="text-[9px] font-medium text-secondary-foreground leading-none mt-0.5">
                  {style.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <RibbonDivider />

      {/* --------------------------------------------------------
          3. DATA CONTROLS GROUP
          -------------------------------------------------------- */}
      <div className="flex items-center gap-1">
        <RibbonButton
          icon={<ArrowUpDown className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
          onClick={switchRowColumn}
        >
          Switch Row/Col
        </RibbonButton>

        <RibbonButton
          icon={<Table className="h-4 w-4 text-secondary-foreground dark:text-muted-foreground" />}
          onClick={() => setIsSelectDataModalOpen(true)}
        >
          Select Data
        </RibbonButton>

        {/* EDIT DATA BUTTON (Toggles live Excel-like spreadsheet above the chart) */}
        <button
          type="button"
          onClick={() => setIsSpreadsheetOpen((prev: boolean) => !prev)}
          className={`
            inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 h-8 text-xs font-semibold transition-all
            ${
              isSpreadsheetOpen
                ? 'bg-emerald-700 text-primary-foreground shadow-xs'
                : 'bg-emerald-600 hover:bg-emerald-700 text-primary-foreground shadow-2xs'
            }
          `}
          title="Toggle live spreadsheet editor above chart"
        >
          <FileSpreadsheet className="h-4 w-4 text-primary-foreground" />
          <span>Edit Data</span>
        </button>

        <RibbonButton
          icon={<RefreshCw className="h-3.5 w-3.5 text-muted-foreground dark:text-muted-foreground" />}
          onClick={refreshActiveChart}
        >
          Refresh
        </RibbonButton>
      </div>

      <RibbonDivider />

      {/* --------------------------------------------------------
          4. TYPE GROUP
          -------------------------------------------------------- */}
      <RibbonButton
        icon={<BarChart3 className="h-4 w-4 text-primary dark:text-indigo-400" />}
        onClick={() => setIsChangeTypeModalOpen(true)}
      >
        Change Type
      </RibbonButton>

      {/* CHANGE CHART TYPE MODAL */}
      <ChangeChartTypeModal
        isOpen={isChangeTypeModalOpen}
        currentType={activeChart.chartType}
        onClose={() => setIsChangeTypeModalOpen(false)}
        onSelectType={changeChartType}
      />

      {/* SELECT DATA MODAL */}
      <SelectDataModal
        isOpen={isSelectDataModalOpen}
        chart={activeChart}
        onClose={() => setIsSelectDataModalOpen(false)}
        onUpdateChart={updateActiveChart}
      />
    </div>
  );
}
