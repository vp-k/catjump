import * as fs from 'fs/promises';
import * as path from 'path';
import { Asset } from '../types.js';

export class PreviewGallery {
    private outputDir: string;

    constructor(outputDir: string) {
        this.outputDir = outputDir;
    }

    async generate(assets: Asset[]) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cat Jump Asset Preview</title>
  <style>
    body { font-family: sans-serif; background: #222; color: #fff; padding: 20px; }
    h1 { text-align: center; }
    .category { margin-bottom: 40px; }
    .category h2 { border-bottom: 1px solid #444; padding-bottom: 10px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 20px; }
    .card { background: #333; padding: 10px; border-radius: 8px; text-align: center; }
    .preview-box { height: 100px; display: flex; align-items: center; justify-content: center; background: #444; border-radius: 4px; margin-bottom: 10px; overflow: hidden; }
    .preview-box img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .label { font-size: 12px; color: #aaa; word-break: break-all; }
    .meta { font-size: 10px; color: #666; margin-top: 5px; }
  </style>
</head>
<body>
  <h1>Asset Generator Preview</h1>
  
  ${this.renderCategories(assets)}

</body>
</html>
    `;

        const previewDir = path.join(this.outputDir, 'preview');
        await fs.mkdir(previewDir, { recursive: true });
        await fs.writeFile(path.join(previewDir, 'index.html'), html);
    }

    private renderCategories(assets: Asset[]): string {
        const categories = new Set(assets.map(a => a.category));
        let html = '';

        for (const category of categories) {
            const categoryAssets = assets.filter(a => a.category === category);
            html += `
        <div class="category">
          <h2>${category.toUpperCase()}</h2>
          <div class="grid">
            ${categoryAssets.map(asset => this.renderCard(asset)).join('')}
          </div>
        </div>
      `;
        }

        return html;
    }

    private renderCard(asset: Asset): string {
        let preview = '';
        let filename = '';

        if (asset.category === 'cans') {
            filename = `../sprites/cans/${asset.id}.png`;
            preview = `<img src="${filename}" alt="${asset.id}">`;
        } else if (asset.category === 'buttons') {
            filename = `../ui/buttons/${asset.id}_normal.png`;
            preview = `<img src="${filename}" alt="${asset.id}">`;
        } else if (asset.category === 'icons') {
            filename = `../ui/icons/${asset.id}.png`;
            preview = `<img src="${filename}" alt="${asset.id}">`;
        } else if (asset.category === 'sfx') {
            filename = `../audio/${asset.id}.wav`;
            preview = `<audio controls src="${filename}"></audio>`;
        }

        return `
      <div class="card">
        <div class="preview-box">
          ${preview}
        </div>
        <div class="label">${asset.id}</div>
        <div class="meta">${filename.split('/').pop()}</div>
      </div>
    `;
    }
}
