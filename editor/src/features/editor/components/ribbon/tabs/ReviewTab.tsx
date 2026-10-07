/**
 * --------------------------------------------------------
 * Module: Ribbon
 * Feature: Review Tab Toolbar
 * Description:
 * Ribbon tab providing complete Track Changes and Review workflow controls:
 * tracking toggle, previous/next revision navigation, individual accept/reject,
 * mass accept/reject, and visual markup show/hide toggles.
 * --------------------------------------------------------
 */

import {
  GitCompare,
  Check,
  X as XIcon,
  CheckCheck,
  Ban,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ListFilter,
} from "lucide-react";
import RibbonButton from "../controls/RibbonButton";
import RibbonDivider from "../controls/RibbonDivider";
import { useTrackChanges } from "@/features/editor/modules/trackChanges";
import { useEditor } from "@/features/editor/context/EditorContext";

export default function ReviewTab() {
  const {
    trackChanges,
    toggleTrackChanges,
    pendingChanges,
    showMarkup,
    setShowMarkup,
    acceptAll,
    rejectAll,
    acceptChange,
    rejectChange,
    prevChange,
    nextChange,
    activeChangeId,
  } = useTrackChanges();

  const { setActivePanel, setLeftPanelOpen } = useEditor();

  const getActiveChangeId = (): string | null => {
    if (activeChangeId) return activeChangeId;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const node = sel.getRangeAt(0).startContainer;
    const el = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
    if (el instanceof HTMLElement) {
      const tcEl = el.closest("[data-tc-id]");
      return tcEl?.getAttribute("data-tc-id") ?? null;
    }
    return null;
  };

  const handleAcceptActive = () => {
    const id = getActiveChangeId();
    if (id) {
      acceptChange(id);
    } else {
      const first = document.querySelector("[data-tc-id]");
      const firstId = first?.getAttribute("data-tc-id");
      if (firstId) acceptChange(firstId);
    }
  };

  const handleRejectActive = () => {
    const id = getActiveChangeId();
    if (id) {
      rejectChange(id);
    } else {
      const first = document.querySelector("[data-tc-id]");
      const firstId = first?.getAttribute("data-tc-id");
      if (firstId) rejectChange(firstId);
    }
  };

  const handleOpenPanel = () => {
    setActivePanel("trackChanges");
    setLeftPanelOpen(true);
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* 1. TRACK CHANGES TOGGLE */}
      <RibbonButton
        icon={<GitCompare className="h-4 w-4" />}
        onClick={toggleTrackChanges}
        className={
          trackChanges
            ? "bg-primary/10 text-[#0078d4] font-semibold border border-primary/30 hover:bg-primary/15"
            : ""
        }
        title={trackChanges ? "Track Changes is ON (Ctrl+Shift+E)" : "Track Changes is OFF (Ctrl+Shift+E)"}
      >
        <span>{trackChanges ? "Tracking ON" : "Track Changes"}</span>
        {pendingChanges > 0 && (
          <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-[0.8px] text-[10px] font-bold text-amber-800 border border-amber-300">
            {pendingChanges}
          </span>
        )}
      </RibbonButton>

      <RibbonDivider />

      {/* 2. NAVIGATION: PREVIOUS & NEXT */}
      <RibbonButton
        icon={<ChevronLeft className="h-4 w-4" />}
        onClick={prevChange}
        disabled={pendingChanges === 0}
        title="Go to Previous Change"
      >
        Prev
      </RibbonButton>

      <RibbonButton
        icon={<ChevronRight className="h-4 w-4" />}
        onClick={nextChange}
        disabled={pendingChanges === 0}
        title="Go to Next Change"
      >
        Next
      </RibbonButton>

      <RibbonDivider />

      {/* 3. INDIVIDUAL ACCEPT & REJECT */}
      <RibbonButton
        icon={<Check className="h-4 w-4 text-emerald-600" />}
        onClick={handleAcceptActive}
        disabled={pendingChanges === 0}
        title="Accept Selected Change"
      >
        Accept
      </RibbonButton>

      <RibbonButton
        icon={<XIcon className="h-4 w-4 text-destructive" />}
        onClick={handleRejectActive}
        disabled={pendingChanges === 0}
        title="Reject Selected Change"
      >
        Reject
      </RibbonButton>

      <RibbonDivider />

      {/* 4. MASS ACCEPT ALL & REJECT ALL */}
      <RibbonButton
        icon={<CheckCheck className="h-4 w-4 text-emerald-600" />}
        onClick={acceptAll}
        disabled={pendingChanges === 0}
        title="Accept All Pending Changes in Document"
      >
        Accept All
      </RibbonButton>

      <RibbonButton
        icon={<Ban className="h-4 w-4 text-destructive" />}
        onClick={rejectAll}
        disabled={pendingChanges === 0}
        title="Reject All Pending Changes in Document"
      >
        Reject All
      </RibbonButton>

      <RibbonDivider />

      {/* 5. VISUAL MARKUP TOGGLES */}
      <RibbonButton
        icon={<Eye className="h-4 w-4" />}
        onClick={() => setShowMarkup(true)}
        className={showMarkup ? "bg-primary/10 text-[#0078d4] font-semibold" : ""}
        title="Show visual track changes markup tags"
      >
        Show Markup
      </RibbonButton>

      <RibbonButton
        icon={<EyeOff className="h-4 w-4" />}
        onClick={() => setShowMarkup(false)}
        className={!showMarkup ? "bg-primary/10 text-[#0078d4] font-semibold" : ""}
        title="Hide visual track changes markup (clean document preview)"
      >
        Hide Markup
      </RibbonButton>

      <RibbonDivider />

      {/* 6. OPEN SIDEBAR REVIEW PANEL */}
      <RibbonButton
        icon={<ListFilter className="h-4 w-4" />}
        onClick={handleOpenPanel}
        title="Open Track Changes Review Panel in Sidebar"
      >
        Reviewing Pane
      </RibbonButton>
    </div>
  );
}