/**
 * GRID SYSTEM
 * Enterprise-grade 12-column responsive grid for ad layout
 * Inspired by Bootstrap/Material Design grid systems
 * 
 * Features:
 * - Responsive breakpoints for different ad formats
 * - Safety zones to prevent text cutoff
 * - Automatic column/gutter calculation
 * - Snap-to-grid positioning
 */

export type AdFormat =
    | 'square'        // 1080x1080 (Instagram/Facebook Feed)
    | 'story'         // 1080x1920 (Instagram/Facebook Stories)  
    | 'landscape'     // 1200x628 (Facebook Link Preview)
    | 'portrait';     // 1080x1350 (Instagram Portrait)

export interface GridConfig {
    width: number;
    height: number;
    columns: number;
    gutterWidth: number;
    marginX: number;
    marginY: number;
    safeZone: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
}

export interface GridPosition {
    x: number;
    y: number;
    width: number;
    height: number;
    col: number;      // Column start (1-12)
    colSpan: number;  // Columns to span
    row: number;      // Row start (1-based)
    rowSpan: number;  // Rows to span
}

/**
 * Get grid configuration for specific ad format
 */
export function getGridConfig(format: AdFormat): GridConfig {
    const configs: Record<AdFormat, GridConfig> = {
        square: {
            width: 1080,
            height: 1080,
            columns: 12,
            gutterWidth: 20,
            marginX: 60,
            marginY: 60,
            safeZone: {
                top: 80,
                bottom: 80,
                left: 60,
                right: 60
            }
        },
        story: {
            width: 1080,
            height: 1920,
            columns: 12,
            gutterWidth: 20,
            marginX: 60,
            marginY: 120,  // More vertical margin for stories
            safeZone: {
                top: 240,      // Avoid Instagram UI overlays
                bottom: 240,   // Avoid swipe-up area
                left: 60,
                right: 60
            }
        },
        landscape: {
            width: 1200,
            height: 628,
            columns: 12,
            gutterWidth: 24,
            marginX: 80,
            marginY: 40,
            safeZone: {
                top: 60,
                bottom: 60,
                left: 80,
                right: 80
            }
        },
        portrait: {
            width: 1080,
            height: 1350,
            columns: 12,
            gutterWidth: 20,
            marginX: 60,
            marginY: 80,
            safeZone: {
                top: 100,
                bottom: 100,
                left: 60,
                right: 60
            }
        }
    };

    return configs[format];
}

/**
 * Calculate column width based on grid config
 */
export function getColumnWidth(config: GridConfig): number {
    const availableWidth = config.width - (config.marginX * 2);
    const totalGutterWidth = config.gutterWidth * (config.columns - 1);
    return (availableWidth - totalGutterWidth) / config.columns;
}

/**
 * Calculate position for element based on grid coordinates
 * @param col - Column start (1-12)
 * @param colSpan - Number of columns to span
 * @param row - Row start (1-based, each row is ~120px)
 * @param rowSpan - Number of rows to span
 */
export function calculateGridPosition(
    config: GridConfig,
    col: number,
    colSpan: number,
    row: number = 1,
    rowSpan: number = 1
): GridPosition {
    if (col < 1 || col > config.columns) {
        throw new Error(`Column must be between 1 and ${config.columns}`);
    }
    if (col + colSpan - 1 > config.columns) {
        throw new Error(`Column span exceeds grid (${col} + ${colSpan} > ${config.columns})`);
    }

    const columnWidth = getColumnWidth(config);
    const rowHeight = 120; // Standard row height

    // Calculate x position
    const x = config.marginX + ((col - 1) * (columnWidth + config.gutterWidth));

    // Calculate y position
    const y = config.marginY + ((row - 1) * rowHeight);

    // Calculate width (spanning multiple columns)
    const width = (colSpan * columnWidth) + ((colSpan - 1) * config.gutterWidth);

    // Calculate height (spanning multiple rows)
    const height = rowSpan * rowHeight;

    return {
        x,
        y,
        width,
        height,
        col,
        colSpan,
        row,
        rowSpan
    };
}

/**
 * Get safe area boundaries (excluding safety zones)
 */
export function getSafeArea(config: GridConfig): {
    x: number;
    y: number;
    width: number;
    height: number;
} {
    return {
        x: config.safeZone.left,
        y: config.safeZone.top,
        width: config.width - config.safeZone.left - config.safeZone.right,
        height: config.height - config.safeZone.top - config.safeZone.bottom
    };
}

/**
 * Check if position is within safe area
 */
export function isInSafeArea(
    position: { x: number; y: number; width: number; height: number },
    config: GridConfig
): boolean {
    const safe = getSafeArea(config);

    return (
        position.x >= safe.x &&
        position.y >= safe.y &&
        position.x + position.width <= safe.x + safe.width &&
        position.y + position.height <= safe.y + safe.height
    );
}

/**
 * Snap position to nearest grid column
 */
export function snapToGrid(
    x: number,
    config: GridConfig
): { col: number; x: number } {
    const columnWidth = getColumnWidth(config);
    const columnAndGutter = columnWidth + config.gutterWidth;

    // Find nearest column
    const relativeX = x - config.marginX;
    const col = Math.max(1, Math.min(
        config.columns,
        Math.round(relativeX / columnAndGutter) + 1
    ));

    // Calculate snapped x
    const snappedX = config.marginX + ((col - 1) * columnAndGutter);

    return { col, x: snappedX };
}

/**
 * Get centered position for element
 */
export function getCenteredPosition(
    config: GridConfig,
    colSpan: number,
    row: number = 1,
    rowSpan: number = 1
): GridPosition {
    const centerCol = Math.floor((config.columns - colSpan) / 2) + 1;
    return calculateGridPosition(config, centerCol, colSpan, row, rowSpan);
}

/**
 * Layout helper: Common positions for ad elements
 */
export const LayoutPresets = {
    /**
     * Full-width headline at top
     */
    headline: (config: GridConfig): GridPosition => {
        return calculateGridPosition(config, 1, 12, 1, 2);
    },

    /**
     * Centered product image
     */
    productCentered: (config: GridConfig): GridPosition => {
        return getCenteredPosition(config, 8, 4, 4);
    },

    /**
     * Large product (takes most space)
     */
    productHero: (config: GridConfig): GridPosition => {
        return getCenteredPosition(config, 10, 3, 5);
    },

    /**
     * CTA button at bottom center
     */
    ctaBottom: (config: GridConfig): GridPosition => {
        // For square format, use row 8; for story, use row 14
        const row = config.height >= 1800 ? 14 : 8;
        return getCenteredPosition(config, 6, row, 1);
    },

    /**
     * Description text below headline
     */
    description: (config: GridConfig): GridPosition => {
        return calculateGridPosition(config, 2, 10, 3, 1);
    },

    /**
     * Badge/logo in top-right corner
     */
    badgeTopRight: (config: GridConfig): GridPosition => {
        return calculateGridPosition(config, 10, 2, 1, 1);
    },

    /**
     * Social proof at bottom
     */
    socialProof: (config: GridConfig): GridPosition => {
        const row = config.height >= 1800 ? 16 : 9;
        return getCenteredPosition(config, 8, row, 1);
    }
};

/**
 * Grid debug overlay (for development/testing)
 */
export function generateGridOverlay(config: GridConfig): {
    columns: Array<{ x: number; width: number }>;
    safeArea: { x: number; y: number; width: number; height: number };
} {
    const columnWidth = getColumnWidth(config);
    const columns: Array<{ x: number; width: number }> = [];

    for (let i = 0; i < config.columns; i++) {
        const x = config.marginX + (i * (columnWidth + config.gutterWidth));
        columns.push({ x, width: columnWidth });
    }

    return {
        columns,
        safeArea: getSafeArea(config)
    };
}
