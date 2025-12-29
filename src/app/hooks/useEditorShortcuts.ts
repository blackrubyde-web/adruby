import { useEffect } from 'react';

interface UseEditorShortcutsProps {
    onDelete: () => void;
    onGroup: () => void;
    onUngroup: () => void;
    onSelectAll?: () => void;
    onDeselectAll: () => void;
    onNudge: (x: number, y: number) => void;
    onCopy?: () => void;
    onPaste?: () => void;
    onDuplicate?: () => void;
    canGroup: boolean;
    canUngroup: boolean;
    selectedLayerIds: string[];
}

export const useEditorShortcuts = ({
    onDelete,
    onGroup,
    onUngroup,
    onDeselectAll,
    onNudge,
    onCopy,
    onPaste,
    onDuplicate,
    canGroup,
    canUngroup,
    selectedLayerIds
}: UseEditorShortcutsProps) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input or textarea
            if (
                document.activeElement?.tagName === 'INPUT' ||
                document.activeElement?.tagName === 'TEXTAREA' ||
                (document.activeElement as HTMLElement)?.isContentEditable
            ) {
                return;
            }

            const isCtrlOrCmd = e.ctrlKey || e.metaKey;
            const isShift = e.shiftKey;

            // Delete
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedLayerIds.length > 0) {
                    e.preventDefault();
                    onDelete();
                }
            }

            // Duplicate (Cmd+D)
            if (isCtrlOrCmd && e.key.toLowerCase() === 'd') {
                e.preventDefault();
                onDuplicate?.();
            }

            // Copy (Cmd+C)
            if (isCtrlOrCmd && e.key.toLowerCase() === 'c') {
                // e.preventDefault(); // Don't prevent default for copy usually, but custom implementation might need it
                // Actually, if we want to support system clipboard interaction, we might need to be careful.
                // For internal clipboard, we can prevent default.
                // Let's rely on internal for now.
                e.preventDefault();
                onCopy?.();
            }

            // Paste (Cmd+V)
            if (isCtrlOrCmd && e.key.toLowerCase() === 'v') {
                e.preventDefault();
                onPaste?.();
            }

            // Group (Cmd+G)
            if (isCtrlOrCmd && e.key.toLowerCase() === 'g' && !isShift) {
                e.preventDefault();
                if (canGroup) onGroup();
            }

            // Ungroup (Cmd+Shift+G)
            if (isCtrlOrCmd && e.key.toLowerCase() === 'g' && isShift) {
                e.preventDefault();
                if (canUngroup) onUngroup();
            }

            // Escape (Deselect)
            if (e.key === 'Escape') {
                e.preventDefault();
                onDeselectAll();
            }

            // Nudge (Arrow Keys)
            if (selectedLayerIds.length > 0) {
                const step = isShift ? 10 : 1;
                switch (e.key) {
                    case 'ArrowUp':
                        e.preventDefault();
                        onNudge(0, -step);
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        onNudge(0, step);
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        onNudge(-step, 0);
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        onNudge(step, 0);
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onDelete, onGroup, onUngroup, onDeselectAll, onNudge, onCopy, onPaste, onDuplicate, canGroup, canUngroup, selectedLayerIds]);
};
