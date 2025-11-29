import * as fs from 'fs/promises';
import * as path from 'path';
import { z } from 'zod';
import {
    PaletteSchema,
    AssetSchema,
    type Palette,
    type Asset
} from './types.js';

export class ConfigLoader {
    private configDir: string;

    constructor(configDir: string) {
        this.configDir = configDir;
    }

    async loadPalette(): Promise<Palette> {
        const palettePath = path.join(this.configDir, 'palette.json');
        const content = await fs.readFile(palettePath, 'utf-8');
        const json = JSON.parse(content);
        return PaletteSchema.parse(json);
    }

    async loadAssets(): Promise<Asset[]> {
        const assetsDir = path.join(this.configDir, 'assets');
        const files = await fs.readdir(assetsDir);
        const jsonFiles = files.filter(f => f.endsWith('.json'));

        let allAssets: Asset[] = [];

        for (const file of jsonFiles) {
            const content = await fs.readFile(path.join(assetsDir, file), 'utf-8');
            const json = JSON.parse(content);

            // Validate array of assets
            const assets = z.array(AssetSchema).parse(json);
            allAssets = allAssets.concat(assets);
        }

        // Check for duplicate IDs
        const ids = new Set<string>();
        for (const asset of allAssets) {
            if (ids.has(asset.id)) {
                throw new Error(`Duplicate asset ID found: ${asset.id}`);
            }
            ids.add(asset.id);
        }

        return allAssets;
    }
}
