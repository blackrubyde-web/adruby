/**
 * Granular Undo/Redo History Manager
 * Tracks individual layer changes for precise undo/redo
 */

import type { AdDocument } from '../types/studio';

export interface HistoryEntry {
    id: string;
    timestamp: number;
    action: 'add' | 'delete' | 'modify' | 'move' | 'resize' | 'style' | 'batch';
    description: string;
    before: AdDocument;
    after: AdDocument;
    affectedLayerIds: string[];
}

export interface HistoryState {
    entries: HistoryEntry[];
    currentIndex: number;
    maxSize: number;
}

const MAX_HISTORY_SIZE = 50;

/**
 * Create initial history state
 */
export function createHistoryState(initialDoc: AdDocument): HistoryState {
    return {
        entries: [{
            id: 'initial',
            timestamp: Date.now(),
            action: 'batch',
            description: 'Initial state',
            before: initialDoc,
            after: initialDoc,
            affectedLayerIds: []
        }],
        currentIndex: 0,
        maxSize: MAX_HISTORY_SIZE
    };
}

/**
 * Add entry to history
 */
export function addHistoryEntry(
    state: HistoryState,
    before: AdDocument,
    after: AdDocument,
    action: HistoryEntry['action'],
    description: string,
    affectedLayerIds: string[] = []
): HistoryState {
    // Remove any entries after current index (when branching from middle of history)
    const newEntries = state.entries.slice(0, state.currentIndex + 1);

    // Create new entry
    const entry: HistoryEntry = {
        id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        action,
        description,
        before,
        after,
        affectedLayerIds
    };

    newEntries.push(entry);

    // Limit history size
    if (newEntries.length > state.maxSize) {
        newEntries.shift();
    }

    return {
        ...state,
        entries: newEntries,
        currentIndex: newEntries.length - 1
    };
}

/**
 * Undo to previous state
 */
export function undo(state: HistoryState): { newState: HistoryState; document: AdDocument } | null {
    if (state.currentIndex <= 0) {
        return null; // Nothing to undo
    }

    const newIndex = state.currentIndex - 1;
    const entry = state.entries[newIndex];

    return {
        newState: {
            ...state,
            currentIndex: newIndex
        },
        document: entry.after
    };
}

/**
 * Redo to next state
 */
export function redo(state: HistoryState): { newState: HistoryState; document: AdDocument } | null {
    if (state.currentIndex >= state.entries.length - 1) {
        return null; // Nothing to redo
    }

    const newIndex = state.currentIndex + 1;
    const entry = state.entries[newIndex];

    return {
        newState: {
            ...state,
            currentIndex: newIndex
        },
        document: entry.after
    };
}

/**
 * Get current entry
 */
export function getCurrentEntry(state: HistoryState): HistoryEntry {
    return state.entries[state.currentIndex];
}

/**
 * Can undo?
 */
export function canUndo(state: HistoryState): boolean {
    return state.currentIndex > 0;
}

/**
 * Can redo?
 */
export function canRedo(state: HistoryState): boolean {
    return state.currentIndex < state.entries.length - 1;
}

/**
 * Get history preview (for UI timeline)
 */
export function getHistoryPreview(state: HistoryState, range: number = 5): HistoryEntry[] {
    const start = Math.max(0, state.currentIndex - range);
    const end = Math.min(state.entries.length, state.currentIndex + range + 1);
    return state.entries.slice(start, end);
}

/**
 * Jump to specific history entry
 */
export function jumpToEntry(state: HistoryState, entryId: string): { newState: HistoryState; document: AdDocument } | null {
    const index = state.entries.findIndex(e => e.id === entryId);

    if (index === -1) {
        return null;
    }

    return {
        newState: {
            ...state,
            currentIndex: index
        },
        document: state.entries[index].after
    };
}

/**
 * Compress history by merging similar consecutive entries
 */
export function compressHistory(state: HistoryState): HistoryState {
    if (state.entries.length <= 2) {
        return state;
    }

    const compressed: HistoryEntry[] = [];
    let lastEntry = state.entries[0];
    compressed.push(lastEntry);

    for (let i = 1; i < state.entries.length; i++) {
        const entry = state.entries[i];

        // Merge if same action and within 2 seconds
        const timeDiff = entry.timestamp - lastEntry.timestamp;
        if (
            entry.action === lastEntry.action &&
            timeDiff < 2000 &&
            arraysEqual(entry.affectedLayerIds, lastEntry.affectedLayerIds)
        ) {
            // Update last entry instead of adding new one
            lastEntry = {
                ...lastEntry,
                after: entry.after,
                description: `${lastEntry.description} (merged)`
            };
            compressed[compressed.length - 1] = lastEntry;
        } else {
            compressed.push(entry);
            lastEntry = entry;
        }
    }

    return {
        ...state,
        entries: compressed,
        currentIndex: Math.min(state.currentIndex, compressed.length - 1)
    };
}

function arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
}

/**
 * Clear history (keep only current state)
 */
export function clearHistory(state: HistoryState, currentDoc: AdDocument): HistoryState {
    return createHistoryState(currentDoc);
}
