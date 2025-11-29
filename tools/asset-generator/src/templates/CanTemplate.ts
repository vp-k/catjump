import { CanAsset } from '../types.js';
import { SVGGenerator } from '../generators/SVGGenerator.js';

export class CanTemplate {
    private svgGen: SVGGenerator;

    constructor(svgGen: SVGGenerator) {
        this.svgGen = svgGen;
    }

    render(asset: CanAsset): string {
        const { width, height, baseColor, label } = asset;
        const color = this.svgGen.getColor(baseColor);

        // Definitions for gradients
        const defs = `
      ${this.svgGen.linearGradient(`${asset.id}_body`, [
            { offset: 0, color: color },
            { offset: 0.5, color: color, opacity: 0.8 }, // Highlight
            { offset: 1, color: color } // Shadow
        ], 0)}
      ${this.svgGen.linearGradient(`${asset.id}_lid`, [
            { offset: 0, color: '#eeeeee' },
            { offset: 1, color: '#cccccc' }
        ], 90)}
    `;

        // Body
        const body = this.svgGen.rect(0, height * 0.2, width, height * 0.8, `url(#${asset.id}_body)`, 0);

        // Lid (Top ellipse simulated by rect for now or path)
        // For simple SVG, we can use a rect for the lid rim
        const lid = this.svgGen.rect(0, 0, width, height * 0.25, `url(#${asset.id}_lid)`, 5);

        // Label
        const labelBg = this.svgGen.rect(10, height * 0.4, width - 20, height * 0.4, 'white', 2);
        const labelText = this.svgGen.text(width / 2, height * 0.6, label, baseColor, 16);

        return this.svgGen.createSVG(width, height, `
      ${body}
      ${lid}
      ${labelBg}
      ${labelText}
    `, defs);
    }
}
