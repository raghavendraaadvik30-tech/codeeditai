/**
 * --------------------------------------------------------
 * Module: Track Changes
 * Feature: Main Track Changes Workspace Page
 * Description:
 * Primary panel view for Track Changes in the editor sidebar,
 * rendering the tracking controls and changes list in a clean white container.
 * --------------------------------------------------------
 */

import { TrackChangesPanel } from "../components/TrackChangesPanel";

export function TrackChangesPage() {
  return (
    <div className="flex h-full w-full flex-col select-none overflow-y-auto p-3.5 bg-card text-foreground dark:bg-[#0E1A29] dark:text-muted-foreground">
      <TrackChangesPanel />
    </div>
  );
}

export default TrackChangesPage;
