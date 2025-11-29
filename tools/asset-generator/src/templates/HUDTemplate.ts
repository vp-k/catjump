import { HUDAsset } from '../types.js';
import { SVGGenerator } from '../generators/SVGGenerator.js';

export class HUDTemplate {
    private svgGen: SVGGenerator;

    constructor(svgGen: SVGGenerator) {
        this.svgGen = svgGen;
    }

    render(asset: HUDAsset): string {
        const { width, height, type, color } = asset;

        switch (type) {
            case 'score_bg':
                return this.renderScoreBg(width, height);
            case 'combo_bg':
                return this.renderComboBg(width, height);
            case 'floor_bg':
                return this.renderFloorBg(width, height);
            case 'energy_empty':
                return this.renderHeart(width, height, false);
            case 'energy_full':
                return this.renderHeart(width, height, true);
            case 'energy_timer':
                return this.renderTimerBg(width, height);
            case 'mission_tracker':
                return this.renderMissionTracker(width, height);
            case 'progress_bar_bg':
                return this.renderProgressBarBg(width, height);
            case 'progress_bar_fill':
                return this.renderProgressBarFill(width, height, color || 'primary');
            default:
                return this.renderGenericBg(width, height, color || 'bgDark');
        }
    }

    private renderScoreBg(w: number, h: number): string {
        const rx = h / 4;
        const defs = `
            <linearGradient id="scoreBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#333333;stop-opacity:0.9" />
                <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:0.95" />
            </linearGradient>
        `;
        const content = `
            <rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="${rx}" fill="url(#scoreBgGrad)" stroke="#FFD700" stroke-width="2"/>
        `;
        return this.svgGen.createSVG(w, h, content, defs);
    }

    private renderComboBg(w: number, h: number): string {
        const rx = h / 4;
        const defs = `
            <linearGradient id="comboBgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:0.9" />
                <stop offset="100%" style="stop-color:#FF8E53;stop-opacity:0.9" />
            </linearGradient>
        `;
        const content = `
            <rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="${rx}" fill="url(#comboBgGrad)" stroke="#FFFFFF" stroke-width="1"/>
        `;
        return this.svgGen.createSVG(w, h, content, defs);
    }

    private renderFloorBg(w: number, h: number): string {
        const rx = h / 4;
        const content = `
            <rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="${rx}" fill="#2196F3" fill-opacity="0.85" stroke="#FFFFFF" stroke-width="1"/>
        `;
        return this.svgGen.createSVG(w, h, content);
    }

    private renderHeart(w: number, h: number, filled: boolean): string {
        const scale = Math.min(w, h) / 64;
        const color = filled ? '#FF6B6B' : '#555555';
        const stroke = filled ? '#D32F2F' : '#333333';
        const content = `
            <g transform="scale(${scale})">
                <path d="M32 56 C 10 38 2 26 2 16 A 14 14 0 0 1 32 16 A 14 14 0 0 1 62 16 C 62 26 54 38 32 56 Z"
                      fill="${color}" stroke="${stroke}" stroke-width="2"/>
                ${filled ? '<ellipse cx="20" cy="20" rx="6" ry="4" fill="#FF9999" opacity="0.5"/>' : ''}
            </g>
        `;
        return this.svgGen.createSVG(w, h, content);
    }

    private renderTimerBg(w: number, h: number): string {
        const rx = h / 3;
        const content = `
            <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${rx}" fill="#333333" fill-opacity="0.8" stroke="#666666" stroke-width="1"/>
        `;
        return this.svgGen.createSVG(w, h, content);
    }

    private renderMissionTracker(w: number, h: number): string {
        const rx = 8;
        const defs = `
            <linearGradient id="missionGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:0.9" />
                <stop offset="100%" style="stop-color:#388E3C;stop-opacity:0.9" />
            </linearGradient>
        `;
        const content = `
            <rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="${rx}" fill="url(#missionGrad)" stroke="#FFFFFF" stroke-width="1"/>
        `;
        return this.svgGen.createSVG(w, h, content, defs);
    }

    private renderProgressBarBg(w: number, h: number): string {
        const rx = h / 2;
        const content = `
            <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${rx}" fill="#333333" stroke="#555555" stroke-width="1"/>
        `;
        return this.svgGen.createSVG(w, h, content);
    }

    private renderProgressBarFill(w: number, h: number, color: string): string {
        const rx = h / 2;
        const fillColor = this.svgGen.getColor(color);
        const defs = `
            <linearGradient id="progressFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.3" />
                <stop offset="50%" style="stop-color:#FFFFFF;stop-opacity:0" />
                <stop offset="100%" style="stop-color:#000000;stop-opacity:0.2" />
            </linearGradient>
        `;
        const content = `
            <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${rx}" fill="${fillColor}"/>
            <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${rx}" fill="url(#progressFillGrad)"/>
        `;
        return this.svgGen.createSVG(w, h, content, defs);
    }

    private renderGenericBg(w: number, h: number, color: string): string {
        const rx = 8;
        const fillColor = this.svgGen.getColor(color);
        const content = `
            <rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="${rx}" fill="${fillColor}" fill-opacity="0.9"/>
        `;
        return this.svgGen.createSVG(w, h, content);
    }
}
