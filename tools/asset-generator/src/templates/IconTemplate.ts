import { IconAsset } from '../types.js';
import { SVGGenerator } from '../generators/SVGGenerator.js';

export class IconTemplate {
    private svgGen: SVGGenerator;

    constructor(svgGen: SVGGenerator) {
        this.svgGen = svgGen;
    }

    render(asset: IconAsset): string {
        const { size, color, type } = asset;
        const center = size / 2;
        const r = size * 0.4;

        let content = '';

        switch (type) {
            case 'coin':
                content = `
          ${this.svgGen.circle(center, center, r, color)}
          ${this.svgGen.text(center, center, '$', 'white', size * 0.5)}
        `;
                break;
            case 'star':
                // Simple star polygon
                const points = "32,2 42,22 62,22 46,36 52,58 32,46 12,58 18,36 2,22 22,22"; // Approx for 64x64
                content = `<polygon points="${points}" fill="${this.svgGen.getColor(color)}" transform="scale(${size / 64})" />`;
                break;
            case 'heart':
                content = `<path d="M32 58 C 8 38 2 26 2 16 A 14 14 0 0 1 32 16 A 14 14 0 0 1 62 16 C 62 26 56 38 32 58 Z" fill="${this.svgGen.getColor(color)}" transform="scale(${size / 64})" />`;
                break;
            case 'diamond':
                content = `<polygon points="32,4 58,32 32,60 6,32" fill="${this.svgGen.getColor(color)}" stroke="#FFFFFF" stroke-width="2" transform="scale(${size / 64})" />`;
                break;
            case 'check':
                content = `<path d="M14 32 L28 46 L50 18" fill="none" stroke="${this.svgGen.getColor(color)}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" transform="scale(${size / 64})" />`;
                break;
            case 'volume':
                content = `<g transform="scale(${size / 64})"><polygon points="8,24 8,40 18,40 32,52 32,12 18,24" fill="${this.svgGen.getColor(color)}"/><path d="M40 20 Q52 32 40 44" fill="none" stroke="${this.svgGen.getColor(color)}" stroke-width="4" stroke-linecap="round"/><path d="M46 14 Q62 32 46 50" fill="none" stroke="${this.svgGen.getColor(color)}" stroke-width="4" stroke-linecap="round"/></g>`;
                break;
            case 'music':
                content = `<g transform="scale(${size / 64})"><ellipse cx="20" cy="48" rx="10" ry="8" fill="${this.svgGen.getColor(color)}"/><ellipse cx="48" cy="44" rx="10" ry="8" fill="${this.svgGen.getColor(color)}"/><rect x="28" y="12" width="4" height="40" fill="${this.svgGen.getColor(color)}"/><rect x="56" y="8" width="4" height="40" fill="${this.svgGen.getColor(color)}"/><rect x="28" y="8" width="32" height="8" fill="${this.svgGen.getColor(color)}"/></g>`;
                break;
            case 'mission':
                content = `<g transform="scale(${size / 64})"><rect x="12" y="8" width="40" height="48" rx="4" fill="${this.svgGen.getColor(color)}" opacity="0.3"/><rect x="12" y="8" width="40" height="48" rx="4" fill="none" stroke="${this.svgGen.getColor(color)}" stroke-width="3"/><line x1="20" y1="24" x2="44" y2="24" stroke="${this.svgGen.getColor(color)}" stroke-width="3"/><line x1="20" y1="34" x2="44" y2="34" stroke="${this.svgGen.getColor(color)}" stroke-width="3"/><line x1="20" y1="44" x2="36" y2="44" stroke="${this.svgGen.getColor(color)}" stroke-width="3"/></g>`;
                break;
            case 'trophy':
                content = `<g transform="scale(${size / 64})"><path d="M18 8 L18 24 C18 36 32 42 32 42 C32 42 46 36 46 24 L46 8 Z" fill="${this.svgGen.getColor(color)}"/><path d="M18 12 L8 12 L8 20 C8 26 14 28 18 24" fill="${this.svgGen.getColor(color)}"/><path d="M46 12 L56 12 L56 20 C56 26 50 28 46 24" fill="${this.svgGen.getColor(color)}"/><rect x="28" y="42" width="8" height="8" fill="${this.svgGen.getColor(color)}"/><rect x="22" y="50" width="20" height="6" rx="2" fill="${this.svgGen.getColor(color)}"/></g>`;
                break;
            case 'gift':
                content = `<g transform="scale(${size / 64})"><rect x="8" y="24" width="48" height="32" rx="4" fill="${this.svgGen.getColor(color)}"/><rect x="28" y="24" width="8" height="32" fill="#FFFFFF" opacity="0.3"/><rect x="8" y="24" width="48" height="10" rx="2" fill="${this.svgGen.getColor(color)}" stroke="#FFFFFF" stroke-width="1"/><path d="M32 24 C32 16 24 8 20 12 C16 16 24 24 32 24 C40 24 48 16 44 12 C40 8 32 16 32 24" fill="none" stroke="${this.svgGen.getColor(color)}" stroke-width="4"/></g>`;
                break;
            case 'lock':
                content = `<g transform="scale(${size / 64})"><rect x="14" y="28" width="36" height="28" rx="4" fill="${this.svgGen.getColor(color)}"/><path d="M20 28 L20 20 C20 12 44 12 44 20 L44 28" fill="none" stroke="${this.svgGen.getColor(color)}" stroke-width="6"/><circle cx="32" cy="42" r="6" fill="#333333"/></g>`;
                break;
            case 'info':
                content = `<g transform="scale(${size / 64})"><circle cx="32" cy="32" r="26" fill="${this.svgGen.getColor(color)}"/><circle cx="32" cy="18" r="4" fill="#FFFFFF"/><rect x="28" y="26" width="8" height="22" rx="2" fill="#FFFFFF"/></g>`;
                break;
            default:
                content = this.svgGen.circle(center, center, r, color);
        }

        return this.svgGen.createSVG(size, size, content);
    }
}
