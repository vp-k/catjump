import { EffectAsset } from '../types.js';
import { SVGGenerator } from '../generators/SVGGenerator.js';

export class EffectTemplate {
    private svgGen: SVGGenerator;

    constructor(svgGen: SVGGenerator) {
        this.svgGen = svgGen;
    }

    render(asset: EffectAsset): string {
        const { width, height, type, color } = asset;

        switch (type) {
            case 'perfect_sparkle':
                return this.renderSparkle(width, height, color || 'gold');
            case 'good_dust':
                return this.renderDust(width, height, color || 'secondary');
            case 'land_impact':
                return this.renderImpact(width, height);
            case 'screen_flash':
                return this.renderFlash(width, height, color || 'white');
            case 'coin_collect':
                return this.renderCoinCollect(width, height);
            case 'combo_burst':
                return this.renderComboBurst(width, height);
            case 'new_record_confetti':
                return this.renderConfetti(width, height);
            case 'new_record_flash':
                return this.renderFlash(width, height, 'gold');
            case 'ad_loading':
                return this.renderLoading(width, height);
            case 'mission_complete':
                return this.renderFirework(width, height);
            default:
                return this.renderGenericBurst(width, height, color || 'primary');
        }
    }

    private renderSparkle(w: number, h: number, color: string): string {
        const cx = w / 2;
        const cy = h / 2;
        const c = this.svgGen.getColor(color);

        const defs = `
            <filter id="sparkleGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4"/>
            </filter>
            <radialGradient id="sparkleGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:${c};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${c};stop-opacity:0" />
            </radialGradient>
        `;

        // Multiple sparkle rays
        const rays: string[] = [];
        const numRays = 8;
        for (let i = 0; i < numRays; i++) {
            const angle = (i * 360 / numRays) * Math.PI / 180;
            const len = (i % 2 === 0) ? w * 0.4 : w * 0.25;
            const x2 = cx + Math.cos(angle) * len;
            const y2 = cy + Math.sin(angle) * len;
            rays.push(`<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`);
        }

        const content = `
            <circle cx="${cx}" cy="${cy}" r="${w * 0.3}" fill="url(#sparkleGrad)" filter="url(#sparkleGlow)"/>
            ${rays.join('\n')}
            <circle cx="${cx}" cy="${cy}" r="${w * 0.1}" fill="#FFFFFF"/>
        `;

        return this.svgGen.createSVG(w, h, content, defs);
    }

    private renderDust(w: number, h: number, color: string): string {
        const cx = w / 2;
        const cy = h / 2;
        const c = this.svgGen.getColor(color);

        // Multiple dust particles
        const particles: string[] = [];
        const numParticles = 8;
        for (let i = 0; i < numParticles; i++) {
            const angle = (i * 360 / numParticles + 10) * Math.PI / 180;
            const dist = w * 0.25 + Math.random() * w * 0.15;
            const x = cx + Math.cos(angle) * dist;
            const y = cy + Math.sin(angle) * dist * 0.5; // Flatten for horizontal spread
            const r = 3 + Math.random() * 4;
            particles.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${0.5 + Math.random() * 0.5}"/>`);
        }

        const content = `
            <ellipse cx="${cx}" cy="${cy}" rx="${w * 0.35}" ry="${h * 0.15}" fill="${c}" opacity="0.3"/>
            ${particles.join('\n')}
        `;

        return this.svgGen.createSVG(w, h, content);
    }

    private renderImpact(w: number, h: number): string {
        const cx = w / 2;
        const cy = h * 0.7;

        const defs = `
            <radialGradient id="impactGrad" cx="50%" cy="70%" r="50%">
                <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.8" />
                <stop offset="100%" style="stop-color:#FFFFFF;stop-opacity:0" />
            </radialGradient>
        `;

        // Impact wave rings
        const content = `
            <ellipse cx="${cx}" cy="${cy}" rx="${w * 0.45}" ry="${h * 0.2}" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.8"/>
            <ellipse cx="${cx}" cy="${cy}" rx="${w * 0.3}" ry="${h * 0.12}" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.6"/>
            <ellipse cx="${cx}" cy="${cy}" rx="${w * 0.15}" ry="${h * 0.06}" fill="url(#impactGrad)"/>
        `;

        return this.svgGen.createSVG(w, h, content, defs);
    }

    private renderFlash(w: number, h: number, color: string): string {
        const c = this.svgGen.getColor(color);

        const defs = `
            <radialGradient id="flashGrad" cx="50%" cy="50%" r="70%">
                <stop offset="0%" style="stop-color:${c};stop-opacity:0.9" />
                <stop offset="100%" style="stop-color:${c};stop-opacity:0" />
            </radialGradient>
        `;

        const content = `
            <rect x="0" y="0" width="${w}" height="${h}" fill="url(#flashGrad)"/>
        `;

        return this.svgGen.createSVG(w, h, content, defs);
    }

    private renderCoinCollect(w: number, h: number): string {
        const cx = w / 2;
        const cy = h / 2;
        const r = w * 0.3;

        const defs = `
            <radialGradient id="coinGlowGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
                <stop offset="70%" style="stop-color:#FFD700;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:#FFD700;stop-opacity:0" />
            </radialGradient>
        `;

        // Sparkle rays around coin
        const rays: string[] = [];
        for (let i = 0; i < 6; i++) {
            const angle = (i * 60 + 30) * Math.PI / 180;
            const x = cx + Math.cos(angle) * r * 1.3;
            const y = cy + Math.sin(angle) * r * 1.3;
            rays.push(`<circle cx="${x}" cy="${y}" r="3" fill="#FFFFFF"/>`);
        }

        const content = `
            <circle cx="${cx}" cy="${cy}" r="${r * 1.5}" fill="url(#coinGlowGrad)"/>
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="#FFD700" stroke="#DAA520" stroke-width="2"/>
            <text x="${cx}" y="${cy}" fill="#B8860B" font-family="Arial" font-size="${r}" font-weight="bold" text-anchor="middle" dominant-baseline="middle">$</text>
            ${rays.join('\n')}
        `;

        return this.svgGen.createSVG(w, h, content, defs);
    }

    private renderComboBurst(w: number, h: number): string {
        const cx = w / 2;
        const cy = h / 2;

        const defs = `
            <radialGradient id="burstGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#FF8E53;stop-opacity:0.7" />
                <stop offset="100%" style="stop-color:#FFC107;stop-opacity:0" />
            </radialGradient>
        `;

        // Burst rays
        const rays: string[] = [];
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30) * Math.PI / 180;
            const len = (i % 2 === 0) ? w * 0.45 : w * 0.3;
            const x2 = cx + Math.cos(angle) * len;
            const y2 = cy + Math.sin(angle) * len;
            rays.push(`<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="#FFC107" stroke-width="4" stroke-linecap="round" opacity="0.8"/>`);
        }

        const content = `
            <circle cx="${cx}" cy="${cy}" r="${w * 0.4}" fill="url(#burstGrad)"/>
            ${rays.join('\n')}
            <circle cx="${cx}" cy="${cy}" r="${w * 0.15}" fill="#FFFFFF"/>
        `;

        return this.svgGen.createSVG(w, h, content, defs);
    }

    private renderConfetti(w: number, h: number): string {
        const colors = ['#FF6B6B', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#FF9800'];
        const confetti: string[] = [];

        for (let i = 0; i < 20; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 2 + Math.random() * 4;
            const rotation = Math.random() * 360;

            if (Math.random() > 0.5) {
                confetti.push(`<rect x="${x}" y="${y}" width="${size * 2}" height="${size}" fill="${color}" transform="rotate(${rotation}, ${x}, ${y})"/>`);
            } else {
                confetti.push(`<circle cx="${x}" cy="${y}" r="${size}" fill="${color}"/>`);
            }
        }

        return this.svgGen.createSVG(w, h, confetti.join('\n'));
    }

    private renderLoading(w: number, h: number): string {
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.min(w, h) * 0.35;

        const defs = `
            <linearGradient id="loadingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#4CAF50;stop-opacity:0.2" />
            </linearGradient>
        `;

        const content = `
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#333333" stroke-width="6"/>
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#loadingGrad)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${r * 2}" stroke-dashoffset="${r * 0.5}"/>
        `;

        return this.svgGen.createSVG(w, h, content, defs);
    }

    private renderFirework(w: number, h: number): string {
        const cx = w / 2;
        const cy = h / 2;
        const colors = ['#FF6B6B', '#FFD700', '#4CAF50', '#2196F3'];

        const sparks: string[] = [];
        for (let i = 0; i < 16; i++) {
            const angle = (i * 22.5) * Math.PI / 180;
            const len = w * 0.35 + (i % 2) * w * 0.1;
            const x2 = cx + Math.cos(angle) * len;
            const y2 = cy + Math.sin(angle) * len;
            const color = colors[i % colors.length];
            sparks.push(`<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`);
            sparks.push(`<circle cx="${x2}" cy="${y2}" r="4" fill="${color}"/>`);
        }

        const content = `
            <circle cx="${cx}" cy="${cy}" r="${w * 0.1}" fill="#FFFFFF"/>
            ${sparks.join('\n')}
        `;

        return this.svgGen.createSVG(w, h, content);
    }

    private renderGenericBurst(w: number, h: number, color: string): string {
        const cx = w / 2;
        const cy = h / 2;
        const c = this.svgGen.getColor(color);

        const defs = `
            <radialGradient id="genericBurstGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:${c};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${c};stop-opacity:0" />
            </radialGradient>
        `;

        const content = `
            <circle cx="${cx}" cy="${cy}" r="${Math.min(w, h) * 0.4}" fill="url(#genericBurstGrad)"/>
        `;

        return this.svgGen.createSVG(w, h, content, defs);
    }
}
