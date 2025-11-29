import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';

// Allowed categories and subfolders for path traversal protection
const ALLOWED_CATEGORIES = ['sprites', 'ui', 'audio', 'preview'] as const;
const ALLOWED_SUBFOLDERS = ['cans', 'buttons', 'icons', 'medals', 'hud', 'tutorial', 'effects', 'panels', ''] as const;

// Filename validation regex: alphanumeric, underscore, hyphen, and dot only
const VALID_FILENAME_REGEX = /^[a-zA-Z0-9_-]+\.(png|wav|html)$/;

export class FileManager {
    private outputDir: string;

    constructor(outputDir: string) {
        this.outputDir = outputDir;
    }

    /**
     * Validate path components to prevent path traversal attacks
     */
    private validatePathComponents(category: string, subfolder: string, filename: string): void {
        // Check for path traversal attempts
        if (category.includes('..') || subfolder.includes('..') || filename.includes('..')) {
            throw new Error('Path traversal detected: ".." is not allowed');
        }

        // Validate category
        if (!ALLOWED_CATEGORIES.includes(category as typeof ALLOWED_CATEGORIES[number])) {
            throw new Error(`Invalid category: ${category}. Allowed: ${ALLOWED_CATEGORIES.join(', ')}`);
        }

        // Validate subfolder (can be empty for audio)
        if (subfolder && !ALLOWED_SUBFOLDERS.includes(subfolder as typeof ALLOWED_SUBFOLDERS[number])) {
            throw new Error(`Invalid subfolder: ${subfolder}. Allowed: ${ALLOWED_SUBFOLDERS.join(', ')}`);
        }

        // Validate filename format
        if (!VALID_FILENAME_REGEX.test(filename)) {
            throw new Error(`Invalid filename: ${filename}. Must match pattern: ${VALID_FILENAME_REGEX}`);
        }
    }

    /**
     * Ensure output directories exist
     */
    async ensureDirs(): Promise<void> {
        await Promise.all([
            fs.mkdir(path.join(this.outputDir, 'sprites/cans'), { recursive: true }),
            fs.mkdir(path.join(this.outputDir, 'sprites/effects'), { recursive: true }),
            fs.mkdir(path.join(this.outputDir, 'ui/buttons'), { recursive: true }),
            fs.mkdir(path.join(this.outputDir, 'ui/icons'), { recursive: true }),
            fs.mkdir(path.join(this.outputDir, 'ui/medals'), { recursive: true }),
            fs.mkdir(path.join(this.outputDir, 'ui/hud'), { recursive: true }),
            fs.mkdir(path.join(this.outputDir, 'ui/tutorial'), { recursive: true }),
            fs.mkdir(path.join(this.outputDir, 'ui/panels'), { recursive: true }),
            fs.mkdir(path.join(this.outputDir, 'audio'), { recursive: true }),
            fs.mkdir(path.join(this.outputDir, 'preview'), { recursive: true })
        ]);
    }

    /**
     * Convert SVG to PNG and save to file
     * @param svg - SVG string content
     * @param category - Asset category (sprites, ui)
     * @param subfolder - Subfolder within category (cans, buttons, icons)
     * @param filename - Output filename (must end with .png)
     */
    async saveSVGAsPNG(svg: string, category: string, subfolder: string, filename: string): Promise<void> {
        this.validatePathComponents(category, subfolder, filename);

        const buffer = Buffer.from(svg);
        const outputPath = path.join(this.outputDir, category, subfolder, filename);

        await sharp(buffer, { density: 96 }) // Standard screen DPI (reduced from 300)
            .png({ quality: 80 })
            .toFile(outputPath);
    }

    /**
     * Save WAV audio buffer to file
     * @param buffer - WAV file buffer
     * @param filename - Output filename (must end with .wav)
     */
    async saveWav(buffer: Buffer, filename: string): Promise<void> {
        this.validatePathComponents('audio', '', filename.replace('.wav', '.wav'));

        // Validate WAV buffer has content
        if (buffer.length === 0) {
            throw new Error(`Cannot save empty WAV file: ${filename}`);
        }

        const outputPath = path.join(this.outputDir, 'audio', filename);
        await fs.writeFile(outputPath, buffer);
    }
}
