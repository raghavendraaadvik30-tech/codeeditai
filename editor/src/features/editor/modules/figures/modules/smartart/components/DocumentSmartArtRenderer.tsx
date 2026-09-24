/**
 * --------------------------------------------------------
 * Module: Figures / SmartArt
 * Feature: In-Document SmartArt Interactive Renderer
 * Description:
 * Renders live interactive SmartArt graphics inside the document:
 * - Word-like selection outline with resize handles
 * - SmartArt Text Pane with real-time 2-way synchronization
 * - Contextual floating action toolbar (Add Shape, Colors, Style, Layout, Move Before/After, Promote/Demote, Right-to-Left, Alignment, Delete)
 * - Right-click context menu
 * - Real-time editable text on any node (click to edit)
 * - Dynamic SVG and CSS diagrams for all categories (List, Process, Cycle, Hierarchy, Matrix, Pyramid, Text Card)
 * --------------------------------------------------------
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Palette,
  Layout,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  X,
} from 'lucide-react';
import type { SmartArtModel, SmartArtNode, SmartArtStyle } from '@/features/editor/modules/figures/modules/smartart/types';
import {
  SMARTART_COLOR_SCHEMES,
  SMARTART_LAYOUTS,
  ALL_SMARTART_LAYOUTS,
} from '@/features/editor/modules/figures/modules/smartart/constants';
import { useSmartArtContext } from '@/features/editor/modules/figures/modules/smartart/context';

interface DocumentSmartArtRendererProps {
  smartArt: SmartArtModel;
  onUpdateSmartArt: (updated: SmartArtModel) => void;
  onDeleteSmartArt: () => void;
}

export const DocumentSmartArtRenderer: React.FC<DocumentSmartArtRendererProps> = ({
  smartArt,
  onUpdateSmartArt,
  onDeleteSmartArt,
}) => {
  const { activeSmartArtId, setActiveSmartArt } = useSmartArtContext();

  const isSelected = activeSmartArtId === smartArt.id;
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Text Pane visibility (defaults to open when selected)
  const [showTextPane, setShowTextPane] = useState(true);

  // Floating dropdowns
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showLayoutDropdown, setShowLayoutDropdown] = useState(false);
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);

  // Context menu state
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  // Resizing state
  const resizeStartRef = useRef<{ startX: number; startY: number; startW: number; startH: number; handle: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active color scheme
  const currentScheme = useMemo(() => {
    return (
      SMARTART_COLOR_SCHEMES.find((s) => s.id === smartArt.colorScheme) ||
      SMARTART_COLOR_SCHEMES[0]
    );
  }, [smartArt.colorScheme]);

  const colors = currentScheme.colors;
  const isRtl = smartArt.direction === 'rtl';

  // Category layouts for quick-switching
  const categoryLayouts = useMemo(() => {
    return SMARTART_LAYOUTS[smartArt.category] || [];
  }, [smartArt.category]);

  // Click outside to close floating dropdowns / context menu
  useEffect(() => {
    const handleWindowClick = () => {
      setShowColorDropdown(false);
      setShowLayoutDropdown(false);
      setShowStyleDropdown(false);
      setContextMenuPos(null);
    };
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  // Handle node text edit
  const handleNodeTextChange = (nodeId: string, newText: string) => {
    const updatedNodes = smartArt.nodes.map((n) =>
      n.id === nodeId ? { ...n, text: newText } : n
    );
    onUpdateSmartArt({
      ...smartArt,
      nodes: updatedNodes,
    });
  };

  const handleNodeSubtitleChange = (nodeId: string, newSub: string) => {
    const updatedNodes = smartArt.nodes.map((n) =>
      n.id === nodeId ? { ...n, subtitle: newSub } : n
    );
    onUpdateSmartArt({
      ...smartArt,
      nodes: updatedNodes,
    });
  };

  // Add shape
  const handleAddShape = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const count = smartArt.nodes.length + 1;
    const newNode: SmartArtNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: `Step ${count}`,
      subtitle: smartArt.nodes[0]?.subtitle ? `Description for step ${count}` : undefined,
      level: 1,
    };
    onUpdateSmartArt({
      ...smartArt,
      nodes: [...smartArt.nodes, newNode],
    });
    setSelectedNodeId(newNode.id);
  };

  // Remove shape
  const handleRemoveShape = (nodeIdToRemove?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (smartArt.nodes.length <= 1) return;
    const targetId = nodeIdToRemove || selectedNodeId || smartArt.nodes[smartArt.nodes.length - 1].id;
    const updatedNodes = smartArt.nodes.filter((n) => n.id !== targetId);
    onUpdateSmartArt({
      ...smartArt,
      nodes: updatedNodes,
    });
    setSelectedNodeId(updatedNodes[updatedNodes.length - 1]?.id || null);
  };

  // Move Before (reorder node up/left)
  const handleMoveBefore = (nodeId?: string) => {
    const targetId = nodeId || selectedNodeId || smartArt.nodes[smartArt.nodes.length - 1]?.id;
    if (!targetId) return;
    const idx = smartArt.nodes.findIndex((n) => n.id === targetId);
    if (idx <= 0) return;
    const newNodes = [...smartArt.nodes];
    const temp = newNodes[idx - 1];
    newNodes[idx - 1] = newNodes[idx];
    newNodes[idx] = temp;
    onUpdateSmartArt({
      ...smartArt,
      nodes: newNodes,
    });
  };

  // Move After (reorder node down/right)
  const handleMoveAfter = (nodeId?: string) => {
    const targetId = nodeId || selectedNodeId || smartArt.nodes[0]?.id;
    if (!targetId) return;
    const idx = smartArt.nodes.findIndex((n) => n.id === targetId);
    if (idx < 0 || idx >= smartArt.nodes.length - 1) return;
    const newNodes = [...smartArt.nodes];
    const temp = newNodes[idx + 1];
    newNodes[idx + 1] = newNodes[idx];
    newNodes[idx] = temp;
    onUpdateSmartArt({
      ...smartArt,
      nodes: newNodes,
    });
  };

  // Promote node (increase level/tier)
  const handlePromote = (nodeId?: string) => {
    const targetId = nodeId || selectedNodeId;
    if (!targetId) return;
    const newNodes = smartArt.nodes.map((n) =>
      n.id === targetId ? { ...n, level: Math.max(1, (n.level || 1) - 1) } : n
    );
    onUpdateSmartArt({ ...smartArt, nodes: newNodes });
  };

  // Demote node (decrease level/tier)
  const handleDemote = (nodeId?: string) => {
    const targetId = nodeId || selectedNodeId;
    if (!targetId) return;
    const newNodes = smartArt.nodes.map((n) =>
      n.id === targetId ? { ...n, level: Math.min(3, (n.level || 1) + 1) } : n
    );
    onUpdateSmartArt({ ...smartArt, nodes: newNodes });
  };

  // Toggle Right-to-Left / Left-to-Right direction
  const handleToggleDirection = () => {
    const nextDir = smartArt.direction === 'rtl' ? 'ltr' : 'rtl';
    onUpdateSmartArt({ ...smartArt, direction: nextDir });
  };

  // Change Color Scheme
  const handleSelectColorScheme = (schemeId: string) => {
    onUpdateSmartArt({
      ...smartArt,
      colorScheme: schemeId,
    });
    setShowColorDropdown(false);
  };

  // Change SmartArt Style
  const handleSelectStyle = (style: SmartArtStyle) => {
    onUpdateSmartArt({
      ...smartArt,
      style,
    });
    setShowStyleDropdown(false);
  };

  // Change Layout
  const handleSelectLayout = (layoutId: string) => {
    const layoutDef = ALL_SMARTART_LAYOUTS.find((l) => l.id === layoutId);
    if (!layoutDef) return;
    onUpdateSmartArt({
      ...smartArt,
      layout: layoutId,
      layoutId,
      category: layoutDef.category,
    });
    setShowLayoutDropdown(false);
  };

  // Alignment change
  const handleAlignment = (align: 'left' | 'center' | 'right') => {
    onUpdateSmartArt({
      ...smartArt,
      alignment: align,
    });
  };

  // Context Menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSmartArt(smartArt);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  // Resizing logic
  const handleResizePointerDown = (e: React.PointerEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: smartArt.width || 600,
      startH: smartArt.height || 360,
      handle,
    };

    const handlePointerMove = (moveEv: PointerEvent) => {
      if (!resizeStartRef.current) return;
      const { startX, startY, startW, startH, handle: h } = resizeStartRef.current;
      const dx = moveEv.clientX - startX;
      const dy = moveEv.clientY - startY;

      let newW = startW;
      let newH = startH;

      if (h.includes('e')) newW = Math.max(340, Math.min(1100, startW + dx));
      if (h.includes('w')) newW = Math.max(340, Math.min(1100, startW - dx));
      if (h.includes('s')) newH = Math.max(220, Math.min(850, startH + dy));
      if (h.includes('n')) newH = Math.max(220, Math.min(850, startH - dy));

      if (containerRef.current) {
        containerRef.current.style.width = `${newW}px`;
        containerRef.current.style.height = `${newH}px`;
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      if (resizeStartRef.current && containerRef.current) {
        const finalW = parseInt(containerRef.current.style.width, 10) || smartArt.width;
        const finalH = parseInt(containerRef.current.style.height, 10) || smartArt.height;
        onUpdateSmartArt({
          ...smartArt,
          width: finalW,
          height: finalH,
        });
      }
      resizeStartRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Node Click
  const handleNodeClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setActiveSmartArt(smartArt);
    setSelectedNodeId(nodeId);
  };

  // Helper for applying SmartArt style classes to nodes
  const getStyleClass = (bg: string) => {
    const s = smartArt.style || 'flat';
    if (s === 'gradient') {
      return {
        backgroundImage: `linear-gradient(135deg, ${bg}, ${bg}dd)`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
      };
    }
    if (s === 'glass') {
      return {
        backgroundColor: `${bg}dd`,
        backdropFilter: 'blur(8px)',
        border: `1px solid ${bg}`,
        boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
      };
    }
    if (s === 'outline') {
      return {
        backgroundColor: '#ffffff',
        border: `2.5px solid ${bg}`,
        color: bg,
      };
    }
    return {
      backgroundColor: bg,
    };
  };

  // -------------------------------------------------------------
  // RENDERING DIAGRAM BY CATEGORY & LAYOUT
  // -------------------------------------------------------------

  const renderLayoutContent = () => {
    const nodes = isRtl ? [...smartArt.nodes].reverse() : smartArt.nodes;
    const cat = smartArt.category;
    const layId = smartArt.layoutId || smartArt.layout;

    // =============================================================
    // PROCESS CATEGORY
    // =============================================================
    if (cat === 'Process') {
      // 1. STEP DOWN PROCESS
      if (layId === 'stepDownProcess') {
        return (
          <div className="flex flex-col justify-start w-full h-full p-4 overflow-y-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
            <div className="relative flex flex-col gap-3 w-full max-w-xl mx-auto">
              {nodes.map((node, i) => {
                const origIndex = smartArt.nodes.findIndex((n) => n.id === node.id);
                const bg = colors[origIndex % colors.length];
                const isNodeSelected = selectedNodeId === node.id;
                const styleObj = getStyleClass(bg);

                const stepIndent = isRtl
                  ? { paddingRight: `${i * 2.5}rem` }
                  : { paddingLeft: `${i * 2.5}rem` };

                return (
                  <div
                    key={node.id}
                    style={stepIndent}
                    className="relative w-full transition-all duration-200"
                  >
                    <div
                      onClick={(e) => handleNodeClick(e, node.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl text-white shadow-md cursor-pointer transition-all ${
                        isNodeSelected
                          ? 'ring-3 ring-blue-500 scale-[1.02] z-10'
                          : 'hover:scale-[1.01]'
                      } ${smartArt.style === 'outline' ? 'text-slate-800' : ''}`}
                      style={styleObj}
                    >
                      <div
                        className="w-7 h-7 shrink-0 rounded-lg bg-white/20 font-bold text-xs flex items-center justify-center shadow-inner"
                        style={smartArt.style === 'outline' ? { backgroundColor: bg, color: '#fff' } : {}}
                      >
                        {origIndex + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={node.text}
                          onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                          className={`w-full font-bold text-xs bg-transparent border-none focus:outline-none focus:bg-white/20 rounded px-1 ${
                            smartArt.style === 'outline' ? 'text-slate-900 dark:text-white' : 'text-white'
                          }`}
                        />
                        {node.subtitle !== undefined && (
                          <input
                            type="text"
                            value={node.subtitle}
                            onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                            className={`w-full text-[11px] bg-transparent border-none focus:outline-none focus:bg-white/20 rounded px-1 mt-0.5 ${
                              smartArt.style === 'outline' ? 'text-slate-600 dark:text-slate-300' : 'text-white/80'
                            }`}
                          />
                        )}
                      </div>
                    </div>

                    {i < nodes.length - 1 && (
                      <div
                        className={`h-3 w-0.5 bg-slate-300 dark:bg-slate-700 my-0.5 ${
                          isRtl ? 'mr-8' : 'ml-8'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      // 2. BASIC BLOCK PROCESS
      if (layId === 'basicBlockProcess') {
        return (
          <div className="flex items-center justify-center gap-2 w-full h-full p-4 overflow-x-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
            {nodes.map((node, i) => {
              const origIndex = smartArt.nodes.findIndex((n) => n.id === node.id);
              const bg = colors[origIndex % colors.length];
              const isNodeSelected = selectedNodeId === node.id;
              const styleObj = getStyleClass(bg);

              return (
                <React.Fragment key={node.id}>
                  <div
                    onClick={(e) => handleNodeClick(e, node.id)}
                    className={`flex-1 min-w-[120px] max-w-[200px] h-28 flex flex-col justify-center items-center p-3 text-white shadow-md transition-transform cursor-pointer ${
                      isNodeSelected ? 'ring-3 ring-blue-500 scale-105 z-10' : 'hover:scale-102'
                    }`}
                    style={styleObj}
                  >
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                        smartArt.style === 'outline' ? 'text-slate-500' : 'opacity-80'
                      }`}
                    >
                      Step {origIndex + 1}
                    </span>
                    <input
                      type="text"
                      value={node.text}
                      onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                      className={`w-full text-center bg-transparent border-none font-bold text-xs focus:outline-none focus:bg-white/20 rounded px-1 ${
                        smartArt.style === 'outline' ? 'text-slate-900 dark:text-white' : 'text-white'
                      }`}
                    />
                    {node.subtitle !== undefined && (
                      <input
                        type="text"
                        value={node.subtitle}
                        onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                        className={`w-full text-center bg-transparent border-none text-[11px] mt-1 focus:outline-none focus:bg-white/20 rounded px-1 ${
                          smartArt.style === 'outline' ? 'text-slate-600 dark:text-slate-300' : 'text-white/80'
                        }`}
                      />
                    )}
                  </div>

                  {i < nodes.length - 1 && (
                    <div className="shrink-0 text-slate-400 dark:text-slate-600 px-0.5">
                      {isRtl ? (
                        <ArrowLeft className="w-5 h-5" />
                      ) : (
                        <ArrowRight className="w-5 h-5" />
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        );
      }

      // 3. CHEVRON PROCESS
      if (layId === 'chevronProcess') {
        return (
          <div className="flex items-center justify-center gap-1 w-full h-full p-4 overflow-x-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
            {nodes.map((node, i) => {
              const origIndex = smartArt.nodes.findIndex((n) => n.id === node.id);
              const bg = colors[origIndex % colors.length];
              const isNodeSelected = selectedNodeId === node.id;
              const clipPathStyle = isRtl
                ? 'polygon(18% 0%, 100% 0%, 100% 100%, 18% 100%, 0% 50%)'
                : 'polygon(0% 0%, 82% 0%, 100% 50%, 82% 100%, 0% 100%, 18% 50%)';

              return (
                <div
                  key={node.id}
                  onClick={(e) => handleNodeClick(e, node.id)}
                  className={`flex-1 min-w-[120px] max-w-[200px] h-28 flex flex-col justify-center items-center p-3 text-white transition-transform cursor-pointer shadow-md ${
                    isNodeSelected ? 'ring-2 ring-blue-600 scale-105 z-10' : 'hover:brightness-105'
                  }`}
                  style={{
                    backgroundColor: bg,
                    clipPath: clipPathStyle,
                    paddingLeft: i > 0 && !isRtl ? '1.5rem' : '1rem',
                    paddingRight: i > 0 && isRtl ? '1.5rem' : '1rem',
                  }}
                >
                  <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1">
                    Step {origIndex + 1}
                  </span>
                  <input
                    type="text"
                    value={node.text}
                    onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                    className="w-full text-center bg-transparent border-none text-white font-bold text-xs focus:outline-none focus:bg-white/20 rounded px-1"
                  />
                  {node.subtitle !== undefined && (
                    <input
                      type="text"
                      value={node.subtitle}
                      onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                      className="w-full text-center bg-transparent border-none text-white/80 text-[11px] mt-1 focus:outline-none focus:bg-white/20 rounded px-1"
                    />
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      // 4. CONTINUOUS PROCESS
      if (layId === 'continuousProcess') {
        return (
          <div className="relative flex items-center justify-center gap-3 w-full h-full p-4 overflow-x-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
            <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 rounded-full" />

            {nodes.map((node) => {
              const origIndex = smartArt.nodes.findIndex((n) => n.id === node.id);
              const bg = colors[origIndex % colors.length];
              const isNodeSelected = selectedNodeId === node.id;
              const styleObj = getStyleClass(bg);

              return (
                <div
                  key={node.id}
                  onClick={(e) => handleNodeClick(e, node.id)}
                  className={`relative z-10 flex-1 min-w-[110px] max-w-[180px] p-3 rounded-xl text-white shadow-md transition-all cursor-pointer ${
                    isNodeSelected ? 'ring-3 ring-blue-500 scale-105' : 'hover:scale-102'
                  }`}
                  style={styleObj}
                >
                  <div
                    className="w-6 h-6 rounded-full bg-white/25 text-white font-bold text-[11px] flex items-center justify-center mb-1.5"
                    style={smartArt.style === 'outline' ? { backgroundColor: bg } : {}}
                  >
                    {origIndex + 1}
                  </div>
                  <input
                    type="text"
                    value={node.text}
                    onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                    className={`w-full font-bold text-xs bg-transparent border-none focus:outline-none focus:bg-white/20 rounded px-1 ${
                      smartArt.style === 'outline' ? 'text-slate-900 dark:text-white' : 'text-white'
                    }`}
                  />
                  {node.subtitle !== undefined && (
                    <input
                      type="text"
                      value={node.subtitle}
                      onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                      className={`w-full text-[11px] bg-transparent border-none focus:outline-none focus:bg-white/20 rounded px-1 mt-0.5 ${
                        smartArt.style === 'outline' ? 'text-slate-600 dark:text-slate-300' : 'text-white/80'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      // 5. VERTICAL PROCESS
      if (layId === 'verticalProcess') {
        return (
          <div className="flex flex-col items-center justify-start gap-2 w-full h-full p-4 overflow-y-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
            {nodes.map((node, i) => {
              const origIndex = smartArt.nodes.findIndex((n) => n.id === node.id);
              const bg = colors[origIndex % colors.length];
              const isNodeSelected = selectedNodeId === node.id;
              const styleObj = getStyleClass(bg);

              return (
                <React.Fragment key={node.id}>
                  <div
                    onClick={(e) => handleNodeClick(e, node.id)}
                    className={`w-full max-w-md p-3 rounded-xl text-white shadow-sm flex items-center gap-3 transition-all cursor-pointer ${
                      isNodeSelected ? 'ring-3 ring-blue-500 scale-[1.01]' : 'hover:scale-[1.005]'
                    }`}
                    style={styleObj}
                  >
                    <div
                      className="w-7 h-7 shrink-0 rounded-lg bg-white/25 text-white font-bold text-xs flex items-center justify-center"
                      style={smartArt.style === 'outline' ? { backgroundColor: bg } : {}}
                    >
                      {origIndex + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={node.text}
                        onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                        className={`w-full font-bold text-xs bg-transparent border-none focus:outline-none focus:bg-white/20 rounded px-1 ${
                          smartArt.style === 'outline' ? 'text-slate-900 dark:text-white' : 'text-white'
                        }`}
                      />
                      {node.subtitle !== undefined && (
                        <input
                          type="text"
                          value={node.subtitle}
                          onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                          className={`w-full text-[11px] bg-transparent border-none focus:outline-none focus:bg-white/20 rounded px-1 mt-0.5 ${
                            smartArt.style === 'outline' ? 'text-slate-600 dark:text-slate-300' : 'text-white/80'
                          }`}
                        />
                      )}
                    </div>
                  </div>

                  {i < nodes.length - 1 && (
                    <div className="w-0.5 h-3 bg-slate-300 dark:bg-slate-700" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        );
      }

      // 6. ALTERNATING PROCESS
      if (layId === 'alternatingProcess') {
        return (
          <div className="relative w-full h-full p-4 flex items-center justify-center">
            <div className="absolute left-6 right-6 top-1/2 h-1 bg-slate-300 dark:bg-slate-700 -translate-y-1/2 rounded-full" />

            <div className="flex items-center justify-around w-full z-10 gap-2 overflow-x-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
              {nodes.map((node, i) => {
                const origIndex = smartArt.nodes.findIndex((n) => n.id === node.id);
                const bg = colors[origIndex % colors.length];
                const isNodeSelected = selectedNodeId === node.id;
                const isTop = i % 2 === 0;
                const styleObj = getStyleClass(bg);

                return (
                  <div
                    key={node.id}
                    className={`flex flex-col items-center flex-1 max-w-[150px] ${
                      isTop ? '-translate-y-6' : 'translate-y-6'
                    }`}
                  >
                    <div
                      onClick={(e) => handleNodeClick(e, node.id)}
                      className={`w-full p-2.5 rounded-xl text-white shadow-md text-center transition-all cursor-pointer ${
                        isNodeSelected ? 'ring-3 ring-blue-500 scale-105' : 'hover:scale-102'
                      }`}
                      style={styleObj}
                    >
                      <input
                        type="text"
                        value={node.text}
                        onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                        className={`w-full text-center font-bold text-xs bg-transparent border-none focus:outline-none focus:bg-white/20 rounded px-1 ${
                          smartArt.style === 'outline' ? 'text-slate-900 dark:text-white' : 'text-white'
                        }`}
                      />
                      {node.subtitle !== undefined && (
                        <input
                          type="text"
                          value={node.subtitle}
                          onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                          className={`w-full text-center text-[10px] bg-transparent border-none focus:outline-none focus:bg-white/20 rounded px-1 mt-0.5 ${
                            smartArt.style === 'outline' ? 'text-slate-600 dark:text-slate-300' : 'text-white/80'
                          }`}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      // 7. CIRCLE PROCESS
      if (layId === 'circleProcess') {
        return (
          <div className="relative flex items-center justify-center gap-4 w-full h-full p-4 overflow-x-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
            <div className="absolute left-12 right-12 top-1/2 h-1 bg-slate-300 dark:bg-slate-700 -translate-y-1/2 rounded-full" />

            {nodes.map((node) => {
              const origIndex = smartArt.nodes.findIndex((n) => n.id === node.id);
              const bg = colors[origIndex % colors.length];
              const isNodeSelected = selectedNodeId === node.id;

              return (
                <div key={node.id} className="relative z-10 flex flex-col items-center flex-1 max-w-[150px]">
                  <div
                    onClick={(e) => handleNodeClick(e, node.id)}
                    className={`w-16 h-16 rounded-full flex flex-col items-center justify-center text-white shadow-md transition-all cursor-pointer ${
                      isNodeSelected ? 'ring-3 ring-blue-500 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: bg }}
                  >
                    <span className="text-[10px] font-bold opacity-80 uppercase">
                      {origIndex + 1}
                    </span>
                  </div>

                  <div className="mt-2 w-full text-center">
                    <input
                      type="text"
                      value={node.text}
                      onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                      className="w-full text-center font-bold text-xs text-slate-800 dark:text-slate-100 bg-transparent border-none focus:outline-none focus:bg-slate-100 dark:focus:bg-slate-800 rounded px-1"
                    />
                    {node.subtitle !== undefined && (
                      <input
                        type="text"
                        value={node.subtitle}
                        onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                        className="w-full text-center text-[11px] text-slate-500 dark:text-slate-400 bg-transparent border-none focus:outline-none focus:bg-slate-100 dark:focus:bg-slate-800 rounded px-1"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      // DEFAULT BASIC PROCESS
      return (
        <div className="flex items-center justify-center gap-3 w-full h-full p-4 overflow-x-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
          {nodes.map((node, i) => {
            const origIndex = smartArt.nodes.findIndex((n) => n.id === node.id);
            const bg = colors[origIndex % colors.length];
            const isNodeSelected = selectedNodeId === node.id;
            const styleObj = getStyleClass(bg);

            return (
              <React.Fragment key={node.id}>
                <div
                  onClick={(e) => handleNodeClick(e, node.id)}
                  className={`flex-1 min-w-[120px] max-w-[200px] p-3 rounded-xl text-white shadow-md transition-all cursor-pointer ${
                    isNodeSelected ? 'ring-3 ring-blue-500 scale-105 z-10' : 'hover:scale-102'
                  }`}
                  style={styleObj}
                >
                  <div
                    className="w-6 h-6 rounded-md bg-white/25 text-white font-bold text-xs flex items-center justify-center mb-2"
                    style={smartArt.style === 'outline' ? { backgroundColor: bg } : {}}
                  >
                    {origIndex + 1}
                  </div>
                  <input
                    type="text"
                    value={node.text}
                    onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                    className={`w-full font-bold text-xs bg-transparent border-none focus:outline-none focus:bg-white/20 rounded px-1 ${
                      smartArt.style === 'outline' ? 'text-slate-900 dark:text-white' : 'text-white'
                    }`}
                  />
                  {node.subtitle !== undefined && (
                    <input
                      type="text"
                      value={node.subtitle}
                      onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                      className={`w-full text-[11px] bg-transparent border-none focus:outline-none focus:bg-white/20 rounded px-1 mt-1 ${
                        smartArt.style === 'outline' ? 'text-slate-600 dark:text-slate-300' : 'text-white/80'
                      }`}
                    />
                  )}
                </div>

                {i < nodes.length - 1 && (
                  <div className="shrink-0 text-slate-400 dark:text-slate-600 px-0.5">
                    {isRtl ? (
                      <ArrowLeft className="w-5 h-5" />
                    ) : (
                      <ArrowRight className="w-5 h-5" />
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      );
    }

    // 1. LIST CATEGORY
    if (cat === 'List') {
      if (layId === 'chevronList') {
        return (
          <div className="flex items-center justify-center gap-2 w-full h-full p-4 overflow-x-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
            {nodes.map((node, i) => {
              const bg = colors[i % colors.length];
              const isNodeSelected = selectedNodeId === node.id;
              return (
                <div
                  key={node.id}
                  onClick={(e) => handleNodeClick(e, node.id)}
                  className={`relative flex-1 min-w-[120px] max-w-[200px] h-32 flex flex-col justify-center items-center p-3 text-white transition-transform cursor-pointer shadow-md ${
                    isNodeSelected ? 'ring-2 ring-blue-600 scale-[1.02]' : 'hover:brightness-105'
                  }`}
                  style={{
                    backgroundColor: bg,
                    clipPath: 'polygon(0% 0%, 82% 0%, 100% 50%, 82% 100%, 0% 100%, 18% 50%)',
                    paddingLeft: i > 0 ? '1.5rem' : '1rem',
                  }}
                >
                  <span className="text-[11px] font-bold opacity-80 mb-1 uppercase tracking-wider">
                    Step {i + 1}
                  </span>
                  <input
                    type="text"
                    value={node.text}
                    onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                    className="w-full text-center bg-transparent border-none text-white font-bold text-xs focus:outline-none focus:bg-white/20 rounded px-1"
                  />
                  {node.subtitle !== undefined && (
                    <input
                      type="text"
                      value={node.subtitle}
                      onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                      className="w-full text-center bg-transparent border-none text-white/80 text-[11px] mt-1 focus:outline-none focus:bg-white/20 rounded px-1"
                    />
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      if (layId === 'horizontalList') {
        return (
          <div className="flex items-stretch justify-center gap-3 w-full h-full p-4 overflow-x-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
            {nodes.map((node, i) => {
              const bg = colors[i % colors.length];
              const isNodeSelected = selectedNodeId === node.id;
              return (
                <div
                  key={node.id}
                  onClick={(e) => handleNodeClick(e, node.id)}
                  className={`flex-1 min-w-[120px] max-w-[220px] flex flex-col rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden transition-all dark:bg-slate-900 dark:border-slate-800 ${
                    isNodeSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:border-slate-300'
                  }`}
                >
                  <div
                    className="p-2.5 text-white font-semibold text-xs text-center flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: bg }}
                  >
                    <span className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center text-[10px]">
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={node.text}
                      onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                      className="w-full text-center bg-transparent border-none text-white font-bold text-xs focus:outline-none focus:bg-white/20 rounded"
                    />
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-center">
                    <textarea
                      rows={2}
                      value={node.subtitle || 'Add details...'}
                      onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                      className="w-full text-xs text-slate-600 dark:text-slate-300 bg-transparent border-none resize-none focus:outline-none focus:bg-slate-50 dark:focus:bg-slate-800 rounded p-1 text-center"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      // Default List: vertical / basic list cards
      return (
        <div className="flex flex-col justify-start gap-2.5 w-full h-full p-4 overflow-y-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
          {nodes.map((node, i) => {
            const bg = colors[i % colors.length];
            const isNodeSelected = selectedNodeId === node.id;
            return (
              <div
                key={node.id}
                onClick={(e) => handleNodeClick(e, node.id)}
                className={`flex items-center gap-3 p-2.5 rounded-lg border bg-white dark:bg-slate-900 transition-all ${
                  isNodeSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div
                  className="w-8 h-8 shrink-0 rounded-md text-white font-bold flex items-center justify-center text-xs shadow-xs"
                  style={{ backgroundColor: bg }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={node.text}
                    onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                    className="w-full font-semibold text-xs text-slate-800 dark:text-slate-100 bg-transparent border-none focus:outline-none focus:bg-blue-50 dark:focus:bg-slate-800 rounded px-1"
                  />
                  {node.subtitle !== undefined && (
                    <input
                      type="text"
                      value={node.subtitle}
                      onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                      className="w-full text-[11px] text-slate-500 dark:text-slate-400 bg-transparent border-none focus:outline-none focus:bg-blue-50 dark:focus:bg-slate-800 rounded px-1 mt-0.5"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // 2. CYCLE CATEGORY
    if (cat === 'Cycle') {
      const radius = 110;
      const count = nodes.length;
      return (
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <div className="absolute w-24 h-24 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center opacity-60 pointer-events-none">
            <Sparkles className="w-5 h-5 text-slate-400" />
          </div>

          {nodes.map((node, i) => {
            const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const bg = colors[i % colors.length];
            const isNodeSelected = selectedNodeId === node.id;

            return (
              <div
                key={node.id}
                onClick={(e) => handleNodeClick(e, node.id)}
                className={`absolute w-28 h-20 rounded-xl flex flex-col items-center justify-center p-2 text-white shadow-md transition-transform cursor-pointer ${
                  isNodeSelected ? 'ring-3 ring-blue-500 scale-105 z-10' : 'hover:scale-105'
                }`}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                  backgroundColor: bg,
                }}
              >
                <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={node.text}
                  onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                  className="w-full text-center bg-transparent border-none text-white font-bold text-xs focus:outline-none focus:bg-white/20 rounded px-1 truncate"
                />
              </div>
            );
          })}
        </div>
      );
    }

    // 3. HIERARCHY CATEGORY
    if (cat === 'Hierarchy') {
      const rootNode = nodes[0];
      const childrenNodes = nodes.slice(1);

      return (
        <div className="flex flex-col items-center justify-center gap-6 w-full h-full p-4">
          {rootNode && (
            <div className="relative flex flex-col items-center">
              <div
                onClick={(e) => handleNodeClick(e, rootNode.id)}
                className={`w-44 p-2.5 rounded-lg text-white shadow-md text-center cursor-pointer transition-all ${
                  selectedNodeId === rootNode.id ? 'ring-3 ring-blue-500 scale-105' : ''
                }`}
                style={{ backgroundColor: colors[0] }}
              >
                <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider block">
                  Executive / Lead
                </span>
                <input
                  type="text"
                  value={rootNode.text}
                  onChange={(e) => handleNodeTextChange(rootNode.id, e.target.value)}
                  className="w-full text-center bg-transparent border-none text-white font-bold text-xs focus:outline-none focus:bg-white/20 rounded"
                />
              </div>
              {childrenNodes.length > 0 && (
                <div className="w-0.5 h-6 bg-slate-400 dark:bg-slate-600" />
              )}
            </div>
          )}

          {childrenNodes.length > 0 && (
            <div className="relative flex items-center justify-center gap-3 w-full">
              <div
                className="absolute top-0 h-0.5 bg-slate-400 dark:bg-slate-600"
                style={{
                  left: `${(1 / (childrenNodes.length + 1)) * 50}%`,
                  right: `${(1 / (childrenNodes.length + 1)) * 50}%`,
                }}
              />

              {childrenNodes.map((child, idx) => {
                const bg = colors[(idx + 1) % colors.length];
                const isNodeSelected = selectedNodeId === child.id;
                return (
                  <div key={child.id} className="relative flex flex-col items-center flex-1 max-w-[160px]">
                    <div className="w-0.5 h-4 bg-slate-400 dark:bg-slate-600" />
                    <div
                      onClick={(e) => handleNodeClick(e, child.id)}
                      className={`w-full p-2.5 rounded-lg text-white shadow-xs text-center cursor-pointer transition-all ${
                        isNodeSelected ? 'ring-3 ring-blue-500 scale-105' : 'hover:scale-[1.02]'
                      }`}
                      style={{ backgroundColor: bg }}
                    >
                      <input
                        type="text"
                        value={child.text}
                        onChange={(e) => handleNodeTextChange(child.id, e.target.value)}
                        className="w-full text-center bg-transparent border-none text-white font-bold text-xs focus:outline-none focus:bg-white/20 rounded truncate"
                      />
                      {child.subtitle !== undefined && (
                        <input
                          type="text"
                          value={child.subtitle}
                          onChange={(e) => handleNodeSubtitleChange(child.id, e.target.value)}
                          className="w-full text-center bg-transparent border-none text-white/80 text-[10px] mt-0.5 focus:outline-none focus:bg-white/20 rounded truncate"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // 4. MATRIX CATEGORY
    if (cat === 'Matrix') {
      return (
        <div className="w-full h-full p-4 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-3 w-full max-w-lg aspect-square max-h-[320px]">
            {nodes.slice(0, 4).map((node, i) => {
              const bg = colors[i % colors.length];
              const isNodeSelected = selectedNodeId === node.id;
              return (
                <div
                  key={node.id}
                  onClick={(e) => handleNodeClick(e, node.id)}
                  className={`rounded-xl p-3.5 flex flex-col justify-between shadow-xs border transition-all cursor-pointer ${
                    isNodeSelected ? 'ring-3 ring-blue-500 shadow-md' : 'hover:scale-[1.01]'
                  }`}
                  style={{
                    backgroundColor: `${bg}15`,
                    borderColor: `${bg}50`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider"
                      style={{ backgroundColor: bg }}
                    >
                      Q{i + 1}
                    </span>
                  </div>
                  <div className="my-auto">
                    <input
                      type="text"
                      value={node.text}
                      onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                      className="w-full font-bold text-xs text-slate-800 dark:text-slate-100 bg-transparent border-none focus:outline-none focus:bg-white/40 rounded p-1"
                    />
                    <textarea
                      rows={2}
                      value={node.subtitle || 'Quadrant details...'}
                      onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                      className="w-full text-[11px] text-slate-600 dark:text-slate-400 bg-transparent border-none resize-none focus:outline-none focus:bg-white/40 rounded p-1 mt-1"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // 5. PYRAMID CATEGORY
    if (cat === 'Pyramid') {
      const reversed = [...nodes].reverse();
      const count = reversed.length;

      return (
        <div className="flex flex-col items-center justify-center gap-2 w-full h-full p-4">
          {reversed.map((node, i) => {
            const originalIndex = nodes.findIndex((n) => n.id === node.id);
            const bg = colors[originalIndex % colors.length];
            const isNodeSelected = selectedNodeId === node.id;
            const widthPercent = 35 + (i / Math.max(1, count - 1)) * 60;

            return (
              <div
                key={node.id}
                onClick={(e) => handleNodeClick(e, node.id)}
                className={`h-12 rounded-lg text-white shadow-sm flex items-center justify-center px-4 transition-all cursor-pointer ${
                  isNodeSelected ? 'ring-3 ring-blue-500 scale-[1.02] z-10' : 'hover:brightness-105'
                }`}
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: bg,
                }}
              >
                <span className="text-[10px] font-bold opacity-80 mr-2 uppercase tracking-wider">
                  L{count - i}
                </span>
                <input
                  type="text"
                  value={node.text}
                  onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                  className="w-full text-center bg-transparent border-none text-white font-bold text-xs focus:outline-none focus:bg-white/20 rounded px-1"
                />
              </div>
            );
          })}
        </div>
      );
    }

    // 6. TEXT CARD CATEGORY (Default)
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full h-full p-4 overflow-y-auto overscroll-contain items-start" onWheel={(e) => e.stopPropagation()}>
        {nodes.map((node, i) => {
          const bg = colors[i % colors.length];
          const isNodeSelected = selectedNodeId === node.id;
          return (
            <div
              key={node.id}
              onClick={(e) => handleNodeClick(e, node.id)}
              className={`rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex flex-col justify-between transition-all dark:bg-slate-900 dark:border-slate-800 ${
                isNodeSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:border-slate-300'
              }`}
              style={{ borderTop: `4px solid ${bg}` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="w-6 h-6 rounded-full text-white font-bold text-[10px] flex items-center justify-center"
                  style={{ backgroundColor: bg }}
                >
                  {i + 1}
                </span>
              </div>
              <input
                type="text"
                value={node.text}
                onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                className="w-full font-bold text-xs text-slate-800 dark:text-slate-100 bg-transparent border-none focus:outline-none focus:bg-slate-100 dark:focus:bg-slate-800 rounded p-1"
              />
              <textarea
                rows={2}
                value={node.subtitle || 'Card summary statement...'}
                onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                className="w-full text-[11px] text-slate-500 dark:text-slate-400 bg-transparent border-none resize-none focus:outline-none focus:bg-slate-100 dark:focus:bg-slate-800 rounded p-1 mt-1"
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      onClick={(e) => {
        e.stopPropagation();
        setActiveSmartArt(smartArt);
      }}
      onContextMenu={handleContextMenu}
      className={`relative group select-none rounded-xl flex transition-all duration-150 ${
        isSelected
          ? 'ring-2 ring-[#0078d4] shadow-xl'
          : 'hover:ring-1 hover:ring-slate-300'
      }`}
      style={{
        width: `${smartArt.width || 640}px`,
        height: `${smartArt.height || 360}px`,
        backgroundColor: smartArt.backgroundColor || '#ffffff',
      }}
    >
      {/* --------------------------------------------------------
          CONTEXTUAL FLOATING ACTION TOOLBAR (Visible when selected)
         -------------------------------------------------------- */}
      {isSelected && (
        <div
          className="absolute -top-11 left-0 z-40 flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 shadow-xl dark:bg-[#111D29] dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150 flex-wrap"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Add Shape */}
          <button
            type="button"
            onClick={handleAddShape}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-blue-600 dark:text-blue-400 transition-colors"
            title="Add Process Item"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Step</span>
          </button>

          {/* Remove Shape */}
          <button
            type="button"
            onClick={(e) => handleRemoveShape(undefined, e)}
            disabled={smartArt.nodes.length <= 1}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-600 dark:text-slate-300 disabled:opacity-40 transition-colors"
            title="Remove Selected Step"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />

          {/* Text Pane Toggle */}
          <button
            type="button"
            onClick={() => setShowTextPane((prev) => !prev)}
            className={`flex items-center gap-1 px-2 py-1 rounded font-medium transition-colors ${
              showTextPane
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
            title="Toggle Text Pane"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Text Pane</span>
          </button>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />

          {/* Move Before / Move After */}
          <button
            type="button"
            onClick={() => handleMoveBefore()}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Move Selected Step Up / Left (Move Before)"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => handleMoveAfter()}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Move Selected Step Down / Right (Move After)"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          {/* Promote / Demote */}
          <button
            type="button"
            onClick={() => handlePromote()}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Promote Step Level"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => handleDemote()}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Demote Step Level"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Right to Left Direction Toggle */}
          <button
            type="button"
            onClick={handleToggleDirection}
            className={`p-1 rounded font-medium transition-colors ${
              isRtl
                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
            title="Toggle Right to Left Direction (RTL / LTR)"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />

          {/* Change Colors Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowColorDropdown((prev) => !prev);
                setShowLayoutDropdown(false);
                setShowStyleDropdown(false);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
              title="Change Color Palette"
            >
              <Palette className="w-3.5 h-3.5 text-amber-500" />
              <span>Colors</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showColorDropdown && (
              <div className="absolute top-full left-0 mt-1 w-52 p-1.5 bg-white border border-slate-200 rounded-lg shadow-2xl dark:bg-[#111D29] dark:border-slate-800 z-50 animate-in fade-in zoom-in-95">
                <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Color Themes
                </span>
                {SMARTART_COLOR_SCHEMES.map((scheme) => (
                  <button
                    key={scheme.id}
                    type="button"
                    onClick={() => handleSelectColorScheme(scheme.id)}
                    className="w-full flex items-center justify-between p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                  >
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                      {scheme.name}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {scheme.colors.slice(0, 4).map((c, i) => (
                        <div
                          key={i}
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SmartArt Styles Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowStyleDropdown((prev) => !prev);
                setShowColorDropdown(false);
                setShowLayoutDropdown(false);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
              title="Change SmartArt Style"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
              <span>Styles</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showStyleDropdown && (
              <div className="absolute top-full left-0 mt-1 w-44 p-1.5 bg-white border border-slate-200 rounded-lg shadow-2xl dark:bg-[#111D29] dark:border-slate-800 z-50 animate-in fade-in zoom-in-95">
                <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  SmartArt Style
                </span>
                {(['flat', 'gradient', 'glass', 'outline'] as SmartArtStyle[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleSelectStyle(st)}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs capitalize hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      smartArt.style === st ? 'font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/50' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {st} Style
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Change Layout Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowLayoutDropdown((prev) => !prev);
                setShowColorDropdown(false);
                setShowStyleDropdown(false);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
              title="Change Process Layout"
            >
              <Layout className="w-3.5 h-3.5 text-emerald-500" />
              <span>Layout</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showLayoutDropdown && (
              <div className="absolute top-full left-0 mt-1 w-56 max-h-60 overflow-y-auto p-1.5 bg-white border border-slate-200 rounded-lg shadow-2xl dark:bg-[#111D29] dark:border-slate-800 z-50 animate-in fade-in zoom-in-95">
                <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {smartArt.category} Layouts
                </span>
                {categoryLayouts.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => handleSelectLayout(l.id)}
                    className={`w-full flex items-center justify-between p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors ${
                      (smartArt.layoutId || smartArt.layout) === l.id ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 font-semibold' : ''
                    }`}
                  >
                    <span className="text-xs">{l.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />

          {/* Alignment */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => handleAlignment('left')}
              className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${
                smartArt.alignment === 'left' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600' : ''
              }`}
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleAlignment('center')}
              className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${
                smartArt.alignment === 'center' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600' : ''
              }`}
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleAlignment('right')}
              className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${
                smartArt.alignment === 'right' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600' : ''
              }`}
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />

          {/* Delete */}
          <button
            type="button"
            onClick={onDeleteSmartArt}
            className="p-1 rounded hover:bg-red-50 text-red-600 dark:hover:bg-red-950/50 transition-colors"
            title="Delete SmartArt Graphic"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* --------------------------------------------------------
          SMARTART TEXT PANE (Word-style Side Panel)
         -------------------------------------------------------- */}
      {isSelected && showTextPane && (
        <div
          className="w-56 shrink-0 h-full border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c1622] rounded-l-xl p-3 flex flex-col justify-between z-20 shadow-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="shrink-0 flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Text</span>
              </span>
              <button
                type="button"
                onClick={() => setShowTextPane(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Close Text Pane"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div
              onWheel={(e) => e.stopPropagation()}
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 space-y-1.5"
              style={{
                scrollbarWidth: 'thin',
              }}
            >
              {smartArt.nodes.map((node, i) => {
                const isNodeSelected = selectedNodeId === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`flex items-center gap-1.5 p-1 rounded-md border transition-all ${
                      isNodeSelected
                        ? 'border-blue-500 bg-white shadow-xs dark:bg-slate-900'
                        : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="w-6 text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0 select-none">
                      {i + 1}.
                    </span>
                    <input
                      type="text"
                      value={node.text}
                      onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                      placeholder="Type text..."
                      className="w-full text-xs text-slate-800 dark:text-slate-100 bg-transparent border-none focus:outline-none"
                    />
                    {smartArt.nodes.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleRemoveShape(node.id, e)}
                        className="text-slate-300 hover:text-red-500 p-0.5 rounded transition-opacity"
                        title="Delete Step"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddShape}
            className="shrink-0 mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg border border-dashed border-slate-300 text-slate-600 hover:bg-white hover:border-slate-400 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Add Item</span>
          </button>
        </div>
      )}

      {/* --------------------------------------------------------
          LIVE DIAGRAM GRAPHIC CONTAINER
         -------------------------------------------------------- */}
      <div className="flex-1 min-w-0 h-full overflow-hidden rounded-r-xl">
        {renderLayoutContent()}
      </div>

      {/* --------------------------------------------------------
          RESIZE HANDLES (8 handles matching Office behavior)
         -------------------------------------------------------- */}
      {isSelected && (
        <>
          {/* NW */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'nw')}
            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#0078d4] rounded-xs cursor-nwse-resize z-30 shadow-xs"
          />
          {/* N */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'n')}
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-[#0078d4] rounded-xs cursor-ns-resize z-30 shadow-xs"
          />
          {/* NE */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'ne')}
            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#0078d4] rounded-xs cursor-nesw-resize z-30 shadow-xs"
          />
          {/* E */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'e')}
            className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border-2 border-[#0078d4] rounded-xs cursor-ew-resize z-30 shadow-xs"
          />
          {/* SE */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'se')}
            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#0078d4] rounded-xs cursor-nwse-resize z-30 shadow-xs"
          />
          {/* S */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 's')}
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-[#0078d4] rounded-xs cursor-ns-resize z-30 shadow-xs"
          />
          {/* SW */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'sw')}
            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#0078d4] rounded-xs cursor-nesw-resize z-30 shadow-xs"
          />
          {/* W */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'w')}
            className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white border-2 border-[#0078d4] rounded-xs cursor-ew-resize z-30 shadow-xs"
          />
        </>
      )}

      {/* --------------------------------------------------------
          RIGHT-CLICK CONTEXT MENU
         -------------------------------------------------------- */}
      {contextMenuPos && (
        <div
          className="fixed z-50 w-56 bg-white border border-slate-200 rounded-lg shadow-2xl p-1.5 text-xs dark:bg-[#111D29] dark:border-slate-800 animate-in fade-in zoom-in-95"
          style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              handleAddShape();
              setContextMenuPos(null);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-100"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Add Step</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleRemoveShape();
              setContextMenuPos(null);
            }}
            disabled={smartArt.nodes.length <= 1}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-100 disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4 text-slate-500" />
            <span>Remove Step</span>
          </button>

          <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />

          <button
            type="button"
            onClick={() => {
              handleMoveBefore();
              setContextMenuPos(null);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-100"
          >
            <ArrowUp className="w-4 h-4 text-blue-600" />
            <span>Move Before</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleMoveAfter();
              setContextMenuPos(null);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-100"
          >
            <ArrowDown className="w-4 h-4 text-blue-600" />
            <span>Move After</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleToggleDirection();
              setContextMenuPos(null);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-100"
          >
            <ArrowLeftRight className="w-4 h-4 text-amber-500" />
            <span>Right to Left</span>
          </button>

          <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />

          <button
            type="button"
            onClick={() => {
              setShowColorDropdown(true);
              setContextMenuPos(null);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-100"
          >
            <Palette className="w-4 h-4 text-amber-500" />
            <span>Change Colors...</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowLayoutDropdown(true);
              setContextMenuPos(null);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-100"
          >
            <Layout className="w-4 h-4 text-emerald-500" />
            <span>Change Layout...</span>
          </button>

          <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />

          <button
            type="button"
            onClick={() => {
              onDeleteSmartArt();
              setContextMenuPos(null);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-red-50 text-red-600 dark:hover:bg-red-950/50 font-medium"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
            <span>Delete SmartArt</span>
          </button>
        </div>
      )}
    </div>
  );
};
