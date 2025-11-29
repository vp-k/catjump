import { z } from 'zod';

// Palette Schema
export const PaletteSchema = z.object({
    colors: z.record(z.string()),
    gradients: z.record(z.object({
        stops: z.array(z.object({
            offset: z.number(),
            color: z.string(),
            opacity: z.number().optional()
        })),
        type: z.enum(['linear', 'radial']).default('linear'),
        angle: z.number().optional()
    })).optional(),
    shadows: z.record(z.object({
        x: z.number(),
        y: z.number(),
        blur: z.number(),
        color: z.string()
    })).optional()
});

// Base Asset Schema
const BaseAssetSchema = z.object({
    id: z.string(),
    priority: z.enum(['P0', 'P1', 'P2']).default('P0'),
    category: z.string()
});

// Can Asset Schema
export const CanAssetSchema = BaseAssetSchema.extend({
    category: z.literal('cans'),
    type: z.enum(['basic', 'special']),
    baseColor: z.string(), // Reference to palette or hex
    label: z.string(),
    icon: z.string().optional(),
    width: z.number().default(128),
    height: z.number().default(64)
});

// Button Asset Schema
export const ButtonAssetSchema = BaseAssetSchema.extend({
    category: z.literal('buttons'),
    text: z.string().optional(),
    color: z.string(), // Reference to palette
    width: z.number().default(200),
    height: z.number().default(60),
    states: z.array(z.enum(['normal', 'hover', 'pressed', 'disabled'])).default(['normal', 'pressed']),
    style: z.enum(['rounded', 'pill', 'rect']).default('rounded')
});

// Icon Asset Schema
export const IconAssetSchema = BaseAssetSchema.extend({
    category: z.literal('icons'),
    type: z.string(), // Reference to icon path template
    color: z.string().default('white'),
    size: z.number().default(64)
});

// SFX Asset Schema
export const SFXAssetSchema = BaseAssetSchema.extend({
    category: z.literal('sfx'),
    preset: z.string(), // Reference to sfx-params.json
    seed: z.number().optional(),
    volume: z.number().default(1.0)
});

// Medal Asset Schema
export const MedalAssetSchema = BaseAssetSchema.extend({
    category: z.literal('medals'),
    type: z.enum(['bronze', 'silver', 'gold', 'platinum', 'diamond']),
    width: z.number().default(96),
    height: z.number().default(96)
});

// HUD Asset Schema
export const HUDAssetSchema = BaseAssetSchema.extend({
    category: z.literal('hud'),
    type: z.string(), // score_bg, combo_bg, floor_bg, energy_empty, energy_full, etc.
    width: z.number(),
    height: z.number(),
    color: z.string().optional()
});

// Tutorial Asset Schema
export const TutorialAssetSchema = BaseAssetSchema.extend({
    category: z.literal('tutorial'),
    type: z.enum(['hand', 'arrow', 'highlight', 'perfect_zone', 'speech_bubble']),
    width: z.number(),
    height: z.number(),
    color: z.string().optional()
});

// Effect Asset Schema
export const EffectAssetSchema = BaseAssetSchema.extend({
    category: z.literal('effects'),
    type: z.string(), // perfect_sparkle, good_dust, land_impact, coin_collect, combo_burst, etc.
    width: z.number(),
    height: z.number(),
    frames: z.number().default(1),
    color: z.string().optional()
});

// Panel Asset Schema
export const PanelAssetSchema = BaseAssetSchema.extend({
    category: z.literal('panels'),
    type: z.string(), // basic, header, gameover, mission, login_reward, etc.
    width: z.number(),
    height: z.number(),
    style: z.enum(['rounded', 'sharp', '9slice']).default('rounded')
});

// Combined Asset Type
export const AssetSchema = z.discriminatedUnion('category', [
    CanAssetSchema,
    ButtonAssetSchema,
    IconAssetSchema,
    SFXAssetSchema,
    MedalAssetSchema,
    HUDAssetSchema,
    TutorialAssetSchema,
    EffectAssetSchema,
    PanelAssetSchema
]);

export type Palette = z.infer<typeof PaletteSchema>;
export type Asset = z.infer<typeof AssetSchema>;
export type CanAsset = z.infer<typeof CanAssetSchema>;
export type ButtonAsset = z.infer<typeof ButtonAssetSchema>;
export type IconAsset = z.infer<typeof IconAssetSchema>;
export type SFXAsset = z.infer<typeof SFXAssetSchema>;
export type MedalAsset = z.infer<typeof MedalAssetSchema>;
export type HUDAsset = z.infer<typeof HUDAssetSchema>;
export type TutorialAsset = z.infer<typeof TutorialAssetSchema>;
export type EffectAsset = z.infer<typeof EffectAssetSchema>;
export type PanelAsset = z.infer<typeof PanelAssetSchema>;
