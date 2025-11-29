import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as path from 'path';
import { ConfigLoader } from './config.js';
import { SVGGenerator } from './generators/SVGGenerator.js';
import { AudioGenerator } from './generators/AudioGenerator.js';
import { CanTemplate } from './templates/CanTemplate.js';
import { ButtonTemplate } from './templates/ButtonTemplate.js';
import { IconTemplate } from './templates/IconTemplate.js';
import { SFXTemplate } from './templates/SFXTemplate.js';
import { MedalTemplate } from './templates/MedalTemplate.js';
import { HUDTemplate } from './templates/HUDTemplate.js';
import { TutorialTemplate } from './templates/TutorialTemplate.js';
import { EffectTemplate } from './templates/EffectTemplate.js';
import { PanelTemplate } from './templates/PanelTemplate.js';
import { FileManager } from './utils/file-manager.js';
import { PreviewGallery } from './utils/preview-gallery.js';
import type { CanAsset, ButtonAsset, IconAsset, SFXAsset, MedalAsset, HUDAsset, TutorialAsset, EffectAsset, PanelAsset } from './types.js';

const program = new Command();

program
    .name('asset-generator')
    .description('CLI to generate game assets for Cat Jump')
    .version('1.0.0');

interface CLIOptions {
    category?: string;
    asset?: string;
    priority?: string;
    dryRun?: boolean;
    force?: boolean;
    preview?: boolean;
}

program
    .option('-c, --category <type>', 'Asset category (cans, buttons, icons, sfx)')
    .option('-a, --asset <id>', 'Specific asset ID')
    .option('-p, --priority <level>', 'Priority level (P0, P1)')
    .option('--dry-run', 'Simulate generation without writing files')
    .option('--force', 'Overwrite existing files')
    .option('--preview', 'Generate preview gallery')
    .action(async (options: CLIOptions) => {
        const spinner = ora('Initializing Asset Generator...').start();

        try {
            console.log(chalk.blue('\n🚀 Cat Jump Asset Generator'));

            const rootDir = process.cwd();
            const configDir = path.resolve(rootDir, 'config');
            const outputDir = path.resolve(rootDir, 'output');

            const configLoader = new ConfigLoader(configDir);
            const palette = await configLoader.loadPalette();
            let assets = await configLoader.loadAssets();

            // Filter assets
            if (options.asset) {
                assets = assets.filter(a => a.id === options.asset);
            } else if (options.category) {
                assets = assets.filter(a => a.category === options.category);
            }

            if (options.priority) {
                assets = assets.filter(a => a.priority === options.priority);
            }

            if (assets.length === 0) {
                spinner.warn('No assets found matching criteria.');
                return;
            }

            spinner.info(`Found ${assets.length} assets to generate.`);

            // Initialize Generators
            const svgGen = new SVGGenerator(palette);
            // Note: CanvasGenerator removed - using SVG-only approach for Phase 1

            // Initialize jsfxr presets using built-in generators
            // Import jsfxr to create proper parameter objects
            const { default: jsfxr } = await import('jsfxr');
            const sfxrParams = jsfxr.Params;

            const audioGen = new AudioGenerator({
                'jump': new sfxrParams().jump(),
                'hit': new sfxrParams().hitHurt(),
                'pickup': new sfxrParams().pickupCoin(),
                'blip': new sfxrParams().blipSelect(),
                // Extended presets for P0 assets
                'hitHurt': new sfxrParams().hitHurt(),
                'pickupCoin': new sfxrParams().pickupCoin(),
                'blipSelect': new sfxrParams().blipSelect(),
                'powerUp': new sfxrParams().powerUp(),
                'explosion': new sfxrParams().explosion(),
                'laserShoot': new sfxrParams().laserShoot(),
                'synth': new sfxrParams().synth(),
                'tone': new sfxrParams().tone(),
                'click': new sfxrParams().click(),
                'random': new sfxrParams().random()
            });

            // Initialize Templates
            const canTemplate = new CanTemplate(svgGen);
            const buttonTemplate = new ButtonTemplate(svgGen);
            const iconTemplate = new IconTemplate(svgGen);
            const sfxTemplate = new SFXTemplate(audioGen);
            const medalTemplate = new MedalTemplate(svgGen);
            const hudTemplate = new HUDTemplate(svgGen);
            const tutorialTemplate = new TutorialTemplate(svgGen);
            const effectTemplate = new EffectTemplate(svgGen);
            const panelTemplate = new PanelTemplate(svgGen);

            // Initialize Utilities
            const fileManager = new FileManager(outputDir);
            if (!options.dryRun) {
                await fileManager.ensureDirs();
            }

            // Generate Loop with progress indicator
            let generated = 0;
            let failed = 0;

            for (const [index, asset] of assets.entries()) {
                const progress = `[${index + 1}/${assets.length}]`;
                spinner.text = `${progress} Generating ${asset.id} (${asset.category})...`;

                if (options.dryRun) {
                    generated++;
                    continue;
                }

                try {
                    switch (asset.category) {
                        case 'cans': {
                            const svg = canTemplate.render(asset as CanAsset);
                            await fileManager.saveSVGAsPNG(svg, 'sprites', 'cans', `${asset.id}.png`);
                            break;
                        }
                        case 'buttons': {
                            const buttonAsset = asset as ButtonAsset;
                            for (const state of buttonAsset.states) {
                                const svg = buttonTemplate.render(buttonAsset, state);
                                await fileManager.saveSVGAsPNG(svg, 'ui', 'buttons', `${asset.id}_${state}.png`);
                            }
                            break;
                        }
                        case 'icons': {
                            const svg = iconTemplate.render(asset as IconAsset);
                            await fileManager.saveSVGAsPNG(svg, 'ui', 'icons', `${asset.id}.png`);
                            break;
                        }
                        case 'sfx': {
                            const wav = await sfxTemplate.render(asset as SFXAsset);
                            await fileManager.saveWav(wav, `${asset.id}.wav`);
                            break;
                        }
                        case 'medals': {
                            const svg = medalTemplate.render(asset as MedalAsset);
                            await fileManager.saveSVGAsPNG(svg, 'ui', 'medals', `${asset.id}.png`);
                            break;
                        }
                        case 'hud': {
                            const svg = hudTemplate.render(asset as HUDAsset);
                            await fileManager.saveSVGAsPNG(svg, 'ui', 'hud', `${asset.id}.png`);
                            break;
                        }
                        case 'tutorial': {
                            const svg = tutorialTemplate.render(asset as TutorialAsset);
                            await fileManager.saveSVGAsPNG(svg, 'ui', 'tutorial', `${asset.id}.png`);
                            break;
                        }
                        case 'effects': {
                            const svg = effectTemplate.render(asset as EffectAsset);
                            await fileManager.saveSVGAsPNG(svg, 'sprites', 'effects', `${asset.id}.png`);
                            break;
                        }
                        case 'panels': {
                            const svg = panelTemplate.render(asset as PanelAsset);
                            await fileManager.saveSVGAsPNG(svg, 'ui', 'panels', `${asset.id}.png`);
                            break;
                        }
                    }
                    generated++;
                } catch (err) {
                    failed++;
                    const errorMessage = err instanceof Error ? err.message : String(err);
                    spinner.warn(`Failed to generate ${asset.id}: ${errorMessage}`);
                    spinner.start(); // Resume spinner after warning
                }
            }

            if (options.preview && !options.dryRun) {
                spinner.text = 'Generating Preview Gallery...';
                const gallery = new PreviewGallery(outputDir);
                await gallery.generate(assets);
            }

            // Final status message
            const status = failed > 0
                ? `Generated ${generated} assets (${failed} failed)`
                : `Successfully generated ${generated} assets!`;

            if (failed > 0) {
                spinner.warn(status);
            } else {
                spinner.succeed(status);
            }

        } catch (error) {
            spinner.fail('Generation failed');
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : '';
            console.error(chalk.red(`Error: ${errorMessage}`));
            if (errorStack) {
                console.error(chalk.gray(errorStack));
            }
            process.exit(1);
        }
    });

program.parse();
