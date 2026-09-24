/**
 * --------------------------------------------------------
 * Module: Track Changes
 * Feature: Main Track Changes Workspace Page
 * Description:
 * Primary panel view for Track Changes in the editor sidebar,
 * rendering the tracking controls and changes list.
 * --------------------------------------------------------
 */

import { TrackChangesPanel } from "../components/TrackChangesPanel";

export function TrackChangesPage() {
  return (
    <div className="flex h-full w-full flex-col select-none overflow-y-auto p-4 bg-[#0d1117] text-slate-200">
      <TrackChangesPanel />
    </div>
  );
}

export default TrackChangesPage;
