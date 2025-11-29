/**
 * CanvasGenerator - Placeholder for future Canvas-based asset generation
 *
 * Phase 1 uses SVG-only approach for all visual assets.
 * This file is kept for Phase 2 when Canvas-based effects (particles, complex FX) are needed.
 *
 * Future implementation will use node-canvas for:
 * - Particle effects (sparkle, glow)
 * - Complex gradients and filters
 * - Pixel manipulation
 *
 * @see implementation_plan.md for details on Phase 2 scope
 */

import { Palette } from '../types.js';

export class CanvasGenerator {
    private palette: Palette;

    constructor(palette: Palette) {
        this.palette = palette;
    }

    /**
     * Get color value from palette token
     */
    getColor(token: string): string {
        return this.palette.colors[token] || token;
    }

    /**
     * Create a canvas context - Not implemented in Phase 1
     * @throws Error indicating Canvas is not available
     */
    create(_width: number, _height: number): never {
        throw new Error(
            'CanvasGenerator is not implemented in Phase 1. ' +
            'Use SVGGenerator for visual assets. ' +
            'See implementation_plan.md for Phase 2 Canvas support.'
        );
    }

    /**
     * Generate particle effect - Not implemented in Phase 1
     * @throws Error indicating Canvas is not available
     */
    generateParticle(_type: 'sparkle' | 'glow', _color: string, _size: number = 32): never {
        throw new Error(
            'Particle generation requires Canvas (Phase 2). ' +
            'Use CSS/WebGL particles in-game for now.'
        );
    }
}
