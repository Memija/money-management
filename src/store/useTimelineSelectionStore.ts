import { create } from 'zustand'

import {
  DEFAULT_TIMELINE_SELECTION,
  isSameTimelineSelection,
  type TimelineSelection,
} from '../utils/timeline-selection'

/** Sync group shared by all dashboard timeline charts. */
export const DASHBOARD_TIMELINE_SYNC_KEY = 'dashboard'

interface TimelineSelectionState {
  /** Selections per sync group (session only, intentionally not persisted). */
  selections: Record<string, TimelineSelection>
  setSelection: (syncKey: string, selection: TimelineSelection) => void
  resetSelections: () => void
}

export const useTimelineSelectionStore = create<TimelineSelectionState>((set) => ({
  selections: {},
  setSelection: (syncKey, selection) => {
    set((state) => {
      const current = state.selections[syncKey] ?? DEFAULT_TIMELINE_SELECTION
      if (isSameTimelineSelection(current, selection)) {
        return state
      }
      return { selections: { ...state.selections, [syncKey]: selection } }
    })
  },
  resetSelections: () => set({ selections: {} }),
}))
