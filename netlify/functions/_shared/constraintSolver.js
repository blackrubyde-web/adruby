/**
 * Constraint Solver - Scene Graph to Layout Coordinates
 * 
 * Uses kiwi.js to solve constraints and convert Scene Graph relations
 * into precise pixel coordinates for rendering.
 * 
 * Architecture:
 * 1. Scene Graph (elements + relations) → Constraint Builder
 * 2. Constraint Builder → kiwi.js Variables & Constraints
 * 3. kiwi.js Solver → Solved Layout with x, y, width, height for each element
 */

import * as kiwi from 'kiwi.js';

// ============================================================
// TYPES
// ============================================================

/**
 * @typedef {Object} SceneElement
 * @property {string} id
 * @property {'image'|'text'|'arrow'|'badge'|'shape'|'table'|'cta'} type
 * @property {string} role
 * @property {number} priority
 * @property {Object} [props]
 */

/**
 * @typedef {Object} SceneRelation  
 * @property {string} from
 * @property {string} to
 * @property {'left_of'|'right_of'|'above'|'below'|'leads_to'|'near'|'overlay'|'inside'} type
 * @property {number} [gap]
 */

/**
 * @typedef {Object} LayoutRect
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {Object} SolvedLayout
 * @property {Record<string, LayoutRect>} elements
 * @property {number} canvasWidth
 * @property {number} canvasHeight
 */

// ============================================================
// CONSTRAINTS CONFIG
// ============================================================

const DEFAULT_CANVAS = {
    width: 1080,
    height: 1080
};

const DEFAULT_PADDING = 40;
const DEFAULT_GAP = 20;

// Default sizes based on element type and role
const SIZE_PRESETS = {
    image: {
        hero_product: { width: 600, height: 600 },
        product: { width: 400, height: 400 },
        before_state: { width: 480, height: 480 },
        after_state: { width: 480, height: 480 },
        screenshot: { width: 800, height: 500 },
        avatar: { width: 80, height: 80 },
        default: { width: 400, height: 400 }
    },
    text: {
        main_headline: { width: 900, height: 80 },
        headline: { width: 800, height: 60 },
        subheadline: { width: 700, height: 40 },
        body: { width: 600, height: 100 },
        label: { width: 200, height: 30 },
        default: { width: 400, height: 40 }
    },
    cta: {
        call_to_action: { width: 250, height: 60 },
        primary_cta: { width: 250, height: 60 },
        secondary_cta: { width: 200, height: 50 },
        default: { width: 220, height: 55 }
    },
    arrow: {
        default: { width: 60, height: 30 }
    },
    badge: {
        discount: { width: 100, height: 40 },
        new: { width: 80, height: 30 },
        default: { width: 90, height: 35 }
    },
    shape: {
        default: { width: 100, height: 100 }
    },
    table: {
        comparison: { width: 800, height: 300 },
        default: { width: 600, height: 200 }
    }
};

// ============================================================
// CONSTRAINT BUILDER CLASS
// ============================================================

export class ConstraintBuilder {
    constructor(canvasWidth = DEFAULT_CANVAS.width, canvasHeight = DEFAULT_CANVAS.height) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.solver = new kiwi.Solver();
        this.variables = new Map();
        this.elements = [];
    }

    /**
     * Get the default size for an element based on type and role
     */
    getDefaultSize(element) {
        const typePresets = SIZE_PRESETS[element.type] || SIZE_PRESETS.shape;
        return typePresets[element.role] || typePresets.default || { width: 200, height: 200 };
    }

    /**
     * Create kiwi variables for an element
     */
    createVariables(element) {
        const defaultSize = this.getDefaultSize(element);

        const vars = {
            x: new kiwi.Variable(`${element.id}_x`),
            y: new kiwi.Variable(`${element.id}_y`),
            width: new kiwi.Variable(`${element.id}_width`),
            height: new kiwi.Variable(`${element.id}_height`)
        };

        this.variables.set(element.id, vars);

        // Add size constraints (strong, but can be adjusted)
        this.solver.addEditVariable(vars.width, kiwi.Strength.strong);
        this.solver.addEditVariable(vars.height, kiwi.Strength.strong);
        this.solver.suggestValue(vars.width, defaultSize.width);
        this.solver.suggestValue(vars.height, defaultSize.height);

        // Ensure elements stay within canvas bounds
        this.solver.addConstraint(new kiwi.Constraint(
            vars.x,
            kiwi.Operator.Ge,
            DEFAULT_PADDING,
            kiwi.Strength.required
        ));
        this.solver.addConstraint(new kiwi.Constraint(
            vars.y,
            kiwi.Operator.Ge,
            DEFAULT_PADDING,
            kiwi.Strength.required
        ));
        this.solver.addConstraint(new kiwi.Constraint(
            new kiwi.Expression(vars.x, vars.width),
            kiwi.Operator.Le,
            this.canvasWidth - DEFAULT_PADDING,
            kiwi.Strength.required
        ));
        this.solver.addConstraint(new kiwi.Constraint(
            new kiwi.Expression(vars.y, vars.height),
            kiwi.Operator.Le,
            this.canvasHeight - DEFAULT_PADDING,
            kiwi.Strength.required
        ));

        return vars;
    }

    /**
     * Add a relational constraint between two elements
     */
    addRelation(relation) {
        const fromVars = this.variables.get(relation.from);
        const toVars = this.variables.get(relation.to);
        const gap = relation.gap ?? DEFAULT_GAP;

        if (!fromVars || !toVars) {
            console.warn(`[ConstraintBuilder] Missing variables for relation: ${relation.from} -> ${relation.to}`);
            return;
        }

        switch (relation.type) {
            case 'left_of':
                // from.right + gap <= to.left
                this.solver.addConstraint(new kiwi.Constraint(
                    new kiwi.Expression(fromVars.x, fromVars.width, gap),
                    kiwi.Operator.Le,
                    toVars.x,
                    kiwi.Strength.strong
                ));
                // Align vertically (centers)
                this.solver.addConstraint(new kiwi.Constraint(
                    new kiwi.Expression(fromVars.y, [0.5, fromVars.height]),
                    kiwi.Operator.Eq,
                    new kiwi.Expression(toVars.y, [0.5, toVars.height]),
                    kiwi.Strength.medium
                ));
                break;

            case 'right_of':
                // to.right + gap <= from.left
                this.solver.addConstraint(new kiwi.Constraint(
                    new kiwi.Expression(toVars.x, toVars.width, gap),
                    kiwi.Operator.Le,
                    fromVars.x,
                    kiwi.Strength.strong
                ));
                // Align vertically
                this.solver.addConstraint(new kiwi.Constraint(
                    new kiwi.Expression(fromVars.y, [0.5, fromVars.height]),
                    kiwi.Operator.Eq,
                    new kiwi.Expression(toVars.y, [0.5, toVars.height]),
                    kiwi.Strength.medium
                ));
                break;

            case 'above':
                // from.bottom + gap <= to.top
                this.solver.addConstraint(new kiwi.Constraint(
                    new kiwi.Expression(fromVars.y, fromVars.height, gap),
                    kiwi.Operator.Le,
                    toVars.y,
                    kiwi.Strength.strong
                ));
                // Align horizontally (centers)
                this.solver.addConstraint(new kiwi.Constraint(
                    new kiwi.Expression(fromVars.x, [0.5, fromVars.width]),
                    kiwi.Operator.Eq,
                    new kiwi.Expression(toVars.x, [0.5, toVars.width]),
                    kiwi.Strength.medium
                ));
                break;

            case 'below':
                // to.bottom + gap <= from.top
                this.solver.addConstraint(new kiwi.Constraint(
                    new kiwi.Expression(toVars.y, toVars.height, gap),
                    kiwi.Operator.Le,
                    fromVars.y,
                    kiwi.Strength.strong
                ));
                // Align horizontally
                this.solver.addConstraint(new kiwi.Constraint(
                    new kiwi.Expression(fromVars.x, [0.5, fromVars.width]),
                    kiwi.Operator.Eq,
                    new kiwi.Expression(toVars.x, [0.5, toVars.width]),
                    kiwi.Strength.medium
                ));
                break;

            case 'overlay':
                // Centers should be close
                this.solver.addConstraint(new kiwi.Constraint(
                    new kiwi.Expression(fromVars.x, [0.5, fromVars.width]),
                    kiwi.Operator.Eq,
                    new kiwi.Expression(toVars.x, [0.5, toVars.width]),
                    kiwi.Strength.medium
                ));
                this.solver.addConstraint(new kiwi.Constraint(
                    new kiwi.Expression(fromVars.y, [0.5, fromVars.height]),
                    kiwi.Operator.Eq,
                    new kiwi.Expression(toVars.y, [0.5, toVars.height]),
                    kiwi.Strength.medium
                ));
                break;

            case 'inside':
                // from is inside to (e.g., screenshot inside device)
                this.solver.addConstraint(new kiwi.Constraint(
                    fromVars.x,
                    kiwi.Operator.Ge,
                    new kiwi.Expression(toVars.x, gap),
                    kiwi.Strength.strong
                ));
                this.solver.addConstraint(new kiwi.Constraint(
                    fromVars.y,
                    kiwi.Operator.Ge,
                    new kiwi.Expression(toVars.y, gap),
                    kiwi.Strength.strong
                ));
                break;

            case 'near':
            case 'leads_to':
                // Loose proximity - just ensure they're not too far apart
                // For leads_to, arrows will be drawn between them
                break;

            default:
                console.warn(`[ConstraintBuilder] Unknown relation type: ${relation.type}`);
        }
    }

    /**
     * Add composition-specific constraints
     */
    addCompositionConstraints(composition, elements) {
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;

        switch (composition) {
            case 'product_focus': {
                // Hero product should be centered
                const heroProduct = elements.find(e => e.role === 'hero_product' || e.type === 'image');
                if (heroProduct) {
                    const vars = this.variables.get(heroProduct.id);
                    if (vars) {
                        this.solver.addConstraint(new kiwi.Constraint(
                            new kiwi.Expression(vars.x, [0.5, vars.width]),
                            kiwi.Operator.Eq,
                            centerX,
                            kiwi.Strength.strong
                        ));
                    }
                }
                break;
            }

            case 'before_after': {
                // Before and after images should be side by side
                const beforeEl = elements.find(e => e.role?.includes('before'));
                const afterEl = elements.find(e => e.role?.includes('after'));

                if (beforeEl && afterEl) {
                    const beforeVars = this.variables.get(beforeEl.id);
                    const afterVars = this.variables.get(afterEl.id);

                    if (beforeVars && afterVars) {
                        // Before on left third, After on right third
                        this.solver.addConstraint(new kiwi.Constraint(
                            new kiwi.Expression(beforeVars.x, [0.5, beforeVars.width]),
                            kiwi.Operator.Eq,
                            this.canvasWidth * 0.3,
                            kiwi.Strength.medium
                        ));
                        this.solver.addConstraint(new kiwi.Constraint(
                            new kiwi.Expression(afterVars.x, [0.5, afterVars.width]),
                            kiwi.Operator.Eq,
                            this.canvasWidth * 0.7,
                            kiwi.Strength.medium
                        ));
                        // Same Y position
                        this.solver.addConstraint(new kiwi.Constraint(
                            beforeVars.y,
                            kiwi.Operator.Eq,
                            afterVars.y,
                            kiwi.Strength.strong
                        ));
                    }
                }
                break;
            }

            case 'saas_dashboard': {
                // Device/screenshot should be centered upper half
                const screenshot = elements.find(e => e.type === 'image');
                if (screenshot) {
                    const vars = this.variables.get(screenshot.id);
                    if (vars) {
                        this.solver.addConstraint(new kiwi.Constraint(
                            new kiwi.Expression(vars.x, [0.5, vars.width]),
                            kiwi.Operator.Eq,
                            centerX,
                            kiwi.Strength.strong
                        ));
                        this.solver.addConstraint(new kiwi.Constraint(
                            vars.y,
                            kiwi.Operator.Eq,
                            this.canvasHeight * 0.15,
                            kiwi.Strength.medium
                        ));
                    }
                }
                break;
            }

            case 'grid': {
                // Distribute images in a grid pattern
                const images = elements.filter(e => e.type === 'image');
                const cols = Math.ceil(Math.sqrt(images.length));
                const cellWidth = (this.canvasWidth - 2 * DEFAULT_PADDING) / cols;

                images.forEach((img, i) => {
                    const col = i % cols;
                    const row = Math.floor(i / cols);
                    const vars = this.variables.get(img.id);

                    if (vars) {
                        this.solver.addConstraint(new kiwi.Constraint(
                            new kiwi.Expression(vars.x, [0.5, vars.width]),
                            kiwi.Operator.Eq,
                            DEFAULT_PADDING + cellWidth * (col + 0.5),
                            kiwi.Strength.medium
                        ));
                    }
                });
                break;
            }
        }

        // Text elements should be in the lower portion
        const textElements = elements.filter(e => e.type === 'text' || e.type === 'cta');
        textElements.forEach((el, i) => {
            const vars = this.variables.get(el.id);
            if (vars) {
                // Center horizontally
                this.solver.addConstraint(new kiwi.Constraint(
                    new kiwi.Expression(vars.x, [0.5, vars.width]),
                    kiwi.Operator.Eq,
                    centerX,
                    kiwi.Strength.medium
                ));
            }
        });
    }

    /**
     * Build and solve constraints for a scene graph
     */
    solve(sceneGraph) {
        const { elements, relations, composition } = sceneGraph;

        // Create variables for all elements
        elements.forEach(element => {
            this.createVariables(element);
            this.elements.push(element);
        });

        // Add relational constraints
        relations.forEach(relation => {
            this.addRelation(relation);
        });

        // Add composition-specific constraints
        this.addCompositionConstraints(composition, elements);

        // Solve
        this.solver.updateVariables();

        // Extract solved layout
        const layout = {
            elements: {},
            canvasWidth: this.canvasWidth,
            canvasHeight: this.canvasHeight
        };

        for (const element of elements) {
            const vars = this.variables.get(element.id);
            if (vars) {
                layout.elements[element.id] = {
                    x: Math.round(vars.x.value()),
                    y: Math.round(vars.y.value()),
                    width: Math.round(vars.width.value()),
                    height: Math.round(vars.height.value()),
                    type: element.type,
                    role: element.role,
                    priority: element.priority
                };
            }
        }

        return layout;
    }
}

/**
 * Main function to convert scene graph to layout
 */
export function solveLayout(sceneGraph, canvasWidth = 1080, canvasHeight = 1080) {
    const builder = new ConstraintBuilder(canvasWidth, canvasHeight);
    return builder.solve(sceneGraph);
}

export default { ConstraintBuilder, solveLayout };
