import { Palette } from '../types.js';

export class SVGGenerator {
    private palette: Palette;

    constructor(palette: Palette) {
        this.palette = palette;
    }

    getColor(token: string): string {
        return this.palette.colors[token] || token;
    }

    createSVG(width: number, height: number, content: string, defs: string = ''): string {
        return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>${defs}</defs>
        ${content}
      </svg>
    `.trim();
    }

    rect(x: number, y: number, width: number, height: number, fill: string, rx: number = 0, stroke?: string, strokeWidth: number = 0): string {
        const fillVal = this.getColor(fill);
        const strokeAttr = stroke ? `stroke="${this.getColor(stroke)}" stroke-width="${strokeWidth}"` : '';
        return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" fill="${fillVal}" ${strokeAttr} />`;
    }

    circle(cx: number, cy: number, r: number, fill: string): string {
        return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${this.getColor(fill)}" />`;
    }

    text(x: number, y: number, text: string, color: string, fontSize: number, fontWeight: string = 'bold', anchor: string = 'middle'): string {
        return `<text x="${x}" y="${y}" fill="${this.getColor(color)}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="${fontWeight}" text-anchor="${anchor}" dominant-baseline="middle">${text}</text>`;
    }

    linearGradient(id: string, stops: { offset: number; color: string; opacity?: number }[], angle: number = 90): string {
        // Simple angle to x1,y1,x2,y2 conversion (approximate for 90/180)
        let x1 = '0%', y1 = '0%', x2 = '0%', y2 = '0%';
        if (angle === 90) { x2 = '0%'; y2 = '100%'; } // Vertical
        else if (angle === 0) { x2 = '100%'; y2 = '0%'; } // Horizontal

        const stopsSVG = stops.map(s => {
            const opacity = s.opacity !== undefined ? `stop-opacity="${s.opacity}"` : '';
            return `<stop offset="${s.offset * 100}%" stop-color="${this.getColor(s.color)}" ${opacity} />`;
        }).join('');

        return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stopsSVG}</linearGradient>`;
    }
}
