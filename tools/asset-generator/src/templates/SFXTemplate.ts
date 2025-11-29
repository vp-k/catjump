import { SFXAsset } from '../types.js';
import { AudioGenerator } from '../generators/AudioGenerator.js';

export class SFXTemplate {
    private audioGen: AudioGenerator;

    constructor(audioGen: AudioGenerator) {
        this.audioGen = audioGen;
    }

    async render(asset: SFXAsset): Promise<Buffer> {
        return this.audioGen.generateWav(asset.preset, asset.seed);
    }
}
