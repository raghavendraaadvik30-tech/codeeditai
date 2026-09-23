/**
 * --------------------------------------------------------
 * Module: Track Changes
 * Feature: useTrackChanges Hook
 * Description:
 * Public consumer hook for track changes state, action dispatches,
 * and review workflow operations.
 * --------------------------------------------------------
 */

import { useContext } from "react";
import { TrackChangesContext } from "../context/TrackChangesContext";

export function useTrackChanges() {
  const context = useContext(TrackChangesContext);
  if (!context) {
    throw new Error("useTrackChanges must be used within <TrackChangesProvider>");
  }
  return context;
}

export default useTrackChanges;
