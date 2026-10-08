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

import React, { useState, useRef, useEffect, useMemo, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Check,
  Quote,
  TrendingUp,
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

  // Resizing state
  const resizeStartRef = useRef<{ startX: number; startY: number; startW: number; startH: number; handle: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Floating contextual toolbar state & ref
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number; isBelow: boolean } | null>(null);

  const updateToolbarPosition = useCallback(() => {
    if (!isSelected || !containerRef.current) {
      setToolbarPos(null);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      return;
    }

    const toolbarEl = toolbarRef.current;
    const toolbarWidth = toolbarEl?.offsetWidth || 700;
    const toolbarHeight = toolbarEl?.offsetHeight || 38;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const viewportPadding = 8;
    const gap = 8;

    // Preferred position: strictly ABOVE the SmartArt object
    let top = rect.top - toolbarHeight - gap;
    let isBelow = false;

    // Only fallback to below if physically insufficient space above the top of the viewport
    // (i.e. SmartArt is scrolled up touching the very top of the window, top < 8px)
    if (top < viewportPadding) {
      if (rect.bottom + gap + toolbarHeight <= viewportHeight - viewportPadding) {
        top = rect.bottom + gap;
        isBelow = true;
      } else {
        top = viewportPadding;
      }
    }

    // Preferred horizontal position: horizontally centered over the SmartArt
    let left = rect.left + (rect.width - toolbarWidth) / 2;

    // Clamp horizontally to stay completely within viewport bounds
    const maxLeft = Math.max(viewportPadding, viewportWidth - toolbarWidth - viewportPadding);
    if (left < viewportPadding) {
      left = viewportPadding;
    } else if (left > maxLeft) {
      left = maxLeft;
    }

    setToolbarPos({
      top: Math.round(top),
      left: Math.round(left),
      isBelow,
    });
  }, [isSelected]);

  // Sync toolbar position on selection, scroll, window resize, and SmartArt resize
  useLayoutEffect(() => {
    if (!isSelected) {
      setToolbarPos(null);
      return;
    }

    updateToolbarPosition();

    const handleScrollOrResize = () => {
      updateToolbarPosition();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(() => {
        updateToolbarPosition();
      });
      ro.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      if (ro) ro.disconnect();
    };
  }, [isSelected, updateToolbarPosition, smartArt.width, smartArt.height, smartArt.alignment, showTextPane]);

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

  // Click outside to close floating dropdowns
  useEffect(() => {
    const handleWindowClick = () => {
      setShowColorDropdown(false);
      setShowLayoutDropdown(false);
      setShowStyleDropdown(false);
    };
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  // Helper to determine whether an event target is a SmartArt text-editing element (State 2)
  const isSmartArtTextEditingTarget = useCallback((target: EventTarget | null): boolean => {
    if (!target || !(target instanceof HTMLElement)) return false;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return true;
    if (target.isContentEditable) return true;
    if (
      target.closest(
        'input, textarea, [contenteditable="true"], [data-smartart-text-editor], [data-smartart-text-pane], figcaption, [data-smartart-caption], .smartart-caption-inline-input'
      )
    ) {
      return true;
    }
    return false;
  }, []);

  const isSmartArtTextEditingActive = useCallback((): boolean => {
    const activeEl = document.activeElement;
    return isSmartArtTextEditingTarget(activeEl);
  }, [isSmartArtTextEditingTarget]);

  // Isolate keyboard events originating from SmartArt text inputs so they NEVER bubble out
  // to the parent contenteditable document or trigger figure/page deletion.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleContainerKeyDown = (e: KeyboardEvent) => {
      if (isSmartArtTextEditingTarget(e.target)) {
        // STATE 2: SmartArt text is being edited.
        // Stop propagation so Backspace, Delete, Enter, and Arrow keys never bubble to the outer contenteditable document or object deletion handlers.
        e.stopPropagation();
      }
    };

    const handleContainerKeyUp = (e: KeyboardEvent) => {
      if (isSmartArtTextEditingTarget(e.target)) {
        e.stopPropagation();
      }
    };

    container.addEventListener('keydown', handleContainerKeyDown);
    container.addEventListener('keyup', handleContainerKeyUp);

    return () => {
      container.removeEventListener('keydown', handleContainerKeyDown);
      container.removeEventListener('keyup', handleContainerKeyUp);
    };
  }, [isSmartArtTextEditingTarget]);

  // Keyboard Delete & Backspace listener when SmartArt object is selected (State 1)
  useEffect(() => {
    if (!isSelected) return;

    const handleObjectKeyDown = (e: KeyboardEvent) => {
      // MODE B GUARD: Never delete SmartArt if an input or text editing context is active
      if (isSmartArtTextEditingTarget(e.target) || isSmartArtTextEditingActive()) {
        return;
      }

      // Guard if document.activeElement is any input, textarea, or contentEditable
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable ||
          activeEl.closest('input, textarea, [contenteditable="true"]'))
      ) {
        return;
      }

      // Guard if event target is an input/textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.closest('input, textarea, [contenteditable="true"]'))
      ) {
        return;
      }

      // MODE A: Only delete the SmartArt object if no text editing element is active
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        e.stopPropagation();
        onDeleteSmartArt();
      }
    };

    window.addEventListener('keydown', handleObjectKeyDown);
    return () => {
      window.removeEventListener('keydown', handleObjectKeyDown);
    };
  }, [isSelected, onDeleteSmartArt, isSmartArtTextEditingTarget, isSmartArtTextEditingActive]);

  // Handle node text edit
  const handleNodeTextChange = (nodeId: string, newText: string) => {
    const updatedNodes = smartArt.nodes.map((n) =>
      n.id === nodeId ? { ...n, text: newText } : n
    );
    onUpdateSmartArt({
      ...smartArt,
      nodes: updatedNodes,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleNodeSubtitleChange = (nodeId: string, newSub: string) => {
    const updatedNodes = smartArt.nodes.map((n) =>
      n.id === nodeId ? { ...n, subtitle: newSub } : n
    );
    onUpdateSmartArt({
      ...smartArt,
      nodes: updatedNodes,
      updatedAt: new Date().toISOString(),
    });
  };

  // Add shape
  const handleAddShape = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const count = smartArt.nodes.length + 1;
    const hasSubtitle = smartArt.nodes.some((n) => n.subtitle !== undefined);
    const newNode: SmartArtNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: `Step ${count}`,
      subtitle: hasSubtitle
        ? `Description for step ${count}`
        : smartArt.category === 'List'
        ? `Description for step ${count}`
        : undefined,
      level: 1,
    };
    onUpdateSmartArt({
      ...smartArt,
      nodes: [...smartArt.nodes, newNode],
      updatedAt: new Date().toISOString(),
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
      updatedAt: new Date().toISOString(),
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

  // Context Menu - prevent browser default context menu (user uses top contextual toolbar)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSmartArt(smartArt);
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
        updateToolbarPosition();
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
                      className={`flex items-center gap-3 p-3 rounded-xl text-primary-foreground shadow-md cursor-pointer transition-all ${
                        isNodeSelected
                          ? 'ring-3 ring-primary scale-[1.02] z-10'
                          : 'hover:scale-[1.01]'
                      } ${smartArt.style === 'outline' ? 'text-foreground' : ''}`}
                      style={styleObj}
                    >
                      <div
                        className="w-7 h-7 shrink-0 rounded-lg bg-card/20 font-bold text-xs flex items-center justify-center shadow-inner"
                        style={smartArt.style === 'outline' ? { backgroundColor: bg, color: '#fff' } : {}}
                      >
                        {origIndex + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={node.text}
                          onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          onKeyUp={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onFocus={() => setSelectedNodeId(node.id)}
                          data-smartart-text-editor="true"
                          placeholder="Step title..."
                          className={`w-full font-bold text-xs bg-transparent border-none focus:outline-none focus:bg-card/20 rounded px-1 ${
                            smartArt.style === 'outline' ? 'text-foreground dark:text-primary-foreground' : 'text-primary-foreground'
                          }`}
                        />
                        {node.subtitle !== undefined && (
                          <input
                            type="text"
                            value={node.subtitle ?? ''}
                            onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()}
                            onKeyUp={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            onFocus={() => setSelectedNodeId(node.id)}
                            data-smartart-text-editor="true"
                            placeholder="Description..."
                            className={`w-full text-[11px] bg-transparent border-none focus:outline-none focus:bg-card/20 rounded px-1 mt-0.5 ${
                              smartArt.style === 'outline' ? 'text-secondary-foreground dark:text-muted-foreground' : 'text-primary-foreground/80'
                            }`}
                          />
                        )}
                      </div>
                    </div>

                    {i < nodes.length - 1 && (
                      <div
                        className={`h-3 w-0.5 bg-secondary dark:bg-secondary-foreground my-0.5 ${
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
                    className={`flex-1 min-w-[120px] max-w-[200px] h-28 flex flex-col justify-center items-center p-3 text-primary-foreground shadow-md transition-transform cursor-pointer ${
                      isNodeSelected ? 'ring-3 ring-primary scale-105 z-10' : 'hover:scale-102'
                    }`}
                    style={styleObj}
                  >
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                        smartArt.style === 'outline' ? 'text-muted0' : 'opacity-80'
                      }`}
                    >
                      Step {origIndex + 1}
                    </span>
                    <input
                      type="text"
                      value={node.text}
                      onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={() => setSelectedNodeId(node.id)}
                      data-smartart-text-editor="true"
                      placeholder="Step title..."
                      className={`w-full text-center bg-transparent border-none font-bold text-xs focus:outline-none focus:bg-card/20 rounded px-1 ${
                        smartArt.style === 'outline' ? 'text-foreground dark:text-primary-foreground' : 'text-primary-foreground'
                      }`}
                    />
                    {node.subtitle !== undefined && (
                      <input
                        type="text"
                        value={node.subtitle ?? ''}
                        onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        onKeyUp={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={() => setSelectedNodeId(node.id)}
                        data-smartart-text-editor="true"
                        placeholder="Description..."
                        className={`w-full text-center bg-transparent border-none text-[11px] mt-1 focus:outline-none focus:bg-card/20 rounded px-1 ${
                          smartArt.style === 'outline' ? 'text-secondary-foreground dark:text-muted-foreground' : 'text-primary-foreground/80'
                        }`}
                      />
                    )}
                  </div>

                  {i < nodes.length - 1 && (
                    <div className="shrink-0 text-muted-foreground dark:text-secondary-foreground px-0.5">
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
                  className={`flex-1 min-w-[120px] max-w-[200px] h-28 flex flex-col justify-center items-center p-3 text-primary-foreground transition-transform cursor-pointer shadow-md ${
                    isNodeSelected ? 'ring-2 ring-primary scale-105 z-10' : 'hover:brightness-105'
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
                    onKeyDown={(e) => e.stopPropagation()}
                    onKeyUp={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={() => setSelectedNodeId(node.id)}
                    data-smartart-text-editor="true"
                    placeholder="Step title..."
                    className="w-full text-center bg-transparent border-none text-primary-foreground font-bold text-xs focus:outline-none focus:bg-card/20 rounded px-1"
                  />
                  {node.subtitle !== undefined && (
                    <input
                      type="text"
                      value={node.subtitle ?? ''}
                      onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={() => setSelectedNodeId(node.id)}
                      data-smartart-text-editor="true"
                      placeholder="Description..."
                      className="w-full text-center bg-transparent border-none text-primary-foreground/80 text-[11px] mt-1 focus:outline-none focus:bg-card/20 rounded px-1"
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
            <div className="absolute top-1/2 left-8 right-8 h-1 bg-secondary dark:bg-secondary-foreground -translate-y-1/2 rounded-full" />

            {nodes.map((node) => {
              const origIndex = smartArt.nodes.findIndex((n) => n.id === node.id);
              const bg = colors[origIndex % colors.length];
              const isNodeSelected = selectedNodeId === node.id;
              const styleObj = getStyleClass(bg);

              return (
                <div
                  key={node.id}
                  onClick={(e) => handleNodeClick(e, node.id)}
                  className={`relative z-10 flex-1 min-w-[110px] max-w-[180px] p-3 rounded-xl text-primary-foreground shadow-md transition-all cursor-pointer ${
                    isNodeSelected ? 'ring-3 ring-primary scale-105' : 'hover:scale-102'
                  }`}
                  style={styleObj}
                >
                  <div
                    className="w-6 h-6 rounded-full bg-card/25 text-primary-foreground font-bold text-[11px] flex items-center justify-center mb-1.5"
                    style={smartArt.style === 'outline' ? { backgroundColor: bg } : {}}
                  >
                    {origIndex + 1}
                  </div>
                  <input
                    type="text"
                    value={node.text}
                    onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    onKeyUp={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={() => setSelectedNodeId(node.id)}
                    data-smartart-text-editor="true"
                    placeholder="Step title..."
                    className={`w-full font-bold text-xs bg-transparent border-none focus:outline-none focus:bg-card/20 rounded px-1 ${
                      smartArt.style === 'outline' ? 'text-foreground dark:text-primary-foreground' : 'text-primary-foreground'
                    }`}
                  />
                  {node.subtitle !== undefined && (
                    <input
                      type="text"
                      value={node.subtitle ?? ''}
                      onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={() => setSelectedNodeId(node.id)}
                      data-smartart-text-editor="true"
                      placeholder="Description..."
                      className={`w-full text-[11px] bg-transparent border-none focus:outline-none focus:bg-card/20 rounded px-1 mt-0.5 ${
                        smartArt.style === 'outline' ? 'text-secondary-foreground dark:text-muted-foreground' : 'text-primary-foreground/80'
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
                    className={`w-full max-w-md p-3 rounded-xl text-primary-foreground shadow-sm flex items-center gap-3 transition-all cursor-pointer ${
                      isNodeSelected ? 'ring-3 ring-primary scale-[1.01]' : 'hover:scale-[1.005]'
                    }`}
                    style={styleObj}
                  >
                    <div
                      className="w-7 h-7 shrink-0 rounded-lg bg-card/25 text-primary-foreground font-bold text-xs flex items-center justify-center"
                      style={smartArt.style === 'outline' ? { backgroundColor: bg } : {}}
                    >
                      {origIndex + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={node.text}
                        onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        onKeyUp={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={() => setSelectedNodeId(node.id)}
                        data-smartart-text-editor="true"
                        placeholder="Step title..."
                        className={`w-full font-bold text-xs bg-transparent border-none focus:outline-none focus:bg-card/20 rounded px-1 ${
                          smartArt.style === 'outline' ? 'text-foreground dark:text-primary-foreground' : 'text-primary-foreground'
                        }`}
                      />
                      {node.subtitle !== undefined && (
                        <input
                          type="text"
                          value={node.subtitle ?? ''}
                          onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          onKeyUp={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onFocus={() => setSelectedNodeId(node.id)}
                          data-smartart-text-editor="true"
                          placeholder="Description..."
                          className={`w-full text-[11px] bg-transparent border-none focus:outline-none focus:bg-card/20 rounded px-1 mt-0.5 ${
                            smartArt.style === 'outline' ? 'text-secondary-foreground dark:text-muted-foreground' : 'text-primary-foreground/80'
                          }`}
                        />
                      )}
                    </div>
                  </div>

                  {i < nodes.length - 1 && (
                    <div className="w-0.5 h-3 bg-secondary dark:bg-secondary-foreground" />
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
            <div className="absolute left-6 right-6 top-1/2 h-1 bg-secondary dark:bg-secondary-foreground -translate-y-1/2 rounded-full" />

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
                      className={`w-full p-2.5 rounded-xl text-primary-foreground shadow-md text-center transition-all cursor-pointer ${
                        isNodeSelected ? 'ring-3 ring-primary scale-105' : 'hover:scale-102'
                      }`}
                      style={styleObj}
                    >
                      <input
                        type="text"
                        value={node.text}
                        onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        onKeyUp={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={() => setSelectedNodeId(node.id)}
                        data-smartart-text-editor="true"
                        placeholder="Step title..."
                        className={`w-full text-center font-bold text-xs bg-transparent border-none focus:outline-none focus:bg-card/20 rounded px-1 ${
                          smartArt.style === 'outline' ? 'text-foreground dark:text-primary-foreground' : 'text-primary-foreground'
                        }`}
                      />
                      {node.subtitle !== undefined && (
                        <input
                          type="text"
                          value={node.subtitle ?? ''}
                          onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          onKeyUp={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onFocus={() => setSelectedNodeId(node.id)}
                          data-smartart-text-editor="true"
                          placeholder="Description..."
                          className={`w-full text-center text-[10px] bg-transparent border-none focus:outline-none focus:bg-card/20 rounded px-1 mt-0.5 ${
                            smartArt.style === 'outline' ? 'text-secondary-foreground dark:text-muted-foreground' : 'text-primary-foreground/80'
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
            <div className="absolute left-12 right-12 top-1/2 h-1 bg-secondary dark:bg-secondary-foreground -translate-y-1/2 rounded-full" />

            {nodes.map((node) => {
              const origIndex = smartArt.nodes.findIndex((n) => n.id === node.id);
              const bg = colors[origIndex % colors.length];
              const isNodeSelected = selectedNodeId === node.id;

              return (
                <div key={node.id} className="relative z-10 flex flex-col items-center flex-1 max-w-[150px]">
                  <div
                    onClick={(e) => handleNodeClick(e, node.id)}
                    className={`w-16 h-16 rounded-full flex flex-col items-center justify-center text-primary-foreground shadow-md transition-all cursor-pointer ${
                      isNodeSelected ? 'ring-3 ring-primary scale-110' : 'hover:scale-105'
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
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={() => setSelectedNodeId(node.id)}
                      data-smartart-text-editor="true"
                      placeholder="Step title..."
                      className="w-full text-center font-bold text-xs text-foreground dark:text-muted bg-transparent border-none focus:outline-none focus:bg-muted dark:focus:bg-muted rounded px-1"
                    />
                    {node.subtitle !== undefined && (
                      <input
                        type="text"
                        value={node.subtitle ?? ''}
                        onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        onKeyUp={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={() => setSelectedNodeId(node.id)}
                        data-smartart-text-editor="true"
                        placeholder="Description..."
                        className="w-full text-center text-[11px] text-muted0 dark:text-muted-foreground bg-transparent border-none focus:outline-none focus:bg-muted dark:focus:bg-muted rounded px-1"
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
                  className={`flex-1 min-w-[120px] max-w-[200px] p-3 rounded-xl text-primary-foreground shadow-md transition-all cursor-pointer ${
                    isNodeSelected ? 'ring-3 ring-primary scale-105 z-10' : 'hover:scale-102'
                  }`}
                  style={styleObj}
                >
                  <div
                    className="w-6 h-6 rounded-md bg-card/25 text-primary-foreground font-bold text-xs flex items-center justify-center mb-2"
                    style={smartArt.style === 'outline' ? { backgroundColor: bg } : {}}
                  >
                    {origIndex + 1}
                  </div>
                  <input
                    type="text"
                    value={node.text}
                    onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    onKeyUp={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={() => setSelectedNodeId(node.id)}
                    data-smartart-text-editor="true"
                    placeholder="Step title..."
                    className={`w-full font-bold text-xs bg-transparent border-none focus:outline-none focus:bg-card/20 rounded px-1 ${
                      smartArt.style === 'outline' ? 'text-foreground dark:text-primary-foreground' : 'text-primary-foreground'
                    }`}
                  />
                  {node.subtitle !== undefined && (
                    <input
                      type="text"
                      value={node.subtitle ?? ''}
                      onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={() => setSelectedNodeId(node.id)}
                      data-smartart-text-editor="true"
                      placeholder="Description..."
                      className={`w-full text-[11px] bg-transparent border-none focus:outline-none focus:bg-card/20 rounded px-1 mt-1 ${
                        smartArt.style === 'outline' ? 'text-secondary-foreground dark:text-muted-foreground' : 'text-primary-foreground/80'
                      }`}
                    />
                  )}
                </div>

                {i < nodes.length - 1 && (
                  <div className="shrink-0 text-muted-foreground dark:text-secondary-foreground px-0.5">
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

    // =============================================================
    // 1. LIST CATEGORY
    // =============================================================
    if (cat === 'List') {
      // 1.1 BASIC LIST
      if (layId === 'basicList') {
        return (
          <div className="flex flex-col justify-start gap-2.5 w-full h-full p-4 overflow-y-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
            {nodes.map((node) => {
              const origIndex = smartArt.nodes.findIndex((n) => n.id === node.id);
              const bg = colors[origIndex % colors.length];
              const isNodeSelected = selectedNodeId === node.id;
              const styleObj = getStyleClass(bg);

              return (
                <div
                  key={node.id}
                  onClick={(e) => handleNodeClick(e, node.id)}
                  className={`flex items-stretch rounded-xl border border-secondary bg-card overflow-hidden shadow-xs transition-all cursor-pointer dark:bg-secondary dark:border-muted ${
                    isNodeSelected ? 'ring-2 ring-primary shadow-md' : 'hover:border-border'
                  }`}
                >
                  <div
                    className="w-12 shrink-0 flex items-center justify-center font-bold text-primary-foreground text-xs shadow-inner"
                    style={styleObj}
                  >
                    <span className="w-6 h-6 rounded-md bg-card/20 flex items-center justify-center text-xs">
                      {origIndex + 1}
                    </span>
                  </div>
                  <div className="flex-1 p-2.5 min-w-0" style={{ backgroundColor: `${bg}08` }}>
                    <input
                      type="text"
                      value={node.text}
                      onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={() => setSelectedNodeId(node.id)}
                      data-smartart-text-editor="true"
                      placeholder="Point title..."
                      className="w-full font-bold text-xs text-foreground dark:text-muted bg-transparent border-none focus:outline-none focus:bg-card/40 dark:focus:bg-muted rounded px-1"
                    />
                    {node.subtitle !== undefined && (
                      <input
                        type="text"
                        value={node.subtitle ?? ''}
                        onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        onKeyUp={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={() => setSelectedNodeId(node.id)}
                        data-smartart-text-editor="true"
                        placeholder="Point details..."
                        className="w-full text-[11px] text-secondary-foreground dark:text-muted-foreground bg-transparent border-none focus:outline-none focus:bg-card/40 dark:focus:bg-muted rounded px-1 mt-0.5"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      // 1.2 VERTICAL LIST
      if (layId === 'verticalList') {
        return (
          <div className="flex flex-col justify-start gap-2.5 w-full h-full p-4 overflow-y-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
            {nodes.map((node) => {
              const origIndex = smartArt.nodes.findIndex((n) => n.id === node.id);
              const bg = colors[origIndex % colors.length];
              const isNodeSelected = selectedNodeId === node.id;
              const styleObj = getStyleClass(bg);

              return (
                <div
                  key={node.id}
                  onClick={(e) => handleNodeClick(e, node.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border bg-card dark:bg-secondary transition-all cursor-pointer ${
                    isNodeSelected
                      ? 'border-primary ring-2 ring-primary/20 shadow-md'
                      : 'border-secondary dark:border-muted hover:border-border'
                  }`}
                  style={{ borderLeft: `5px solid ${bg}` }}
                >
                  <div
                    className="w-8 h-8 shrink-0 rounded-full text-primary-foreground font-bold flex items-center justify-center text-xs shadow-xs"
                    style={styleObj}
                  >
                    {origIndex + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={node.text}
                      onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={() => setSelectedNodeId(node.id)}
                      data-smartart-text-editor="true"
                      placeholder="List item..."
                      className="w-full font-bold text-xs text-foreground dark:text-muted bg-transparent border-none focus:outline-none focus:bg-primary/10 dark:focus:bg-muted rounded px-1"
                    />
                    {node.subtitle !== undefined && (
                      <input
                        type="text"
                        value={node.subtitle ?? ''}
                        onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        onKeyUp={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={() => setSelectedNodeId(node.id)}
                        data-smartart-text-editor="true"
                        placeholder="Description..."
                        className="w-full text-[11px] text-muted0 dark:text-muted-foreground bg-transparent border-none focus:outline-none focus:bg-primary/10 dark:focus:bg-muted rounded px-1 mt-0.5"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      // 1.3 HORIZONTAL LIST
      if (layId === 'horizontalList') {
        return (
          <div className="flex items-stretch justify-center gap-3 w-full h-full p-4 overflow-x-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
            {nodes.map((node) => {
              const origIndex = smartArt.nodes.findIndex((n) => n.id === node.id);
              const bg = colors[origIndex % colors.length];
              const isNodeSelected = selectedNodeId === node.id;
              const styleObj = getStyleClass(bg);

              return (
                <div
                  key={node.id}
                  onClick={(e) => handleNodeClick(e, node.id)}
                  className={`flex-1 min-w-[140px] max-w-[220px] flex flex-col rounded-xl border border-secondary bg-card shadow-xs overflow-hidden transition-all cursor-pointer dark:bg-secondary dark:border-muted ${
                    isNodeSelected ? 'ring-2 ring-primary shadow-md' : 'hover:border-border'
                  }`}
                >
                  <div
                    className="p-2.5 text-primary-foreground font-semibold text-xs text-center flex items-center justify-center gap-1.5"
                    style={styleObj}
                  >
                    <span className="w-5 h-5 rounded-full bg-card/25 flex items-center justify-center text-[10px] font-bold">
                      {origIndex + 1}
                    </span>
                    <input
                      type="text"
                      value={node.text}
                      onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={() => setSelectedNodeId(node.id)}
                      data-smartart-text-editor="true"
                      placeholder="Concept..."
                      className="w-full text-center bg-transparent border-none text-primary-foreground font-bold text-xs focus:outline-none focus:bg-card/20 rounded"
                    />
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-center bg-muted/50 dark:bg-secondary/50">
                    <textarea
                      rows={3}
                      value={node.subtitle ?? ''}
                      onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={() => setSelectedNodeId(node.id)}
                      data-smartart-text-editor="true"
                      placeholder="Details..."
                      className="w-full text-xs text-secondary-foreground dark:text-muted-foreground bg-transparent border-none resize-none focus:outline-none focus:bg-card dark:focus:bg-muted rounded p-1 text-center"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      // 1.4 GROUPED LIST
      if (layId === 'groupedList') {
        return (
          <div className="flex flex-col justify-start gap-3 w-full h-full p-4 overflow-y-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
            {nodes.map((node) => {
              const origIndex = smartArt.nodes.findIndex((n) => n.id === node.id);
              const bg = colors[origIndex % colors.length];
              const isNodeSelected = selectedNodeId === node.id;
              const styleObj = getStyleClass(bg);

              return (
                <div
                  key={node.id}
                  onClick={(e) => handleNodeClick(e, node.id)}
                  className={`flex items-stretch gap-2.5 p-1 rounded-xl border border-secondary bg-card transition-all cursor-pointer dark:bg-secondary dark:border-muted ${
                    isNodeSelected ? 'ring-2 ring-primary shadow-md' : 'hover:border-border'
                  }`}
                >
                  <div
                    className="w-36 shrink-0 p-3 rounded-lg text-primary-foreground shadow-xs flex flex-col justify-center items-center text-center"
                    style={styleObj}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-0.5">
                      Group {origIndex + 1}
                    </span>
                    <input
                      type="text"
                      value={node.text}
                      onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={() => setSelectedNodeId(node.id)}
                      data-smartart-text-editor="true"
                      placeholder="Group name..."
                      className="w-full text-center bg-transparent border-none text-primary-foreground font-bold text-xs focus:outline-none focus:bg-card/20 rounded px-1"
                    />
                  </div>
                  <div className="flex-1 p-2.5 rounded-lg bg-muted dark:bg-muted/60 border border-muted dark:border-muted flex flex-col justify-center">
                    <input
                      type="text"
                      value={node.subtitle ?? ''}
                      onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={() => setSelectedNodeId(node.id)}
                      data-smartart-text-editor="true"
                      placeholder="Sub-item 1 • Sub-item 2..."
                      className="w-full text-xs text-secondary-foreground dark:text-muted-foreground bg-transparent border-none focus:outline-none focus:bg-card dark:focus:bg-muted rounded px-1"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      // 1.5 STACKED LIST
      if (layId === 'stackedList') {
        return (
          <div className="flex flex-col justify-start gap-2.5 w-full h-full p-4 overflow-y-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
            {nodes.map((node) => {
              const origIndex = smartArt.nodes.findIndex((n) => n.id === node.id);
              const bg = colors[origIndex % colors.length];
              const isNodeSelected = selectedNodeId === node.id;

              return (
                <div
                  key={node.id}
                  onClick={(e) => handleNodeClick(e, node.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border border-secondary transition-all cursor-pointer dark:border-muted ${
                    isNodeSelected ? 'ring-2 ring-primary shadow-md' : 'hover:border-border'
                  }`}
                  style={{
                    backgroundColor: `${bg}10`,
                    borderLeft: `6px solid ${bg}`,
                  }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: bg }}
                  />
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={node.text}
                      onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={() => setSelectedNodeId(node.id)}
                      data-smartart-text-editor="true"
                      placeholder="Layer title..."
                      className="w-full font-bold text-xs text-foreground dark:text-muted bg-transparent border-none focus:outline-none focus:bg-card/60 dark:focus:bg-muted rounded px-1"
                    />
                    {node.subtitle !== undefined && (
                      <input
                        type="text"
                        value={node.subtitle ?? ''}
                        onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        onKeyUp={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={() => setSelectedNodeId(node.id)}
                        data-smartart-text-editor="true"
                        placeholder="Layer description..."
                        className="w-full text-[11px] text-secondary-foreground dark:text-muted-foreground bg-transparent border-none focus:outline-none focus:bg-card/60 dark:focus:bg-muted rounded px-1 mt-0.5"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      // 1.6 NUMBERED LIST (and fallback)
      return (
        <div className="flex flex-col justify-start gap-2.5 w-full h-full p-4 overflow-y-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
          {nodes.map((node) => {
            const origIndex = smartArt.nodes.findIndex((n) => n.id === node.id);
            const bg = colors[origIndex % colors.length];
            const isNodeSelected = selectedNodeId === node.id;
            const styleObj = getStyleClass(bg);

            return (
              <div
                key={node.id}
                onClick={(e) => handleNodeClick(e, node.id)}
                className={`flex items-center gap-3.5 p-2.5 rounded-xl border bg-card dark:bg-secondary transition-all cursor-pointer ${
                  isNodeSelected
                    ? 'border-primary ring-2 ring-primary/20 shadow-sm'
                    : 'border-secondary dark:border-muted hover:border-border'
                }`}
              >
                <div
                  className="w-9 h-9 shrink-0 rounded-full text-primary-foreground font-extrabold flex items-center justify-center text-sm shadow-xs"
                  style={styleObj}
                >
                  {origIndex + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={node.text}
                    onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    onKeyUp={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={() => setSelectedNodeId(node.id)}
                    data-smartart-text-editor="true"
                    placeholder="Priority title..."
                    className="w-full font-bold text-xs text-foreground dark:text-muted bg-transparent border-none focus:outline-none focus:bg-primary/10 dark:focus:bg-muted rounded px-1"
                  />
                  {node.subtitle !== undefined && (
                    <input
                      type="text"
                      value={node.subtitle ?? ''}
                      onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={() => setSelectedNodeId(node.id)}
                      data-smartart-text-editor="true"
                      placeholder="Priority description..."
                      className="w-full text-[11px] text-muted0 dark:text-muted-foreground bg-transparent border-none focus:outline-none focus:bg-primary/10 dark:focus:bg-muted rounded px-1 mt-0.5"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // =============================================================
    // 2. CYCLE CATEGORY (basicCycle, continuousCycle, radialCycle, segmentedCycle, circularCycle)
    // =============================================================
    if (cat === 'Cycle') {
      const count = nodes.length;

      // 2.1 RADIAL CYCLE (Central hub + satellite nodes)
      if (layId === 'radialCycle') {
        const centerNode = nodes[0];
        const satelliteNodes = nodes.slice(1);
        const satCount = Math.max(1, satelliteNodes.length);
        const radius = 105;

        return (
          <div className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden">
            {/* SVG Connecting Spoke Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              {satelliteNodes.map((_, i) => {
                const angle = (i / satCount) * 2 * Math.PI - Math.PI / 2;
                return (
                  <line
                    key={i}
                    x1="50%"
                    y1="50%"
                    x2={`calc(50% + ${Math.cos(angle) * radius}px)`}
                    y2={`calc(50% + ${Math.sin(angle) * radius}px)`}
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                  />
                );
              })}
            </svg>

            {/* Central Hub Node */}
            {centerNode && (
              <div
                onClick={(e) => handleNodeClick(e, centerNode.id)}
                className={`absolute z-10 w-28 h-20 rounded-2xl flex flex-col items-center justify-center p-2 text-primary-foreground shadow-xl cursor-pointer transition-transform ${
                  selectedNodeId === centerNode.id ? 'ring-3 ring-primary scale-110' : 'hover:scale-105'
                }`}
                style={getStyleClass(colors[0])}
              >
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-80 mb-0.5">
                  Core Hub
                </span>
                <input
                  type="text"
                  value={centerNode.text}
                  onChange={(e) => handleNodeTextChange(centerNode.id, e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  onKeyUp={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={() => setSelectedNodeId(centerNode.id)}
                  data-smartart-text-editor="true"
                  placeholder="Hub title..."
                  className="w-full text-center bg-transparent border-none text-primary-foreground font-bold text-xs focus:outline-none focus:bg-card/20 rounded px-1 truncate"
                />
              </div>
            )}

            {/* Satellite Nodes */}
            {satelliteNodes.map((node, i) => {
              const angle = (i / satCount) * 2 * Math.PI - Math.PI / 2;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const origIndex = smartArt.nodes.findIndex((n) => n.id === node.id);
              const bg = colors[origIndex % colors.length];
              const isNodeSelected = selectedNodeId === node.id;

              return (
                <div
                  key={node.id}
                  onClick={(e) => handleNodeClick(e, node.id)}
                  className={`absolute z-10 w-24 h-16 rounded-xl flex flex-col items-center justify-center p-1.5 text-primary-foreground shadow-md cursor-pointer transition-transform ${
                    isNodeSelected ? 'ring-3 ring-primary scale-110' : 'hover:scale-105'
                  }`}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    ...getStyleClass(bg),
                  }}
                >
                  <input
                    type="text"
                    value={node.text}
                    onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    onKeyUp={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={() => setSelectedNodeId(node.id)}
                    data-smartart-text-editor="true"
                    placeholder="Satellite..."
                    className="w-full text-center bg-transparent border-none text-primary-foreground font-bold text-[11px] focus:outline-none focus:bg-card/20 rounded px-1 truncate"
                  />
                </div>
              );
            })}
          </div>
        );
      }

      // 2.2 CONTINUOUS CYCLE / SEGMENTED / CIRCULAR / BASIC CYCLE
      const radius = 110;
      return (
        <div className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden">
          {/* Central Loop Indicator */}
          <div className="absolute w-24 h-24 rounded-full border-2 border-dashed border-border dark:border-secondary-foreground flex items-center justify-center opacity-60 pointer-events-none">
            <Sparkles className="w-5 h-5 text-muted-foreground" />
          </div>

          {nodes.map((node, i) => {
            const angle = (i / Math.max(1, count)) * 2 * Math.PI - Math.PI / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const origIndex = smartArt.nodes.findIndex((n) => n.id === node.id);
            const bg = colors[origIndex % colors.length];
            const isNodeSelected = selectedNodeId === node.id;
            const styleObj = getStyleClass(bg);

            return (
              <div
                key={node.id}
                onClick={(e) => handleNodeClick(e, node.id)}
                className={`absolute w-28 h-20 rounded-xl flex flex-col items-center justify-center p-2 text-primary-foreground shadow-md transition-transform cursor-pointer ${
                  isNodeSelected ? 'ring-3 ring-primary scale-105 z-10' : 'hover:scale-105'
                }`}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                  ...styleObj,
                }}
              >
                <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">
                  Stage {origIndex + 1}
                </span>
                <input
                  type="text"
                  value={node.text}
                  onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  onKeyUp={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={() => setSelectedNodeId(node.id)}
                  data-smartart-text-editor="true"
                  placeholder="Cycle step..."
                  className="w-full text-center bg-transparent border-none text-primary-foreground font-bold text-xs focus:outline-none focus:bg-card/20 rounded px-1 truncate"
                />
              </div>
            );
          })}
        </div>
      );
    }

    // =============================================================
    // 3. HIERARCHY CATEGORY (basicHierarchy, horizontalHierarchy, labeledHierarchy, organizationHierarchy, multiLevelHierarchy)
    // =============================================================
    if (cat === 'Hierarchy') {
      // 3.1 HORIZONTAL HIERARCHY (Left-to-Right tree)
      if (layId === 'horizontalHierarchy') {
        const rootNode = nodes[0];
        const branchNodes = nodes.slice(1);

        return (
          <div className="flex items-center justify-center gap-6 w-full h-full p-4 overflow-x-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
            {/* Left Parent Root Card */}
            {rootNode && (
              <div className="relative flex items-center">
                <div
                  onClick={(e) => handleNodeClick(e, rootNode.id)}
                  className={`w-40 p-3 rounded-xl text-primary-foreground shadow-md text-center cursor-pointer transition-all ${
                    selectedNodeId === rootNode.id ? 'ring-3 ring-primary scale-105' : 'hover:scale-102'
                  }`}
                  style={getStyleClass(colors[0])}
                >
                  <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider block mb-0.5">
                    Parent Origin
                  </span>
                  <input
                    type="text"
                    value={rootNode.text}
                    onChange={(e) => handleNodeTextChange(rootNode.id, e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    onKeyUp={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={() => setSelectedNodeId(rootNode.id)}
                    data-smartart-text-editor="true"
                    placeholder="Origin title..."
                    className="w-full text-center bg-transparent border-none text-primary-foreground font-bold text-xs focus:outline-none focus:bg-card/20 rounded truncate"
                  />
                </div>
                {branchNodes.length > 0 && (
                  <div className="w-6 h-0.5 bg-muted-foreground dark:bg-secondary-foreground" />
                )}
              </div>
            )}

            {/* Right Branches (stacked vertically) */}
            {branchNodes.length > 0 && (
              <div className="relative flex flex-col justify-center gap-3">
                {/* Vertical Distribution Spine */}
                <div
                  className="absolute left-0 w-0.5 bg-muted-foreground dark:bg-secondary-foreground"
                  style={{
                    top: '20px',
                    bottom: '20px',
                  }}
                />

                {branchNodes.map((branch) => {
                  const origIndex = smartArt.nodes.findIndex((n) => n.id === branch.id);
                  const bg = colors[origIndex % colors.length];
                  const isNodeSelected = selectedNodeId === branch.id;

                  return (
                    <div key={branch.id} className="relative flex items-center pl-6">
                      <div className="absolute left-0 w-6 h-0.5 bg-muted-foreground dark:bg-secondary-foreground" />
                      <div
                        onClick={(e) => handleNodeClick(e, branch.id)}
                        className={`w-40 p-2.5 rounded-lg text-primary-foreground shadow-xs cursor-pointer transition-all ${
                          isNodeSelected ? 'ring-3 ring-primary scale-105' : 'hover:scale-102'
                        }`}
                        style={getStyleClass(bg)}
                      >
                        <input
                          type="text"
                          value={branch.text}
                          onChange={(e) => handleNodeTextChange(branch.id, e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          onKeyUp={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onFocus={() => setSelectedNodeId(branch.id)}
                          data-smartart-text-editor="true"
                          placeholder="Branch title..."
                          className="w-full text-center bg-transparent border-none text-primary-foreground font-bold text-xs focus:outline-none focus:bg-card/20 rounded truncate"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      // 3.2 TOP-DOWN HIERARCHIES (basicHierarchy, organizationHierarchy, labeledHierarchy, multiLevelHierarchy)
      const rootNode = nodes[0];
      const childrenNodes = nodes.slice(1);

      return (
        <div className="flex flex-col items-center justify-center gap-5 w-full h-full p-4 overflow-y-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
          {rootNode && (
            <div className="relative flex flex-col items-center">
              <div
                onClick={(e) => handleNodeClick(e, rootNode.id)}
                className={`w-48 p-2.5 rounded-xl text-primary-foreground shadow-md text-center cursor-pointer transition-all ${
                  selectedNodeId === rootNode.id ? 'ring-3 ring-primary scale-105' : 'hover:scale-102'
                }`}
                style={getStyleClass(colors[0])}
              >
                <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider block mb-0.5">
                  {layId === 'organizationHierarchy' ? 'Executive Director' : 'Top Level'}
                </span>
                <input
                  type="text"
                  value={rootNode.text}
                  onChange={(e) => handleNodeTextChange(rootNode.id, e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  onKeyUp={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={() => setSelectedNodeId(rootNode.id)}
                  data-smartart-text-editor="true"
                  placeholder="Lead title..."
                  className="w-full text-center bg-transparent border-none text-primary-foreground font-bold text-xs focus:outline-none focus:bg-card/20 rounded"
                />
              </div>
              {childrenNodes.length > 0 && (
                <div className="w-0.5 h-5 bg-muted-foreground dark:bg-secondary-foreground" />
              )}
            </div>
          )}

          {childrenNodes.length > 0 && (
            <div className="relative flex items-center justify-center gap-3 w-full max-w-xl">
              <div
                className="absolute top-0 h-0.5 bg-muted-foreground dark:bg-secondary-foreground"
                style={{
                  left: `${(1 / (childrenNodes.length + 1)) * 50}%`,
                  right: `${(1 / (childrenNodes.length + 1)) * 50}%`,
                }}
              />

              {childrenNodes.map((child) => {
                const origIndex = smartArt.nodes.findIndex((n) => n.id === child.id);
                const bg = colors[origIndex % colors.length];
                const isNodeSelected = selectedNodeId === child.id;
                const styleObj = getStyleClass(bg);

                return (
                  <div key={child.id} className="relative flex flex-col items-center flex-1 min-w-[100px] max-w-[160px]">
                    <div className="w-0.5 h-4 bg-muted-foreground dark:bg-secondary-foreground" />
                    <div
                      onClick={(e) => handleNodeClick(e, child.id)}
                      className={`w-full p-2.5 rounded-xl text-primary-foreground shadow-xs text-center cursor-pointer transition-all ${
                        isNodeSelected ? 'ring-3 ring-primary scale-105' : 'hover:scale-[1.02]'
                      }`}
                      style={styleObj}
                    >
                      <input
                        type="text"
                        value={child.text}
                        onChange={(e) => handleNodeTextChange(child.id, e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        onKeyUp={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={() => setSelectedNodeId(child.id)}
                        data-smartart-text-editor="true"
                        placeholder="Node title..."
                        className="w-full text-center bg-transparent border-none text-primary-foreground font-bold text-xs focus:outline-none focus:bg-card/20 rounded truncate"
                      />
                      {child.subtitle !== undefined && (
                        <input
                          type="text"
                          value={child.subtitle ?? ''}
                          onChange={(e) => handleNodeSubtitleChange(child.id, e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          onKeyUp={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onFocus={() => setSelectedNodeId(child.id)}
                          data-smartart-text-editor="true"
                          placeholder="Subtitle..."
                          className="w-full text-center bg-transparent border-none text-primary-foreground/80 text-[10px] mt-0.5 focus:outline-none focus:bg-card/20 rounded truncate"
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

    // =============================================================
    // 4. MATRIX CATEGORY (Basic Matrix)
    // =============================================================
    if (cat === 'Matrix') {
      return (
        <div className="w-full h-full p-4 flex items-center justify-center overflow-auto overscroll-contain">
          <div className="grid grid-cols-2 gap-3 w-full max-w-lg aspect-square max-h-[320px]">
            {nodes.slice(0, 4).map((node, i) => {
              const origIndex = smartArt.nodes.findIndex((n) => n.id === node.id);
              const bg = colors[origIndex % colors.length];
              const isNodeSelected = selectedNodeId === node.id;
              const quadrantLabel = `Q${i + 1}`;

              return (
                <div
                  key={node.id}
                  onClick={(e) => handleNodeClick(e, node.id)}
                  className={`rounded-xl p-3 flex flex-col justify-between shadow-xs border transition-all cursor-pointer ${
                    isNodeSelected ? 'ring-3 ring-primary shadow-md' : 'hover:scale-[1.01]'
                  }`}
                  style={{
                    backgroundColor: `${bg}12`,
                    borderColor: `${bg}60`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-primary-foreground uppercase tracking-wider"
                      style={{ backgroundColor: bg }}
                    >
                      {quadrantLabel}
                    </span>
                  </div>
                  <div className="my-auto">
                    <input
                      type="text"
                      value={node.text}
                      onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={() => setSelectedNodeId(node.id)}
                      data-smartart-text-editor="true"
                      placeholder="Quadrant title..."
                      className="w-full font-bold text-xs text-foreground dark:text-muted bg-transparent border-none focus:outline-none focus:bg-card/40 rounded p-1"
                    />
                    <textarea
                      rows={2}
                      value={node.subtitle ?? ''}
                      onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={() => setSelectedNodeId(node.id)}
                      data-smartart-text-editor="true"
                      placeholder="Quadrant details..."
                      className="w-full text-[11px] text-secondary-foreground dark:text-muted-foreground bg-transparent border-none resize-none focus:outline-none focus:bg-card/40 rounded p-1 mt-0.5"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // =============================================================
    // 5. PYRAMID CATEGORY (basicPyramid, segmentedPyramid, pyramidList, layeredPyramid)
    // =============================================================
    if (cat === 'Pyramid') {
      const reversed = [...nodes].reverse();
      const count = reversed.length;

      // 5.1 PYRAMID LIST (Pyramid tiers on left linked to cards on right)
      if (layId === 'pyramidList') {
        return (
          <div className="flex items-center justify-center gap-4 w-full h-full p-4 overflow-y-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
            {/* Left Stacked Pyramid */}
            <div className="flex-1 flex flex-col items-center gap-2 max-w-[240px]">
              {reversed.map((node, i) => {
                const origIndex = smartArt.nodes.findIndex((n) => n.id === node.id);
                const bg = colors[origIndex % colors.length];
                const widthPercent = 40 + (i / Math.max(1, count - 1)) * 60;
                const isNodeSelected = selectedNodeId === node.id;

                return (
                  <div
                    key={node.id}
                    onClick={(e) => handleNodeClick(e, node.id)}
                    className={`h-11 rounded-lg text-primary-foreground shadow-sm flex items-center justify-center px-2 cursor-pointer transition-all ${
                      isNodeSelected ? 'ring-3 ring-primary scale-105 z-10' : 'hover:brightness-105'
                    }`}
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: bg,
                    }}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      L{count - i}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Right Detailed Callout Cards */}
            <div className="flex-1 flex flex-col gap-2 max-w-xs">
              {reversed.map((node) => {
                const origIndex = smartArt.nodes.findIndex((n) => n.id === node.id);
                const bg = colors[origIndex % colors.length];
                const isNodeSelected = selectedNodeId === node.id;

                return (
                  <div
                    key={node.id}
                    onClick={(e) => handleNodeClick(e, node.id)}
                    className={`p-2 rounded-lg border bg-card dark:bg-secondary transition-all cursor-pointer ${
                      isNodeSelected ? 'border-primary ring-2 ring-primary/20 shadow-xs' : 'border-secondary dark:border-muted'
                    }`}
                    style={{ borderLeft: `4px solid ${bg}` }}
                  >
                    <input
                      type="text"
                      value={node.text}
                      onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={() => setSelectedNodeId(node.id)}
                      data-smartart-text-editor="true"
                      placeholder="Tier title..."
                      className="w-full font-bold text-xs text-foreground dark:text-muted bg-transparent border-none focus:outline-none focus:bg-muted rounded px-1"
                    />
                    {node.subtitle !== undefined && (
                      <input
                        type="text"
                        value={node.subtitle ?? ''}
                        onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        onKeyUp={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={() => setSelectedNodeId(node.id)}
                        data-smartart-text-editor="true"
                        placeholder="Details..."
                        className="w-full text-[11px] text-muted0 dark:text-muted-foreground bg-transparent border-none focus:outline-none focus:bg-muted rounded px-1 mt-0.5"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      // 5.2 BASIC / SEGMENTED / LAYERED PYRAMIDS
      return (
        <div className="flex flex-col items-center justify-center gap-2.5 w-full h-full p-4 overflow-y-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
          {reversed.map((node, i) => {
            const originalIndex = smartArt.nodes.findIndex((n) => n.id === node.id);
            const bg = colors[originalIndex % colors.length];
            const isNodeSelected = selectedNodeId === node.id;
            const widthPercent = 35 + (i / Math.max(1, count - 1)) * 60;
            const styleObj = getStyleClass(bg);

            return (
              <div
                key={node.id}
                onClick={(e) => handleNodeClick(e, node.id)}
                className={`h-12 rounded-xl text-primary-foreground shadow-sm flex items-center justify-center px-4 transition-all cursor-pointer ${
                  isNodeSelected ? 'ring-3 ring-primary scale-[1.02] z-10' : 'hover:brightness-105'
                }`}
                style={{
                  width: `${widthPercent}%`,
                  ...styleObj,
                }}
              >
                <span className="text-[10px] font-bold opacity-80 mr-2 uppercase tracking-wider shrink-0">
                  L{count - i}
                </span>
                <input
                  type="text"
                  value={node.text}
                  onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  onKeyUp={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={() => setSelectedNodeId(node.id)}
                  data-smartart-text-editor="true"
                  placeholder="Layer title..."
                  className="w-full text-center bg-transparent border-none text-primary-foreground font-bold text-xs focus:outline-none focus:bg-card/20 rounded px-1"
                />
              </div>
            );
          })}
        </div>
      );
    }

    // =============================================================
    // 6. TEXT CARD CATEGORY (standardCards, headerCards, multiColumnCards, calloutCard, statCard)
    // =============================================================
    // 6.1 CALLOUT CARD (Single / executive quotation banner)
    if (layId === 'calloutCard') {
      const node = nodes[0] || { id: 'callout-1', text: 'Executive Quote', subtitle: 'SmartArt callout message' };
      const bg = colors[0];
      const isNodeSelected = selectedNodeId === node.id;

      return (
        <div className="w-full h-full p-6 flex items-center justify-center">
          <div
            onClick={(e) => handleNodeClick(e, node.id)}
            className={`w-full max-w-xl p-6 rounded-2xl border bg-card dark:bg-secondary shadow-md relative transition-all cursor-pointer ${
              isNodeSelected ? 'ring-3 ring-primary shadow-xl' : 'hover:shadow-lg'
            }`}
            style={{ borderLeft: `8px solid ${bg}` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-primary-foreground"
                style={{ backgroundColor: bg }}
              >
                <Quote className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={node.text}
                onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                onKeyUp={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                onFocus={() => setSelectedNodeId(node.id)}
                data-smartart-text-editor="true"
                placeholder="Callout Headline..."
                className="font-extrabold text-sm text-foreground dark:text-primary-foreground bg-transparent border-none focus:outline-none focus:bg-muted dark:focus:bg-muted rounded px-1 flex-1"
              />
            </div>
            <textarea
              rows={3}
              value={node.subtitle ?? ''}
              onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              onKeyUp={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onFocus={() => setSelectedNodeId(node.id)}
              data-smartart-text-editor="true"
              placeholder="Enter callout quote or key statement details..."
              className="w-full text-xs text-secondary-foreground dark:text-muted-foreground bg-transparent border-none resize-none focus:outline-none focus:bg-muted dark:focus:bg-muted rounded p-1 leading-relaxed"
            />
          </div>
        </div>
      );
    }

    // 6.2 STAT CARD (KPI / Metric cards with bold numbers)
    if (layId === 'statCard') {
      return (
        <div className="grid grid-cols-3 gap-3.5 w-full h-full p-4 items-center overflow-x-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
          {nodes.map((node) => {
            const origIndex = smartArt.nodes.findIndex((n) => n.id === node.id);
            const bg = colors[origIndex % colors.length];
            const isNodeSelected = selectedNodeId === node.id;

            return (
              <div
                key={node.id}
                onClick={(e) => handleNodeClick(e, node.id)}
                className={`p-4 rounded-xl border border-secondary bg-card dark:bg-secondary dark:border-muted shadow-xs flex flex-col items-center text-center justify-between transition-all cursor-pointer ${
                  isNodeSelected ? 'ring-3 ring-primary shadow-md' : 'hover:border-border'
                }`}
                style={{ borderTop: `4px solid ${bg}` }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-primary-foreground mb-2"
                  style={{ backgroundColor: bg }}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={node.text}
                  onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  onKeyUp={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={() => setSelectedNodeId(node.id)}
                  data-smartart-text-editor="true"
                  placeholder="99.9%"
                  className="w-full text-center font-extrabold text-xl text-foreground dark:text-primary-foreground bg-transparent border-none focus:outline-none focus:bg-muted rounded"
                />
                <input
                  type="text"
                  value={node.subtitle ?? ''}
                  onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  onKeyUp={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={() => setSelectedNodeId(node.id)}
                  data-smartart-text-editor="true"
                  placeholder="Metric Label..."
                  className="w-full text-center text-[11px] font-semibold text-muted0 dark:text-muted-foreground bg-transparent border-none focus:outline-none focus:bg-muted rounded mt-1"
                />
              </div>
            );
          })}
        </div>
      );
    }

    // 6.3 HEADER CARDS (Solid color header banners)
    if (layId === 'headerCards') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full h-full p-4 overflow-y-auto overscroll-contain items-start" onWheel={(e) => e.stopPropagation()}>
          {nodes.map((node) => {
            const origIndex = smartArt.nodes.findIndex((n) => n.id === node.id);
            const bg = colors[origIndex % colors.length];
            const isNodeSelected = selectedNodeId === node.id;
            const styleObj = getStyleClass(bg);

            return (
              <div
                key={node.id}
                onClick={(e) => handleNodeClick(e, node.id)}
                className={`rounded-xl border border-secondary bg-card overflow-hidden shadow-xs flex flex-col justify-between transition-all cursor-pointer dark:bg-secondary dark:border-muted ${
                  isNodeSelected ? 'ring-2 ring-primary shadow-md' : 'hover:border-border'
                }`}
              >
                <div
                  className="p-2.5 text-primary-foreground font-bold text-xs text-center shadow-xs"
                  style={styleObj}
                >
                  <input
                    type="text"
                    value={node.text}
                    onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    onKeyUp={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={() => setSelectedNodeId(node.id)}
                    data-smartart-text-editor="true"
                    placeholder="Plan Title..."
                    className="w-full text-center bg-transparent border-none text-primary-foreground font-bold text-xs focus:outline-none focus:bg-card/20 rounded"
                  />
                </div>
                <div className="p-3 bg-card dark:bg-secondary flex-1">
                  <textarea
                    rows={2}
                    value={node.subtitle ?? ''}
                    onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    onKeyUp={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={() => setSelectedNodeId(node.id)}
                    data-smartart-text-editor="true"
                    placeholder="Description details..."
                    className="w-full text-[11px] text-secondary-foreground dark:text-muted-foreground bg-transparent border-none resize-none focus:outline-none focus:bg-muted dark:focus:bg-muted rounded p-1"
                  />
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // 6.4 STANDARD / MULTI-COLUMN CARDS (Default Text Card)
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full h-full p-4 overflow-y-auto overscroll-contain items-start" onWheel={(e) => e.stopPropagation()}>
        {nodes.map((node) => {
          const origIndex = smartArt.nodes.findIndex((n) => n.id === node.id);
          const bg = colors[origIndex % colors.length];
          const isNodeSelected = selectedNodeId === node.id;

          return (
            <div
              key={node.id}
              onClick={(e) => handleNodeClick(e, node.id)}
              className={`rounded-xl border border-secondary bg-card p-3.5 shadow-xs flex flex-col justify-between transition-all cursor-pointer dark:bg-secondary dark:border-muted ${
                isNodeSelected ? 'ring-2 ring-primary shadow-md' : 'hover:border-border'
              }`}
              style={{ borderTop: `4px solid ${bg}` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="w-6 h-6 rounded-full text-primary-foreground font-bold text-[10px] flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: bg }}
                >
                  {origIndex + 1}
                </span>
              </div>
              <input
                type="text"
                value={node.text}
                onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                onKeyUp={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                onFocus={() => setSelectedNodeId(node.id)}
                data-smartart-text-editor="true"
                placeholder="Card title..."
                className="w-full font-bold text-xs text-foreground dark:text-muted bg-transparent border-none focus:outline-none focus:bg-muted dark:focus:bg-muted rounded p-1"
              />
              <textarea
                rows={2}
                value={node.subtitle ?? ''}
                onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                onKeyUp={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                onFocus={() => setSelectedNodeId(node.id)}
                data-smartart-text-editor="true"
                placeholder="Card summary statement..."
                className="w-full text-[11px] text-muted0 dark:text-muted-foreground bg-transparent border-none resize-none focus:outline-none focus:bg-muted dark:focus:bg-muted rounded p-1 mt-1"
              />
            </div>
          );
        })}
      </div>
    );
  };


  return (
    <>
      <div
        ref={containerRef}
      onClick={(e) => {
        e.stopPropagation();
        setActiveSmartArt(smartArt);
      }}
      onContextMenu={handleContextMenu}
      onKeyDown={(e) => {
        if (isSmartArtTextEditingTarget(e.target)) {
          e.stopPropagation();
        }
      }}
      onKeyUp={(e) => {
        if (isSmartArtTextEditingTarget(e.target)) {
          e.stopPropagation();
        }
      }}
      className={`relative group select-none rounded-xl flex transition-all duration-150 ${
        isSelected
          ? 'ring-2 ring-brand shadow-xl'
          : 'hover:ring-1 hover:ring-secondary'
      }`}
      style={{
        width: `${smartArt.width || 640}px`,
        height: `${smartArt.height || 360}px`,
        backgroundColor: smartArt.backgroundColor || '#ffffff',
      }}
    >
      {/* Toolbar moved outside container to floating portal above SmartArt */}

      {/* --------------------------------------------------------
          SMARTART TEXT PANE (Word-style Side Panel)
         -------------------------------------------------------- */}
      {isSelected && showTextPane && (
        <div
          className="w-56 shrink-0 h-full border-r border-secondary dark:border-muted bg-muted dark:bg-[#0c1622] rounded-l-xl p-3 flex flex-col justify-between z-20 shadow-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="shrink-0 flex items-center justify-between pb-2 mb-2 border-b border-secondary dark:border-muted">
              <span className="text-xs font-bold text-foreground dark:text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>Text</span>
              </span>
              <button
                type="button"
                onClick={() => setShowTextPane(false)}
                className="text-muted-foreground hover:text-secondary-foreground dark:hover:text-muted-foreground"
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
                    className={`flex flex-col gap-1 p-1.5 rounded-md border transition-all ${
                      isNodeSelected
                        ? 'border-primary bg-card shadow-xs dark:bg-secondary'
                        : 'border-transparent hover:bg-muted dark:hover:bg-muted/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 w-full">
                      <span className="w-5 text-center text-[11px] font-semibold text-muted0 dark:text-muted-foreground shrink-0 select-none">
                        {i + 1}.
                      </span>
                      <input
                        type="text"
                        value={node.text}
                        onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        onKeyUp={(e) => e.stopPropagation()}
                        onFocus={() => setSelectedNodeId(node.id)}
                        onClick={(e) => e.stopPropagation()}
                        data-smartart-text-editor="true"
                        placeholder="Point text..."
                        className="w-full text-xs text-foreground dark:text-muted bg-transparent border-none focus:outline-none"
                      />
                      {smartArt.nodes.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => handleRemoveShape(node.id, e)}
                          className="text-muted-foreground hover:text-destructive p-0.5 rounded transition-opacity"
                          title="Delete Step"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    {node.subtitle !== undefined && (
                      <input
                        type="text"
                        value={node.subtitle ?? ''}
                        onChange={(e) => handleNodeSubtitleChange(node.id, e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        onKeyUp={(e) => e.stopPropagation()}
                        onFocus={() => setSelectedNodeId(node.id)}
                        onClick={(e) => e.stopPropagation()}
                        data-smartart-text-editor="true"
                        placeholder="Description..."
                        className="w-full text-[11px] text-muted0 dark:text-muted-foreground bg-transparent border-none focus:outline-none pl-6"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddShape}
            className="shrink-0 mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg border border-dashed border-border text-secondary-foreground hover:bg-card hover:border-muted-foreground dark:border-secondary-foreground dark:text-muted-foreground dark:hover:bg-muted text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-primary" />
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
            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-card border-2 border-brand rounded-xs cursor-nwse-resize z-30 shadow-xs"
          />
          {/* N */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'n')}
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-card border-2 border-brand rounded-xs cursor-ns-resize z-30 shadow-xs"
          />
          {/* NE */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'ne')}
            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-card border-2 border-brand rounded-xs cursor-nesw-resize z-30 shadow-xs"
          />
          {/* E */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'e')}
            className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-card border-2 border-brand rounded-xs cursor-ew-resize z-30 shadow-xs"
          />
          {/* SE */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'se')}
            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-card border-2 border-brand rounded-xs cursor-nwse-resize z-30 shadow-xs"
          />
          {/* S */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 's')}
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-card border-2 border-brand rounded-xs cursor-ns-resize z-30 shadow-xs"
          />
          {/* SW */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'sw')}
            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-card border-2 border-brand rounded-xs cursor-nesw-resize z-30 shadow-xs"
          />
          {/* W */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'w')}
            className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-card border-2 border-brand rounded-xs cursor-ew-resize z-30 shadow-xs"
          />
        </>
      )}
    </div>

      {/* --------------------------------------------------------
          CONTEXTUAL FLOATING ACTION TOOLBAR (Visible when selected)
          Rendered via React Portal into document.body above the SmartArt
         -------------------------------------------------------- */}
      {isSelected && toolbarPos && createPortal(
        <div
          ref={toolbarRef}
          role="toolbar"
          aria-label="SmartArt Editing Toolbar"
          data-no-print="true"
          style={{
            top: `${toolbarPos.top}px`,
            left: `${toolbarPos.left}px`,
          }}
          className="fixed z-50 flex items-center gap-1 px-2 py-1 rounded-lg bg-card border border-secondary shadow-xl dark:bg-[#111D29] dark:border-muted text-secondary-foreground dark:text-muted-foreground text-xs animate-in fade-in zoom-in-95 duration-100 flex-nowrap select-none whitespace-nowrap print:hidden"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Add Shape */}
          <button
            type="button"
            onClick={handleAddShape}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-muted dark:hover:bg-muted font-medium text-primary dark:text-primary transition-colors"
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
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-muted dark:hover:bg-muted font-medium text-secondary-foreground dark:text-muted-foreground disabled:opacity-40 transition-colors"
            title="Remove Selected Step"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>

          <div className="w-px h-4 bg-secondary dark:bg-secondary-foreground mx-0.5" />

          {/* Text Pane Toggle */}
          <button
            type="button"
            onClick={() => setShowTextPane((prev) => !prev)}
            className={`flex items-center gap-1 px-2 py-1 rounded font-medium transition-colors ${
              showTextPane
                ? 'bg-primary/10 text-primary dark:bg-navy-950/60 dark:text-primary'
                : 'hover:bg-muted dark:hover:bg-muted text-secondary-foreground dark:text-muted-foreground'
            }`}
            title="Toggle Text Pane"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Text Pane</span>
          </button>

          <div className="w-px h-4 bg-secondary dark:bg-secondary-foreground mx-0.5" />

          {/* Move Before / Move After */}
          <button
            type="button"
            onClick={() => handleMoveBefore()}
            className="p-1 rounded hover:bg-muted dark:hover:bg-muted text-secondary-foreground dark:text-muted-foreground"
            title="Move Selected Step Up / Left (Move Before)"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => handleMoveAfter()}
            className="p-1 rounded hover:bg-muted dark:hover:bg-muted text-secondary-foreground dark:text-muted-foreground"
            title="Move Selected Step Down / Right (Move After)"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          {/* Promote / Demote */}
          <button
            type="button"
            onClick={() => handlePromote()}
            className="p-1 rounded hover:bg-muted dark:hover:bg-muted text-secondary-foreground dark:text-muted-foreground"
            title="Promote Step Level"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => handleDemote()}
            className="p-1 rounded hover:bg-muted dark:hover:bg-muted text-secondary-foreground dark:text-muted-foreground"
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
                ? 'bg-warning-50 text-warning-600 dark:bg-warning-950/60 dark:text-warning-400'
                : 'hover:bg-muted dark:hover:bg-muted text-secondary-foreground dark:text-muted-foreground'
            }`}
            title="Toggle Right to Left Direction (RTL / LTR)"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-secondary dark:bg-secondary-foreground mx-0.5" />

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
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-muted dark:hover:bg-muted font-medium transition-colors"
              title="Change Color Palette"
            >
              <Palette className="w-3.5 h-3.5 text-warning-500" />
              <span>Colors</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showColorDropdown && (
              <div className={`absolute ${toolbarPos.isBelow && toolbarPos.top + 250 > window.innerHeight ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 w-52 p-1.5 bg-card border border-secondary rounded-lg shadow-2xl dark:bg-[#111D29] dark:border-muted z-50 animate-in fade-in zoom-in-95`}>
                <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Color Themes
                </span>
                {SMARTART_COLOR_SCHEMES.map((scheme) => (
                  <button
                    key={scheme.id}
                    type="button"
                    onClick={() => handleSelectColorScheme(scheme.id)}
                    className="w-full flex items-center justify-between p-1.5 rounded hover:bg-muted dark:hover:bg-muted text-left transition-colors"
                  >
                    <span className="text-xs font-medium text-secondary-foreground dark:text-muted-foreground">
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
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-muted dark:hover:bg-muted font-medium transition-colors"
              title="Change SmartArt Style"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
              <span>Styles</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showStyleDropdown && (
              <div
                className={`absolute ${
                  toolbarPos.isBelow && toolbarPos.top + 250 > window.innerHeight
                    ? 'bottom-full mb-1'
                    : 'top-full mt-1'
                } left-0 min-w-[180px] w-48 p-1.5 bg-card border border-secondary rounded-lg shadow-2xl dark:bg-[#111D29] dark:border-muted z-50 animate-in fade-in zoom-in-95 flex flex-col gap-0.5 whitespace-normal`}
              >
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground block border-b border-muted dark:border-muted/80 mb-0.5">
                  SmartArt Style
                </span>
                {(['flat', 'outline'] as SmartArtStyle[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleSelectStyle(st)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs capitalize text-left transition-colors ${
                      smartArt.style === st
                        ? 'font-bold text-primary bg-primary/10 dark:bg-navy-950/50 dark:text-primary'
                        : 'text-secondary-foreground hover:bg-muted dark:text-muted-foreground dark:hover:bg-muted'
                    }`}
                  >
                    <span>{st} Style</span>
                    {smartArt.style === st && (
                      <Check className="w-3.5 h-3.5 text-primary dark:text-primary shrink-0" />
                    )}
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
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-muted dark:hover:bg-muted font-medium transition-colors"
              title="Change SmartArt Layout"
            >
              <Layout className="w-3.5 h-3.5 text-success-500" />
              <span>Layout</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showLayoutDropdown && (
              <div className={`absolute ${toolbarPos.isBelow && toolbarPos.top + 250 > window.innerHeight ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 w-56 max-h-60 overflow-y-auto p-1.5 bg-card border border-secondary rounded-lg shadow-2xl dark:bg-[#111D29] dark:border-muted z-50 animate-in fade-in zoom-in-95`}>
                <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  {smartArt.category} Layouts
                </span>
                {categoryLayouts.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => handleSelectLayout(l.id)}
                    className={`w-full flex items-center justify-between p-1.5 rounded hover:bg-muted dark:hover:bg-muted text-left transition-colors ${
                      (smartArt.layoutId || smartArt.layout) === l.id ? 'bg-primary/10 dark:bg-navy-950/50 text-primary font-semibold' : ''
                    }`}
                  >
                    <span className="text-xs">{l.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-secondary dark:bg-secondary-foreground mx-0.5" />

          {/* Alignment */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => handleAlignment('left')}
              className={`p-1 rounded hover:bg-muted dark:hover:bg-muted ${
                smartArt.alignment === 'left' ? 'bg-muted dark:bg-muted text-primary' : ''
              }`}
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleAlignment('center')}
              className={`p-1 rounded hover:bg-muted dark:hover:bg-muted ${
                smartArt.alignment === 'center' ? 'bg-muted dark:bg-muted text-primary' : ''
              }`}
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleAlignment('right')}
              className={`p-1 rounded hover:bg-muted dark:hover:bg-muted ${
                smartArt.alignment === 'right' ? 'bg-muted dark:bg-muted text-primary' : ''
              }`}
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-px h-4 bg-secondary dark:bg-secondary-foreground mx-0.5" />

          {/* Delete */}
          <button
            type="button"
            onClick={onDeleteSmartArt}
            className="p-1 rounded hover:bg-destructive/10 text-destructive dark:hover:bg-destructive/50 transition-colors"
            title="Delete SmartArt Graphic"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>,
        document.body
      )}
    </>
  );
};
