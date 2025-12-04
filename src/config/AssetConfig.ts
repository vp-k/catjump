/**
 * 에셋 키 정의
 */

// 이미지 에셋 키
export const IMAGE_KEYS = {
  // 버튼
  BTN_PLAY: 'btn_play',
  BTN_PLAY_HOVER: 'btn_play_hover',
  BTN_PLAY_PRESSED: 'btn_play_pressed',
  BTN_SETTINGS: 'btn_settings',
  BTN_SETTINGS_HOVER: 'btn_settings_hover',
  BTN_SETTINGS_PRESSED: 'btn_settings_pressed',
  BTN_SHOP: 'btn_shop',
  BTN_SHOP_HOVER: 'btn_shop_hover',
  BTN_SHOP_PRESSED: 'btn_shop_pressed',
  BTN_MISSION: 'btn_mission',
  BTN_MISSION_HOVER: 'btn_mission_hover',
  BTN_MISSION_PRESSED: 'btn_mission_pressed',
  BTN_LEADERBOARD: 'btn_leaderboard',
  BTN_LEADERBOARD_HOVER: 'btn_leaderboard_hover',
  BTN_LEADERBOARD_PRESSED: 'btn_leaderboard_pressed',
  BTN_BACK: 'btn_back',
  BTN_BACK_HOVER: 'btn_back_hover',
  BTN_BACK_PRESSED: 'btn_back_pressed',
  BTN_CLOSE: 'btn_close',
  BTN_CLOSE_HOVER: 'btn_close_hover',
  BTN_CLOSE_PRESSED: 'btn_close_pressed',
  BTN_SHARE: 'btn_share',
  BTN_SHARE_HOVER: 'btn_share_hover',
  BTN_SHARE_PRESSED: 'btn_share_pressed',
  BTN_ADWATCH: 'btn_adwatch',
  BTN_ADWATCH_HOVER: 'btn_adwatch_hover',
  BTN_ADWATCH_PRESSED: 'btn_adwatch_pressed',

  // 캔 (참치캔)
  CAN_TUNA: 'can_tuna',
  CAN_SALMON: 'can_salmon',
  CAN_CHICKEN: 'can_chicken',
  CAN_BEEF: 'can_beef',
  CAN_MIX: 'can_mix',
  CAN_GOLDEN: 'can_golden',
  CAN_GOLD: 'can_gold',
  CAN_GIFT: 'can_gift',
  CAN_WIDE: 'can_wide',
  CAN_NARROW: 'can_narrow',
  CAN_SHAKE: 'can_shake',
  CAN_TRAP: 'can_trap',

  // 이펙트
  FX_PERFECT_SPARKLE: 'fx_perfect_sparkle',
  FX_GOOD_DUST: 'fx_good_dust',
  FX_LAND_IMPACT: 'fx_land_impact',
  FX_COMBO_BURST: 'fx_combo_burst',
  FX_COIN_COLLECT: 'fx_coin_collect',
  FX_NEW_RECORD_FLASH: 'fx_new_record_flash',
  FX_NEW_RECORD_CONFETTI: 'fx_new_record_confetti',
  FX_MISSION_COMPLETE: 'fx_mission_complete',
  FX_SCREEN_FLASH: 'fx_screen_flash',
  FX_AD_LOADING: 'fx_ad_loading',

  // HUD
  HUD_SCORE_BG: 'hud_score_bg',
  HUD_FLOOR_BG: 'hud_floor_bg',
  HUD_COMBO_BG: 'hud_combo_bg',
  HUD_ENERGY_FULL: 'hud_energy_full',
  HUD_ENERGY_EMPTY: 'hud_energy_empty',
  HUD_ENERGY_TIMER: 'hud_energy_timer',
  HUD_MISSION_TRACKER: 'hud_mission_tracker',
  PROGRESS_BAR_BG: 'progress_bar_bg',
  PROGRESS_BAR_FILL: 'progress_bar_fill',

  // 아이콘
  ICON_COIN: 'icon_coin',
  ICON_DIAMOND: 'icon_diamond',
  ICON_ENERGY: 'icon_energy',
  ICON_HEART: 'icon_heart',
  ICON_STAR: 'icon_star',
  ICON_TROPHY: 'icon_trophy',
  ICON_GIFT: 'icon_gift',
  ICON_MISSION: 'icon_mission',
  ICON_LOCK: 'icon_lock',
  ICON_CHECK: 'icon_check',
  ICON_INFO: 'icon_info',
  ICON_MUSIC: 'icon_music',
  ICON_VOLUME: 'icon_volume',

  // 메달
  MEDAL_BRONZE: 'medal_bronze',
  MEDAL_SILVER: 'medal_silver',
  MEDAL_GOLD: 'medal_gold',
  MEDAL_PLATINUM: 'medal_platinum',

  // 패널
  PANEL_BASIC: 'panel_basic',
  PANEL_HEADER: 'panel_header',
  PANEL_GAMEOVER: 'panel_gameover',
  PANEL_MISSION: 'panel_mission',
  PANEL_LOGIN_REWARD: 'panel_login_reward',
  PANEL_OFFLINE_REWARD: 'panel_offline_reward',
  PANEL_AD_PREVIEW: 'panel_ad_preview',

  // 튜토리얼
  TUTO_HAND: 'tuto_hand',
  TUTO_ARROW: 'tuto_arrow',
  TUTO_HIGHLIGHT: 'tuto_highlight',
  TUTO_SPEECH_BUBBLE: 'tuto_speech_bubble',
  TUTO_PERFECT_ZONE: 'tuto_perfect_zone',
} as const;

// 오디오 에셋 키
export const AUDIO_KEYS = {
  // BGM
  BGM_MENU: 'bgm_menu',
  BGM_GAME: 'bgm_game',

  // 게임플레이
  SFX_JUMP: 'sfx_jump',
  SFX_LAND: 'sfx_land',
  SFX_LAND_PERFECT: 'sfx_land_perfect',
  SFX_LAND_GOOD: 'sfx_land_good',
  SFX_LAND_MISS: 'sfx_land_miss',
  SFX_FALL: 'sfx_fall',
  SFX_GAME_OVER: 'sfx_game_over',

  // 콤보
  SFX_COMBO_UP: 'sfx_combo_up',
  SFX_COMBO_BREAK: 'sfx_combo_break',
  SFX_COMBO_MILESTONE: 'sfx_combo_milestone',

  // 보상
  SFX_COIN: 'sfx_coin',
  SFX_COIN_COLLECT: 'sfx_coin_collect',
  SFX_COIN_RAIN: 'sfx_coin_rain',
  SFX_DIAMOND_GET: 'sfx_diamond_get',
  SFX_GIFT_OPEN: 'sfx_gift_open',

  // UI
  SFX_BUTTON: 'sfx_button',
  SFX_BUTTON_CLICK: 'sfx_button_click',
  SFX_MENU_OPEN: 'sfx_menu_open',
  SFX_POPUP_OPEN: 'sfx_popup_open',
  SFX_POPUP_CLOSE: 'sfx_popup_close',

  // 특수
  SFX_NEW_RECORD: 'sfx_new_record',
  SFX_LEVEL_UP: 'sfx_level_up',
  SFX_REVIVAL: 'sfx_revival',
} as const;

// 에셋 경로 정의
export const ASSET_PATHS = {
  IMAGES: 'assets/images',
  AUDIO: 'assets/audio',
} as const;

/**
 * 이미지 에셋 로드 목록 생성
 */
export function getImageAssets(): Array<{ key: string; path: string }> {
  return [
    // 버튼
    { key: IMAGE_KEYS.BTN_PLAY, path: 'buttons/btn_play_normal.png' },
    { key: IMAGE_KEYS.BTN_PLAY_HOVER, path: 'buttons/btn_play_hover.png' },
    { key: IMAGE_KEYS.BTN_PLAY_PRESSED, path: 'buttons/btn_play_pressed.png' },
    { key: IMAGE_KEYS.BTN_SETTINGS, path: 'buttons/btn_settings_normal.png' },
    { key: IMAGE_KEYS.BTN_SETTINGS_HOVER, path: 'buttons/btn_settings_hover.png' },
    { key: IMAGE_KEYS.BTN_SETTINGS_PRESSED, path: 'buttons/btn_settings_pressed.png' },
    { key: IMAGE_KEYS.BTN_SHOP, path: 'buttons/btn_shop_normal.png' },
    { key: IMAGE_KEYS.BTN_SHOP_HOVER, path: 'buttons/btn_shop_hover.png' },
    { key: IMAGE_KEYS.BTN_SHOP_PRESSED, path: 'buttons/btn_shop_pressed.png' },
    { key: IMAGE_KEYS.BTN_MISSION, path: 'buttons/btn_mission_normal.png' },
    { key: IMAGE_KEYS.BTN_MISSION_HOVER, path: 'buttons/btn_mission_hover.png' },
    { key: IMAGE_KEYS.BTN_MISSION_PRESSED, path: 'buttons/btn_mission_pressed.png' },
    { key: IMAGE_KEYS.BTN_LEADERBOARD, path: 'buttons/btn_leaderboard_normal.png' },
    { key: IMAGE_KEYS.BTN_LEADERBOARD_HOVER, path: 'buttons/btn_leaderboard_hover.png' },
    { key: IMAGE_KEYS.BTN_LEADERBOARD_PRESSED, path: 'buttons/btn_leaderboard_pressed.png' },
    { key: IMAGE_KEYS.BTN_BACK, path: 'buttons/btn_back_normal.png' },
    { key: IMAGE_KEYS.BTN_BACK_HOVER, path: 'buttons/btn_back_hover.png' },
    { key: IMAGE_KEYS.BTN_BACK_PRESSED, path: 'buttons/btn_back_pressed.png' },
    { key: IMAGE_KEYS.BTN_CLOSE, path: 'buttons/btn_close_normal.png' },
    { key: IMAGE_KEYS.BTN_CLOSE_HOVER, path: 'buttons/btn_close_hover.png' },
    { key: IMAGE_KEYS.BTN_CLOSE_PRESSED, path: 'buttons/btn_close_pressed.png' },
    { key: IMAGE_KEYS.BTN_SHARE, path: 'buttons/btn_share_normal.png' },
    { key: IMAGE_KEYS.BTN_SHARE_HOVER, path: 'buttons/btn_share_hover.png' },
    { key: IMAGE_KEYS.BTN_SHARE_PRESSED, path: 'buttons/btn_share_pressed.png' },
    { key: IMAGE_KEYS.BTN_ADWATCH, path: 'buttons/btn_adwatch_normal.png' },
    { key: IMAGE_KEYS.BTN_ADWATCH_HOVER, path: 'buttons/btn_adwatch_hover.png' },
    { key: IMAGE_KEYS.BTN_ADWATCH_PRESSED, path: 'buttons/btn_adwatch_pressed.png' },

    // 캔
    { key: IMAGE_KEYS.CAN_TUNA, path: 'cans/can_tuna.png' },
    { key: IMAGE_KEYS.CAN_SALMON, path: 'cans/can_salmon.png' },
    { key: IMAGE_KEYS.CAN_CHICKEN, path: 'cans/can_chicken.png' },
    { key: IMAGE_KEYS.CAN_BEEF, path: 'cans/can_beef.png' },
    { key: IMAGE_KEYS.CAN_MIX, path: 'cans/can_mix.png' },
    { key: IMAGE_KEYS.CAN_GOLDEN, path: 'cans/can_golden.png' },
    { key: IMAGE_KEYS.CAN_GOLD, path: 'cans/can_gold.png' },
    { key: IMAGE_KEYS.CAN_GIFT, path: 'cans/can_gift.png' },
    { key: IMAGE_KEYS.CAN_WIDE, path: 'cans/can_wide.png' },
    { key: IMAGE_KEYS.CAN_NARROW, path: 'cans/can_narrow.png' },
    { key: IMAGE_KEYS.CAN_SHAKE, path: 'cans/can_shake.png' },
    { key: IMAGE_KEYS.CAN_TRAP, path: 'cans/can_trap.png' },

    // 이펙트
    { key: IMAGE_KEYS.FX_PERFECT_SPARKLE, path: 'effects/fx_perfect_sparkle.png' },
    { key: IMAGE_KEYS.FX_GOOD_DUST, path: 'effects/fx_good_dust.png' },
    { key: IMAGE_KEYS.FX_LAND_IMPACT, path: 'effects/fx_land_impact.png' },
    { key: IMAGE_KEYS.FX_COMBO_BURST, path: 'effects/fx_combo_burst.png' },
    { key: IMAGE_KEYS.FX_COIN_COLLECT, path: 'effects/fx_coin_collect.png' },
    { key: IMAGE_KEYS.FX_NEW_RECORD_FLASH, path: 'effects/fx_new_record_flash.png' },
    { key: IMAGE_KEYS.FX_NEW_RECORD_CONFETTI, path: 'effects/fx_new_record_confetti.png' },
    { key: IMAGE_KEYS.FX_MISSION_COMPLETE, path: 'effects/fx_mission_complete.png' },
    { key: IMAGE_KEYS.FX_SCREEN_FLASH, path: 'effects/fx_screen_flash.png' },
    { key: IMAGE_KEYS.FX_AD_LOADING, path: 'effects/fx_ad_loading.png' },

    // HUD
    { key: IMAGE_KEYS.HUD_SCORE_BG, path: 'hud/hud_score_bg.png' },
    { key: IMAGE_KEYS.HUD_FLOOR_BG, path: 'hud/hud_floor_bg.png' },
    { key: IMAGE_KEYS.HUD_COMBO_BG, path: 'hud/hud_combo_bg.png' },
    { key: IMAGE_KEYS.HUD_ENERGY_FULL, path: 'hud/hud_energy_full.png' },
    { key: IMAGE_KEYS.HUD_ENERGY_EMPTY, path: 'hud/hud_energy_empty.png' },
    { key: IMAGE_KEYS.HUD_ENERGY_TIMER, path: 'hud/hud_energy_timer.png' },
    { key: IMAGE_KEYS.HUD_MISSION_TRACKER, path: 'hud/hud_mission_tracker.png' },
    { key: IMAGE_KEYS.PROGRESS_BAR_BG, path: 'hud/progress_bar_bg.png' },
    { key: IMAGE_KEYS.PROGRESS_BAR_FILL, path: 'hud/progress_bar_fill.png' },

    // 아이콘
    { key: IMAGE_KEYS.ICON_COIN, path: 'icons/icon_coin.png' },
    { key: IMAGE_KEYS.ICON_DIAMOND, path: 'icons/icon_diamond.png' },
    { key: IMAGE_KEYS.ICON_ENERGY, path: 'icons/icon_energy.png' },
    { key: IMAGE_KEYS.ICON_HEART, path: 'icons/icon_heart.png' },
    { key: IMAGE_KEYS.ICON_STAR, path: 'icons/icon_star.png' },
    { key: IMAGE_KEYS.ICON_TROPHY, path: 'icons/icon_trophy.png' },
    { key: IMAGE_KEYS.ICON_GIFT, path: 'icons/icon_gift.png' },
    { key: IMAGE_KEYS.ICON_MISSION, path: 'icons/icon_mission.png' },
    { key: IMAGE_KEYS.ICON_LOCK, path: 'icons/icon_lock.png' },
    { key: IMAGE_KEYS.ICON_CHECK, path: 'icons/icon_check.png' },
    { key: IMAGE_KEYS.ICON_INFO, path: 'icons/icon_info.png' },
    { key: IMAGE_KEYS.ICON_MUSIC, path: 'icons/icon_music.png' },
    { key: IMAGE_KEYS.ICON_VOLUME, path: 'icons/icon_volume.png' },

    // 메달
    { key: IMAGE_KEYS.MEDAL_BRONZE, path: 'medals/medal_bronze.png' },
    { key: IMAGE_KEYS.MEDAL_SILVER, path: 'medals/medal_silver.png' },
    { key: IMAGE_KEYS.MEDAL_GOLD, path: 'medals/medal_gold.png' },
    { key: IMAGE_KEYS.MEDAL_PLATINUM, path: 'medals/medal_platinum.png' },

    // 패널
    { key: IMAGE_KEYS.PANEL_BASIC, path: 'panels/panel_basic.png' },
    { key: IMAGE_KEYS.PANEL_HEADER, path: 'panels/panel_header.png' },
    { key: IMAGE_KEYS.PANEL_GAMEOVER, path: 'panels/panel_gameover.png' },
    { key: IMAGE_KEYS.PANEL_MISSION, path: 'panels/panel_mission.png' },
    { key: IMAGE_KEYS.PANEL_LOGIN_REWARD, path: 'panels/panel_login_reward.png' },
    { key: IMAGE_KEYS.PANEL_OFFLINE_REWARD, path: 'panels/panel_offline_reward.png' },
    { key: IMAGE_KEYS.PANEL_AD_PREVIEW, path: 'panels/panel_ad_preview.png' },

    // 튜토리얼
    { key: IMAGE_KEYS.TUTO_HAND, path: 'tutorial/tuto_hand.png' },
    { key: IMAGE_KEYS.TUTO_ARROW, path: 'tutorial/tuto_arrow.png' },
    { key: IMAGE_KEYS.TUTO_HIGHLIGHT, path: 'tutorial/tuto_highlight.png' },
    { key: IMAGE_KEYS.TUTO_SPEECH_BUBBLE, path: 'tutorial/tuto_speech_bubble.png' },
    { key: IMAGE_KEYS.TUTO_PERFECT_ZONE, path: 'tutorial/tuto_perfect_zone.png' },
  ];
}

/**
 * 오디오 에셋 로드 목록 생성
 */
export function getAudioAssets(): Array<{ key: string; path: string }> {
  return [
    // 게임플레이
    { key: AUDIO_KEYS.SFX_JUMP, path: 'sfx_jump.wav' },
    { key: AUDIO_KEYS.SFX_LAND, path: 'sfx_land.wav' },
    { key: AUDIO_KEYS.SFX_LAND_PERFECT, path: 'sfx_land_perfect.wav' },
    { key: AUDIO_KEYS.SFX_LAND_GOOD, path: 'sfx_land_good.wav' },
    { key: AUDIO_KEYS.SFX_LAND_MISS, path: 'sfx_land_miss.wav' },
    { key: AUDIO_KEYS.SFX_FALL, path: 'sfx_fall.wav' },
    { key: AUDIO_KEYS.SFX_GAME_OVER, path: 'sfx_game_over.wav' },

    // 콤보
    { key: AUDIO_KEYS.SFX_COMBO_UP, path: 'sfx_combo_up.wav' },
    { key: AUDIO_KEYS.SFX_COMBO_BREAK, path: 'sfx_combo_break.wav' },
    { key: AUDIO_KEYS.SFX_COMBO_MILESTONE, path: 'sfx_combo_milestone.wav' },

    // 보상
    { key: AUDIO_KEYS.SFX_COIN, path: 'sfx_coin.wav' },
    { key: AUDIO_KEYS.SFX_COIN_COLLECT, path: 'sfx_coin_collect.wav' },
    { key: AUDIO_KEYS.SFX_COIN_RAIN, path: 'sfx_coin_rain.wav' },
    { key: AUDIO_KEYS.SFX_DIAMOND_GET, path: 'sfx_diamond_get.wav' },
    { key: AUDIO_KEYS.SFX_GIFT_OPEN, path: 'sfx_gift_open.wav' },

    // UI
    { key: AUDIO_KEYS.SFX_BUTTON, path: 'sfx_button.wav' },
    { key: AUDIO_KEYS.SFX_BUTTON_CLICK, path: 'sfx_button_click.wav' },
    { key: AUDIO_KEYS.SFX_MENU_OPEN, path: 'sfx_menu_open.wav' },
    { key: AUDIO_KEYS.SFX_POPUP_OPEN, path: 'sfx_popup_open.wav' },
    { key: AUDIO_KEYS.SFX_POPUP_CLOSE, path: 'sfx_popup_close.wav' },

    // 특수
    { key: AUDIO_KEYS.SFX_NEW_RECORD, path: 'sfx_new_record.wav' },
    { key: AUDIO_KEYS.SFX_LEVEL_UP, path: 'sfx_level_up.wav' },
    { key: AUDIO_KEYS.SFX_REVIVAL, path: 'sfx_revival.wav' },

    // BGM
    { key: AUDIO_KEYS.BGM_MENU, path: 'bgm_menu.mp3' },
    { key: AUDIO_KEYS.BGM_GAME, path: 'bgm_game.mp3' },
  ];
}
