import Phaser from 'phaser';
import { AUDIO_KEYS } from '@config/AssetConfig';
import { SaveManager } from './SaveManager';

/**
 * 오디오 관리자 - 사운드/음악 재생 관리
 */
class AudioManagerClass {
  private scene: Phaser.Scene | null = null;
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
  private soundEnabled = true;
  private musicEnabled = true;
  private masterVolume = 1.0;
  private sfxVolume = 1.0;
  private _musicVolume = 0.7;

  /**
   * 씬 설정 - 오디오 재생을 위해 필요
   */
  setScene(scene: Phaser.Scene): void {
    this.scene = scene;
    this.loadSettings();
  }

  /**
   * 설정 로드
   */
  private loadSettings(): void {
    const data = SaveManager.getData();
    this.soundEnabled = data.settings.sound;
    this.musicEnabled = data.settings.music;
  }

  /**
   * 효과음 재생
   */
  playSfx(key: string, config?: Phaser.Types.Sound.SoundConfig): void {
    if (!this.scene || !this.soundEnabled) return;

    try {
      const volume = (config?.volume ?? 1) * this.sfxVolume * this.masterVolume;
      this.scene.sound.play(key, { ...config, volume });
    } catch (error) {
      console.warn(`[AudioManager] SFX 재생 실패: ${key}`, error);
    }
  }

  /**
   * 점프 사운드
   */
  playJump(): void {
    this.playSfx(AUDIO_KEYS.SFX_JUMP);
  }

  /**
   * 착지 사운드 (판정별)
   */
  playLand(judgment: 'perfect' | 'good' | 'miss'): void {
    switch (judgment) {
      case 'perfect':
        this.playSfx(AUDIO_KEYS.SFX_LAND_PERFECT);
        break;
      case 'good':
        this.playSfx(AUDIO_KEYS.SFX_LAND_GOOD);
        break;
      case 'miss':
        this.playSfx(AUDIO_KEYS.SFX_LAND_MISS);
        break;
    }
  }

  /**
   * 기본 착지 사운드
   */
  playLandNormal(): void {
    this.playSfx(AUDIO_KEYS.SFX_LAND);
  }

  /**
   * 떨어짐 사운드
   */
  playFall(): void {
    this.playSfx(AUDIO_KEYS.SFX_FALL);
  }

  /**
   * 게임 오버 사운드
   */
  playGameOver(): void {
    this.playSfx(AUDIO_KEYS.SFX_GAME_OVER);
  }

  /**
   * 콤보 증가 사운드
   */
  playComboUp(): void {
    this.playSfx(AUDIO_KEYS.SFX_COMBO_UP);
  }

  /**
   * 콤보 마일스톤 사운드 (5, 10, 20 등)
   */
  playComboMilestone(): void {
    this.playSfx(AUDIO_KEYS.SFX_COMBO_MILESTONE);
  }

  /**
   * 콤보 끊김 사운드
   */
  playComboBreak(): void {
    this.playSfx(AUDIO_KEYS.SFX_COMBO_BREAK);
  }

  /**
   * 코인 획득 사운드
   */
  playCoinCollect(): void {
    this.playSfx(AUDIO_KEYS.SFX_COIN_COLLECT);
  }

  /**
   * 다이아몬드 획득 사운드
   */
  playDiamondGet(): void {
    this.playSfx(AUDIO_KEYS.SFX_DIAMOND_GET);
  }

  /**
   * 버튼 클릭 사운드
   */
  playButtonClick(): void {
    this.playSfx(AUDIO_KEYS.SFX_BUTTON_CLICK);
  }

  /**
   * 팝업 열기 사운드
   */
  playPopupOpen(): void {
    this.playSfx(AUDIO_KEYS.SFX_POPUP_OPEN);
  }

  /**
   * 팝업 닫기 사운드
   */
  playPopupClose(): void {
    this.playSfx(AUDIO_KEYS.SFX_POPUP_CLOSE);
  }

  /**
   * 신기록 사운드
   */
  playNewRecord(): void {
    this.playSfx(AUDIO_KEYS.SFX_NEW_RECORD);
  }

  /**
   * 레벨업 사운드
   */
  playLevelUp(): void {
    this.playSfx(AUDIO_KEYS.SFX_LEVEL_UP);
  }

  /**
   * 부활 사운드
   */
  playRevival(): void {
    this.playSfx(AUDIO_KEYS.SFX_REVIVAL);
  }

  /**
   * 선물 열기 사운드
   */
  playGiftOpen(): void {
    this.playSfx(AUDIO_KEYS.SFX_GIFT_OPEN);
  }

  /**
   * 사운드 ON/OFF
   */
  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    SaveManager.updateSettings({ sound: enabled });
  }

  /**
   * 음악 ON/OFF
   */
  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    SaveManager.updateSettings({ music: enabled });

    // 현재 재생 중인 음악 처리
    if (!enabled && this.scene) {
      this.scene.sound.stopAll();
    }
  }

  /**
   * 사운드 활성화 여부
   */
  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * 음악 활성화 여부
   */
  isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  /**
   * 마스터 볼륨 설정
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * SFX 볼륨 설정
   */
  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * 음악 볼륨 설정
   */
  setMusicVolume(volume: number): void {
    this._musicVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * 음악 볼륨 가져오기
   */
  getMusicVolume(): number {
    return this._musicVolume;
  }

  /**
   * 모든 사운드 정지
   */
  stopAll(): void {
    if (this.scene) {
      this.scene.sound.stopAll();
    }
  }

  /**
   * 리소스 정리
   */
  cleanup(): void {
    this.stopAll();
    this.sounds.clear();
    this.scene = null;
  }
}

export const AudioManager = new AudioManagerClass();
