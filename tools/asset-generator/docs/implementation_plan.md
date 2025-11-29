# Asset Generator Implementation Plan

## Goal Description
Implement a Node.js-based Asset Generator tool to automate the creation of game assets (images and audio) for "Cat Jump". This tool will generate SVG-based UI elements, Canvas-based effects, and Web Audio/jsfxr-based sound effects.

### Phase 1 Quality Standard
> **Target Quality**: "Good enough for a polished prototype."
> Generated assets should look consistent and professional (no "programmer art" vibes), but do not need to match the quality of hand-drawn illustrations. They should be usable in a playable build without breaking immersion.

### Scope & Non-goals
- **In scope (Phase 1)**:
  - **P0-ready assets** (approx. 60% of P0 list).
  - Snack cans, UI buttons (baked & runtime text), icons, HUD, simple tutorial markers, core SFX.
- **Non-goals**:
  - Character sprites, complex backgrounds, BGM, voice assets.
  - Full automation of sprite atlases (future phase).

## User Review Required
> [!IMPORTANT]
> **Native Module Risk**: This tool depends on `canvas` and `sharp`. These require native build tools (node-gyp, C++ compilers) which can be problematic on Windows or CI environments.
> **Mitigation**:
> - The generator is a **local developer tool**.
> - Generated assets will be **committed to git**.
> - The CI build will use the committed assets and **will not** run the generator.

## Proposed Changes

### Technology Stack
- **Language**: TypeScript (for type safety in config and logic).
- **Runtime**: Node.js (Local only).
- **Libraries**: `canvas`, `sharp`, `jsfxr`, `commander`, `zod` (for config validation).

### Directory Structure
```
tools/asset-generator/
├── package.json
├── tsconfig.json
├── src/
│   ├── cli.ts                  # Entry point
│   ├── types.ts                # Shared types
│   ├── config.ts               # Config loader & validator
│   ├── generators/             # Low-level drawing primitives
│   │   ├── SVGGenerator.ts     # Rects, gradients, paths
│   │   ├── CanvasGenerator.ts  # Pixel manipulation, particles
│   │   └── AudioGenerator.ts   # jsfxr wrapper, wav encoding
│   ├── templates/              # High-level asset definitions
│   │   ├── CanTemplate.ts      # "Render a Tuna Can"
│   │   ├── ButtonTemplate.ts   # "Render a Rounded Button"
│   │   └── ...
│   └── utils/
│       └── preview-gallery.ts  # Generates index.html
├── config/
│   ├── palette.json            # Semantic color tokens (primary, accent, etc.)
│   ├── sfx-params.json         # jsfxr presets
│   └── assets/                 # Split config files
│       ├── cans.json
│       ├── buttons.json
│       ├── icons.json
│       └── ...
└── output/                     # Staging area (mirrors public/assets)
```

### Output Strategy
- **Path**: `tools/asset-generator/output/` will mirror the game's `public/assets/` structure.
  - `output/sprites/cans/`
  - `output/ui/buttons/`
  - `output/audio/`
- **Integration**: Developers manually copy `output/*` to `public/assets/` (or use a script) to avoid accidental overwrites during experimentation.
- **Naming**: Strict convention `category_id_state.png` (e.g., `btn_play_normal.png`).
- **ID Rules**: Asset IDs must be globally unique and follow the `category_id` pattern to prevent collisions.

### Config Strategy
- **Schema Validation**: Use Zod schemas to validate JSON configs at runtime.
- **Palette**: Assets reference colors by token (e.g., `"color": "primary"`), not hex.
- **Button Text**:
  - **Baked**: For unique, graphic-heavy buttons (e.g., Main "PLAY").
  - **Runtime**: For generic buttons, generate blank base and overlay text in Phaser.

### CLI Specification
**Command**: `npm run generate [options]`
- `--category <name>`: Generate specific category (cans, ui, sfx).
- `--asset <id>`: Generate single asset.
- `--priority <P0|P1>`: Filter by priority.
- `--dry-run`: Log what would be generated without writing files.
- `--list`: List all available asset IDs matching filters.
- `--force`: Overwrite existing files.
- `--preview`: Generate `output/preview/index.html` gallery.

**Regeneration Policy**:
- **Default**: Skip generation if file exists.
- **--force**: Always overwrite.
- **Future**: Checksum-based regeneration.

### Generator Details
- **PNG Quality**: Use `sharp({ density: 300 })` or enable Canvas antialiasing to prevent aliasing artifacts.
- **Audio**:
  - **Format**: WAV (for maximum compatibility in dev).
  - **Processing**: Use `jsfxr` with peak normalization.
  - **Sprite**: Generator creates `sfx_sprite.json` mapping (future phase integration).

## Verification Plan

### Automated Tests
- **Type Check**: `tsc --noEmit`
- **Unit Tests**: Test `SVGGenerator` produces valid SVG strings.
- **Dry Run**: Verify CLI runs without error on full config.

### Manual Verification
1. **Preview Gallery**: Open `tools/asset-generator/output/preview/index.html`.
   - Verify all assets are displayed in a grid.
   - **Check**: Filenames are displayed below each asset for easy identification.
2. **In-Game**:
   - Copy assets to `public/assets`.
   - Run game and check:
     - Button states (normal/hover/press).
     - Icon alignment.
     - SFX volume balance.

### Definition of Done
- [ ] Tool runs on developer machine (Windows).
- [ ] Generates 70+ P0 assets.
- [ ] Preview gallery shows all assets correctly with filenames.
- [ ] Game runs with generated assets for Cans, Buttons, and basic SFX.

## Future Work (not in this change)
- **Phase 2**:
  - Extend generators to more FX, backgrounds, and UI panels.
  - **Sprite Atlas**: Add automatic sprite sheet packing (TexturePacker-like) functionality.
- **Phase 3**:
  - Improve tooling UX (preview UI, side-by-side comparison with previous versions).
  - Explore AI-assisted image generation for non-P0 assets.
