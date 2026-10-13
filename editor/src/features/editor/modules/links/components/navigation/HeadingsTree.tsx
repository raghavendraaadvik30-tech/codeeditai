/**
 * --------------------------------------------------------
 * Module: Links / Navigation
 * Component: HeadingsTree
 * Renders hierarchical document outline tree with collapse/expand chevrons,
 * active item full-width highlight, and smooth navigation.
 * --------------------------------------------------------
 */

import { useState, useEffect, type MouseEvent } from 'react';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import type { HeadingNode } from '../../types/navigation.types';
import { navigationOutlineService } from '../../services/NavigationOutlineService';
import { cn } from '@/lib/utils';

interface HeadingsTreeProps {
  nodes: HeadingNode[];
  activeHeadingId: string | null;
  searchQuery: string;
  onSelectHeading: (node: HeadingNode) => void;
  collapsedIds?: Set<string>;
  onToggleCollapse?: (id: string) => void;
}

interface HeadingItemRowProps {
  node: HeadingNode;
  activeHeadingId: string | null;
  searchQuery: string;
  depth: number;
  collapsedIds: Set<string>;
  onToggleCollapse: (id: string) => void;
  onSelectHeading: (node: HeadingNode) => void;
}

function HeadingItemRow({
  node,
  activeHeadingId,
  searchQuery,
  depth,
  collapsedIds,
  onToggleCollapse,
  onSelectHeading,
}: HeadingItemRowProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isCollapsed = collapsedIds.has(node.id);
  const isActive = activeHeadingId === node.id;
  const isMatch = Boolean(searchQuery && node.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleChevronClick = (e: MouseEvent) => {
    e.stopPropagation();
    onToggleCollapse(node.id);
  };

  const handleRowClick = () => {
    onSelectHeading(node);
  };

  // Indentation padding based on hierarchy level
  const paddingLeft = `${Math.max(4, depth * 16 + 6)}px`;

  return (
    <div className="flex flex-col w-full">
      <div
        role="button"
        tabIndex={0}
        onClick={handleRowClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleRowClick();
          }
        }}
        className={cn(
          'group relative flex items-center min-h-7 py-1 pr-2 rounded-md transition-colors text-xs select-none cursor-pointer',
          isActive
            ? 'bg-[#E8F0FE] text-[#1967D2] font-semibold dark:bg-[#1E3A8A]/40 dark:text-[#60A5FA]'
            : 'text-slate-800 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-slate-800/60',
          isMatch && !isActive && 'bg-amber-50 dark:bg-amber-950/30 font-medium'
        )}
        style={{ paddingLeft }}
      >
        {/* Collapse / Expand Chevron for parents */}
        <div className="w-4 h-4 flex items-center justify-center shrink-0 mr-1">
          {hasChildren ? (
            <button
              type="button"
              onClick={handleChevronClick}
              className="p-0.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
              aria-label={isCollapsed ? 'Expand heading' : 'Collapse heading'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          ) : (
            <span className="w-3.5" />
          )}
        </div>

        {/* Heading Title */}
        <span className="truncate flex-1" title={node.title}>
          {node.title}
        </span>

        {/* Search match badge */}
        {isMatch && (
          <span className="shrink-0 text-[10px] px-1 py-0.2 rounded bg-amber-200/80 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 font-medium ml-1">
            match
          </span>
        )}
      </div>

      {/* Render Children Recursively */}
      {hasChildren && !isCollapsed && (
        <div className="flex flex-col w-full">
          {node.children.map((child) => (
            <HeadingItemRow
              key={child.id}
              node={child}
              activeHeadingId={activeHeadingId}
              searchQuery={searchQuery}
              depth={depth + 1}
              collapsedIds={collapsedIds}
              onToggleCollapse={onToggleCollapse}
              onSelectHeading={onSelectHeading}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function HeadingsTree({
  nodes,
  activeHeadingId,
  searchQuery,
  onSelectHeading,
  collapsedIds: propCollapsedIds,
  onToggleCollapse: propOnToggleCollapse,
}: HeadingsTreeProps) {
  const [internalCollapsed, setInternalCollapsed] = useState<Set<string>>(new Set());

  const collapsedIds = propCollapsedIds ?? internalCollapsed;
  const toggleCollapse =
    propOnToggleCollapse ??
    ((id: string) => {
      setInternalCollapsed((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    });

  // When search query is entered, auto-expand parents of matching headings
  useEffect(() => {
    if (searchQuery.trim()) {
      const matchAncestors = navigationOutlineService.getAncestorIdsForMatches(nodes);
      if (matchAncestors.size > 0) {
        setInternalCollapsed((prev) => {
          const next = new Set(prev);
          matchAncestors.forEach((id) => next.delete(id));
          return next;
        });
      }
    }
  }, [searchQuery, nodes]);

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 dark:text-slate-500">
        <FileText className="h-8 w-8 mb-2 opacity-50 stroke-[1.5]" />
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          No headings found
        </p>
        <p className="text-[11px] mt-1 max-w-[220px] leading-relaxed">
          Format headings in your document using Heading styles (or numbered sections like Chapter 1, 1.1) to view the outline here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full py-1 space-y-0.5">
      {nodes.map((node) => (
        <HeadingItemRow
          key={node.id}
          node={node}
          activeHeadingId={activeHeadingId}
          searchQuery={searchQuery}
          depth={0}
          collapsedIds={collapsedIds}
          onToggleCollapse={toggleCollapse}
          onSelectHeading={onSelectHeading}
        />
      ))}
    </div>
  );
}
