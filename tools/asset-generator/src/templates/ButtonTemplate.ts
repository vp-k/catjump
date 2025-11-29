import { ButtonAsset } from '../types.js';
import { SVGGenerator } from '../generators/SVGGenerator.js';

export class ButtonTemplate {
    private svgGen: SVGGenerator;

    constructor(svgGen: SVGGenerator) {
        this.svgGen = svgGen;
    }

    /**
     * Lighten a hex color by a percentage
     * @param hex - Hex color string (e.g., "#4CAF50")
     * @param percent - Amount to lighten (0.0 to 1.0)
     * @returns Lightened hex color
     */
    private lightenColor(hex: string, percent: number): string {
        // Remove # if present
        const cleanHex = hex.replace('#', '');

        // Parse RGB
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);

        // Lighten each component
        const lighten = (value: number) => Math.min(255, Math.floor(value + (255 - value) * percent));

        const newR = lighten(r).toString(16).padStart(2, '0');
        const newG = lighten(g).toString(16).padStart(2, '0');
        const newB = lighten(b).toString(16).padStart(2, '0');

        return `#${newR}${newG}${newB}`;
    }

    /**
     * Darken a hex color by a percentage
     * @param hex - Hex color string
     * @param percent - Amount to darken (0.0 to 1.0)
     * @returns Darkened hex color
     */
    private darkenColor(hex: string, percent: number): string {
        const cleanHex = hex.replace('#', '');

        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);

        const darken = (value: number) => Math.max(0, Math.floor(value * (1 - percent)));

        const newR = darken(r).toString(16).padStart(2, '0');
        const newG = darken(g).toString(16).padStart(2, '0');
        const newB = darken(b).toString(16).padStart(2, '0');

        return `#${newR}${newG}${newB}`;
    }

    render(asset: ButtonAsset, state: 'normal' | 'hover' | 'pressed' | 'disabled' = 'normal'): string {
        const { width, height, color, text, style } = asset;

        // Resolve color token to hex
        const baseColor = this.svgGen.getColor(color);
        let bgColor = baseColor;
        let yOffset = 0;
        let textColor = 'white';

        switch (state) {
            case 'hover':
                // Lighten the button color for hover effect
                bgColor = this.lightenColor(baseColor, 0.15);
                break;
            case 'pressed':
                // Darken slightly and push down
                bgColor = this.darkenColor(baseColor, 0.1);
                yOffset = 4;
                break;
            case 'disabled':
                bgColor = '#9E9E9E'; // Grey
                textColor = '#CCCCCC';
                break;
        }

        const rx = style === 'pill' ? height / 2 : (style === 'rounded' ? 10 : 0);

        const defs = `
      <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
        <feOffset dx="0" dy="4" result="offsetblur"/>
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.3"/>
        </feComponentTransfer>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    `;

        // Shadow rect (hidden when pressed)
        const shadow = state !== 'pressed'
            ? this.svgGen.rect(0, 4, width, height, 'rgba(0,0,0,0.2)', rx)
            : '';

        // Main button rect (use resolved bgColor directly, not token)
        const btn = `<rect x="0" y="${yOffset}" width="${width}" height="${height}" rx="${rx}" fill="${bgColor}" />`;

        // Text
        const txt = text
            ? `<text x="${width / 2}" y="${(height / 2) + yOffset}" fill="${textColor}" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${text}</text>`
            : '';

        return this.svgGen.createSVG(width, height + 4, `
      ${shadow}
      ${btn}
      ${txt}
    `, defs);
    }
}
