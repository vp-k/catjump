import { MedalAsset } from '../types.js';
import { SVGGenerator } from '../generators/SVGGenerator.js';

export class MedalTemplate {
    private svgGen: SVGGenerator;

    constructor(svgGen: SVGGenerator) {
        this.svgGen = svgGen;
    }

    render(asset: MedalAsset): string {
        const { width, height, type } = asset;
        const cx = width / 2;
        const cy = height / 2;
        const r = Math.min(width, height) * 0.4;

        const colors: Record<string, { main: string; accent: string; shine: string }> = {
            bronze: { main: '#CD7F32', accent: '#8B4513', shine: '#DDA15E' },
            silver: { main: '#C0C0C0', accent: '#808080', shine: '#E8E8E8' },
            gold: { main: '#FFD700', accent: '#DAA520', shine: '#FFEC8B' },
            platinum: { main: '#E5E4E2', accent: '#A9A9A9', shine: '#FFFFFF' },
            diamond: { main: '#B9F2FF', accent: '#00CED1', shine: '#FFFFFF' }
        };

        const c = colors[type] || colors.bronze;

        const defs = `
            <linearGradient id="medalGrad_${type}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${c.shine};stop-opacity:1" />
                <stop offset="50%" style="stop-color:${c.main};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${c.accent};stop-opacity:1" />
            </linearGradient>
            <filter id="medalShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="4" stdDeviation="3" flood-opacity="0.3"/>
            </filter>
        `;

        // Medal ribbon
        const ribbon = `
            <path d="M${cx - r * 0.3},${cy - r * 0.8} L${cx - r * 0.5},${cy - r * 1.4} L${cx - r * 0.1},${cy - r * 1.1} L${cx + r * 0.1},${cy - r * 1.1} L${cx + r * 0.5},${cy - r * 1.4} L${cx + r * 0.3},${cy - r * 0.8} Z"
                  fill="#E53935" stroke="#B71C1C" stroke-width="1"/>
        `;

        // Main medal circle
        const medal = `
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#medalGrad_${type})" filter="url(#medalShadow)" stroke="${c.accent}" stroke-width="3"/>
        `;

        // Inner decoration
        const inner = `
            <circle cx="${cx}" cy="${cy}" r="${r * 0.75}" fill="none" stroke="${c.accent}" stroke-width="2"/>
        `;

        // Star or symbol in center
        const symbol = this.getSymbol(type, cx, cy, r * 0.4);

        // Shine effect
        const shine = `
            <ellipse cx="${cx - r * 0.3}" cy="${cy - r * 0.3}" rx="${r * 0.15}" ry="${r * 0.1}" fill="${c.shine}" opacity="0.6"/>
        `;

        return this.svgGen.createSVG(width, height, `
            ${ribbon}
            ${medal}
            ${inner}
            ${symbol}
            ${shine}
        `, defs);
    }

    private getSymbol(type: string, cx: number, cy: number, size: number): string {
        const symbols: Record<string, string> = {
            bronze: '3',
            silver: '2',
            gold: '1',
            platinum: '★',
            diamond: '◆'
        };
        const symbol = symbols[type] || '★';
        return `<text x="${cx}" y="${cy}" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="${size}" font-weight="bold" text-anchor="middle" dominant-baseline="middle" stroke="#00000033" stroke-width="1">${symbol}</text>`;
    }
}
