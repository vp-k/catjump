import { PanelAsset } from '../types.js';
import { SVGGenerator } from '../generators/SVGGenerator.js';

export class PanelTemplate {
    private svgGen: SVGGenerator;

    constructor(svgGen: SVGGenerator) {
        this.svgGen = svgGen;
    }

    render(asset: PanelAsset): string {
        const { width, height, type, style } = asset;

        switch (type) {
            case 'basic':
                return this.renderBasicPanel(width, height, style);
            case 'header':
                return this.renderHeaderPanel(width, height);
            case 'gameover':
                return this.renderGameoverPanel(width, height);
            case 'mission':
                return this.renderMissionPanel(width, height);
            case 'login_reward':
                return this.renderRewardPanel(width, height, 'Login Reward');
            case 'offline_reward':
                return this.renderRewardPanel(width, height, 'Offline Reward');
            case 'ad_preview':
                return this.renderAdPreviewPanel(width, height);
            default:
                return this.renderBasicPanel(width, height, style);
        }
    }

    private renderBasicPanel(w: number, h: number, style: string): string {
        const rx = style === 'sharp' ? 0 : (style === '9slice' ? 16 : 20);

        const defs = `
            <linearGradient id="panelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#3a3a4a;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#2a2a3a;stop-opacity:1" />
            </linearGradient>
            <filter id="panelShadow" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="8" stdDeviation="8" flood-opacity="0.5"/>
            </filter>
        `;

        const content = `
            <rect x="8" y="8" width="${w - 16}" height="${h - 16}" rx="${rx}" fill="url(#panelGrad)" filter="url(#panelShadow)" stroke="#5a5a6a" stroke-width="2"/>
        `;

        return this.svgGen.createSVG(w, h, content, defs);
    }

    private renderHeaderPanel(w: number, h: number): string {
        const defs = `
            <linearGradient id="headerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:0.95" />
                <stop offset="100%" style="stop-color:#16213e;stop-opacity:0.9" />
            </linearGradient>
        `;

        const content = `
            <rect x="0" y="0" width="${w}" height="${h}" fill="url(#headerGrad)"/>
            <line x1="0" y1="${h - 1}" x2="${w}" y2="${h - 1}" stroke="#4a4a5a" stroke-width="2"/>
        `;

        return this.svgGen.createSVG(w, h, content, defs);
    }

    private renderGameoverPanel(w: number, h: number): string {
        const rx = 24;

        const defs = `
            <linearGradient id="gameoverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#2d2d44;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#1a1a2e;stop-opacity:1" />
            </linearGradient>
            <filter id="gameoverShadow" x="-10%" y="-5%" width="120%" height="120%">
                <feDropShadow dx="0" dy="10" stdDeviation="10" flood-opacity="0.6"/>
            </filter>
        `;

        // Header bar
        const headerH = 60;
        const content = `
            <rect x="8" y="8" width="${w - 16}" height="${h - 16}" rx="${rx}" fill="url(#gameoverGrad)" filter="url(#gameoverShadow)" stroke="#4a4a5a" stroke-width="2"/>
            <rect x="8" y="8" width="${w - 16}" height="${headerH}" rx="${rx}" fill="#E53935"/>
            <rect x="8" y="${8 + headerH - rx}" width="${w - 16}" height="${rx}" fill="#E53935"/>
            <line x1="16" y1="${8 + headerH}" x2="${w - 16}" y2="${8 + headerH}" stroke="#B71C1C" stroke-width="2"/>
        `;

        return this.svgGen.createSVG(w, h, content, defs);
    }

    private renderMissionPanel(w: number, h: number): string {
        const rx = 24;

        const defs = `
            <linearGradient id="missionPanelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#2d3a2d;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#1a2e1a;stop-opacity:1" />
            </linearGradient>
            <filter id="missionShadow" x="-10%" y="-5%" width="120%" height="120%">
                <feDropShadow dx="0" dy="10" stdDeviation="10" flood-opacity="0.6"/>
            </filter>
        `;

        const headerH = 60;
        const content = `
            <rect x="8" y="8" width="${w - 16}" height="${h - 16}" rx="${rx}" fill="url(#missionPanelGrad)" filter="url(#missionShadow)" stroke="#4a5a4a" stroke-width="2"/>
            <rect x="8" y="8" width="${w - 16}" height="${headerH}" rx="${rx}" fill="#4CAF50"/>
            <rect x="8" y="${8 + headerH - rx}" width="${w - 16}" height="${rx}" fill="#4CAF50"/>
            <line x1="16" y1="${8 + headerH}" x2="${w - 16}" y2="${8 + headerH}" stroke="#388E3C" stroke-width="2"/>
        `;

        return this.svgGen.createSVG(w, h, content, defs);
    }

    private renderRewardPanel(w: number, h: number, _title: string): string {
        const rx = 20;

        const defs = `
            <linearGradient id="rewardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#3d3a2d;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#2e2a1a;stop-opacity:1" />
            </linearGradient>
            <filter id="rewardShadow" x="-10%" y="-5%" width="120%" height="120%">
                <feDropShadow dx="0" dy="8" stdDeviation="8" flood-opacity="0.5"/>
            </filter>
        `;

        const headerH = 56;
        const content = `
            <rect x="8" y="8" width="${w - 16}" height="${h - 16}" rx="${rx}" fill="url(#rewardGrad)" filter="url(#rewardShadow)" stroke="#5a5a4a" stroke-width="2"/>
            <rect x="8" y="8" width="${w - 16}" height="${headerH}" rx="${rx}" fill="#FFD700"/>
            <rect x="8" y="${8 + headerH - rx}" width="${w - 16}" height="${rx}" fill="#FFD700"/>
            <line x1="16" y1="${8 + headerH}" x2="${w - 16}" y2="${8 + headerH}" stroke="#DAA520" stroke-width="2"/>
        `;

        return this.svgGen.createSVG(w, h, content, defs);
    }

    private renderAdPreviewPanel(w: number, h: number): string {
        const rx = 16;

        const defs = `
            <linearGradient id="adPreviewGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#2d2d44;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#1a1a2e;stop-opacity:1" />
            </linearGradient>
        `;

        const content = `
            <rect x="4" y="4" width="${w - 8}" height="${h - 8}" rx="${rx}" fill="url(#adPreviewGrad)" stroke="#4CAF50" stroke-width="3"/>
            <rect x="${w / 2 - 30}" y="12" width="60" height="24" rx="12" fill="#4CAF50"/>
        `;

        return this.svgGen.createSVG(w, h, content, defs);
    }
}
