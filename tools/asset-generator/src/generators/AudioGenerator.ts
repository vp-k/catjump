import jsfxr from 'jsfxr';

/**
 * AudioGenerator class for creating retro-style sound effects using jsfxr
 * Generates WAV files from sfxr parameter presets
 */
export class AudioGenerator {
    private presets: Record<string, any>;

    constructor(presets: Record<string, any>) {
        this.presets = presets;
    }

    /**
     * Generate WAV buffer from sfxr preset parameters
     * @param presetName - The name of the preset to use
     * @param seed - Optional random seed for variation
     * @returns Promise resolving to WAV file Buffer
     */
    async generateWav(presetName: string, seed?: number): Promise<Buffer> {
        const params = this.presets[presetName];
        if (!params) {
            throw new Error(`SFX preset not found: ${presetName}`);
        }

        // If seed is provided, we could use it to modify the RNG
        // For now, jsfxr uses Math.random() internally
        if (seed !== undefined) {
            // Future enhancement: inject seeded RNG into jsfxr
            console.warn('Seed parameter not yet supported by jsfxr integration');
        }

        // Generate sound using jsfxr
        // The sfxr.toWave() function returns a RIFFWAVE object
        const wave = jsfxr.sfxr.toWave(params);

        // The RIFFWAVE object has a .wav property containing the WAV byte array
        const wavArray = wave.wav;

        // Convert the array to a Node.js Buffer
        return Buffer.from(wavArray);
    }
}
