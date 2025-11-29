import { TutorialAsset } from '../types.js';
import { SVGGenerator } from '../generators/SVGGenerator.js';

export class TutorialTemplate {
    private svgGen: SVGGenerator;

    constructor(svgGen: SVGGenerator) {
        this.svgGen = svgGen;
    }

    render(asset: TutorialAsset): string {
        const { width, height, type } = asset;

        switch (type) {
            case 'hand':
                return this.renderHand(width, height);
            case 'arrow':
                return this.renderArrow(width, height);
            case 'highlight':
                return this.renderHighlight(width, height);
            case 'perfect_zone':
                return this.renderPerfectZone(width, height);
            case 'speech_bubble':
                return this.renderSpeechBubble(width, height);
            default:
                return this.svgGen.createSVG(width, height, '');
        }
    }

    private renderHand(w: number, h: number): string {
        // Pointing hand/finger icon - simplified geometric version
        // Designer can upgrade this later with actual hand illustration
        const cx = w / 2;
        const cy = h / 2;
        const scale = Math.min(w, h) / 64;

        const defs = `
            <filter id="handGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                <feOffset dx="0" dy="0"/>
                <feComponentTransfer>
                    <feFuncA type="linear" slope="0.5"/>
                </feComponentTransfer>
                <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        `;

        // Finger pointing down (simplified)
        const content = `
            <g transform="translate(${cx - 32 * scale}, ${cy - 32 * scale}) scale(${scale})" filter="url(#handGlow)">
                <!-- Finger body -->
                <ellipse cx="32" cy="24" rx="10" ry="18" fill="#FFCC80"/>
                <ellipse cx="32" cy="24" rx="10" ry="18" fill="#FFE0B2" transform="translate(-2, -2) scale(0.9)"/>
                <!-- Fingertip -->
                <ellipse cx="32" cy="44" rx="8" ry="6" fill="#FFCC80"/>
                <!-- Tap indicator circle -->
                <circle cx="32" cy="54" r="8" fill="none" stroke="#4CAF50" stroke-width="3" opacity="0.8"/>
                <circle cx="32" cy="54" r="4" fill="#4CAF50" opacity="0.6"/>
            </g>
        `;

        return this.svgGen.createSVG(w, h, content, defs);
    }

    private renderArrow(w: number, h: number): string {
        const cx = w / 2;
        const cy = h / 2;
        const size = Math.min(w, h) * 0.8;

        const defs = `
            <filter id="arrowGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                <feOffset dx="0" dy="0"/>
                <feComponentTransfer>
                    <feFuncA type="linear" slope="0.6"/>
                </feComponentTransfer>
                <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        `;

        // Arrow pointing down
        const arrowH = size * 0.7;
        const arrowW = size * 0.5;
        const content = `
            <g filter="url(#arrowGlow)">
                <polygon points="${cx},${cy + arrowH / 2} ${cx - arrowW / 2},${cy - arrowH / 4} ${cx - arrowW / 4},${cy - arrowH / 4} ${cx - arrowW / 4},${cy - arrowH / 2} ${cx + arrowW / 4},${cy - arrowH / 2} ${cx + arrowW / 4},${cy - arrowH / 4} ${cx + arrowW / 2},${cy - arrowH / 4}"
                          fill="#4CAF50" stroke="#FFFFFF" stroke-width="2"/>
            </g>
        `;

        return this.svgGen.createSVG(w, h, content, defs);
    }

    private renderHighlight(w: number, h: number): string {
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.min(w, h) / 2 - 4;

        const defs = `
            <radialGradient id="highlightGrad" cx="50%" cy="50%" r="50%">
                <stop offset="70%" style="stop-color:#FFFFFF;stop-opacity:0" />
                <stop offset="85%" style="stop-color:#4CAF50;stop-opacity:0.4" />
                <stop offset="100%" style="stop-color:#4CAF50;stop-opacity:0.8" />
            </radialGradient>
        `;

        const content = `
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#highlightGrad)"/>
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#4CAF50" stroke-width="4" stroke-dasharray="10,5"/>
        `;

        return this.svgGen.createSVG(w, h, content, defs);
    }

    private renderPerfectZone(w: number, h: number): string {
        const rx = 8;
        const defs = `
            <linearGradient id="perfectZoneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:0.8" />
                <stop offset="50%" style="stop-color:#66BB6A;stop-opacity:0.6" />
                <stop offset="100%" style="stop-color:#4CAF50;stop-opacity:0.8" />
            </linearGradient>
        `;

        const content = `
            <rect x="4" y="4" width="${w - 8}" height="${h - 8}" rx="${rx}" fill="url(#perfectZoneGrad)" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="8,4"/>
            <text x="${w / 2}" y="${h / 2}" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" dominant-baseline="middle">PERFECT</text>
        `;

        return this.svgGen.createSVG(w, h, content, defs);
    }

    private renderSpeechBubble(w: number, h: number): string {
        const rx = 16;
        const tailH = h * 0.2;
        const bodyH = h - tailH;

        const content = `
            <rect x="4" y="4" width="${w - 8}" height="${bodyH - 8}" rx="${rx}" fill="#FFFFFF" stroke="#333333" stroke-width="2"/>
            <polygon points="${w * 0.3},${bodyH - 4} ${w * 0.4},${h - 4} ${w * 0.5},${bodyH - 4}" fill="#FFFFFF" stroke="#333333" stroke-width="2"/>
            <line x1="${w * 0.3}" y1="${bodyH - 5}" x2="${w * 0.5}" y2="${bodyH - 5}" stroke="#FFFFFF" stroke-width="4"/>
        `;

        return this.svgGen.createSVG(w, h, content);
    }
}
