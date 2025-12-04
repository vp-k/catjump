/**
 * 공유 서비스 - 스크린샷 캡처 및 공유 기능
 */

import { SaveManager } from '@managers/SaveManager';

// Kakao SDK 타입 선언
declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      Share: {
        sendDefault: (params: KakaoShareParams) => void;
      };
    };
  }
}

interface KakaoShareParams {
  objectType: string;
  content: {
    title: string;
    description: string;
    imageUrl: string;
    link: {
      mobileWebUrl: string;
      webUrl: string;
    };
  };
  buttons: Array<{
    title: string;
    link: {
      mobileWebUrl: string;
      webUrl: string;
    };
  }>;
}

/**
 * 공유 플랫폼 타입
 */
export type SharePlatform = 'twitter' | 'facebook' | 'kakao' | 'clipboard' | 'native';

/**
 * 공유 데이터
 */
export interface ShareData {
  score: number;
  floor: number;
  isNewRecord: boolean;
  screenshot?: string; // base64 이미지
}

/**
 * 공유 결과
 */
export interface ShareResult {
  success: boolean;
  platform: SharePlatform;
  rewardGiven: boolean;
}

/**
 * 공유 보상 설정
 */
const SHARE_REWARDS = {
  coins: 50,
  cooldownMs: 24 * 60 * 60 * 1000, // 24시간 쿨다운
};

/**
 * 공유 서비스 클래스
 */
class ShareServiceClass {
  private lastShareTime: number = 0;
  private gameInstance: Phaser.Game | null = null;

  /**
   * 게임 인스턴스 설정
   */
  setGameInstance(game: Phaser.Game): void {
    this.gameInstance = game;
  }

  /**
   * 스크린샷 캡처
   */
  async captureScreenshot(): Promise<string | null> {
    if (!this.gameInstance) {
      console.warn('[ShareService] 게임 인스턴스 없음');
      return null;
    }

    try {
      // Phaser의 캔버스에서 스크린샷 추출
      const canvas = this.gameInstance.canvas;
      const dataUrl = canvas.toDataURL('image/png');
      console.log('[ShareService] 스크린샷 캡처 완료');
      return dataUrl;
    } catch (error) {
      console.error('[ShareService] 스크린샷 캡처 실패:', error);
      return null;
    }
  }

  /**
   * 공유 텍스트 생성
   */
  generateShareText(data: ShareData): string {
    const { score, floor, isNewRecord } = data;
    const recordText = isNewRecord ? '🎉 신기록! ' : '';

    return `${recordText}Cat Jump에서 ${floor}층 달성! (${score.toLocaleString()}점)\n` +
      `🐱 나와 대결하러 오세요!\n` +
      `#CatJump #고양이점프`;
  }

  /**
   * 공유 URL 생성
   */
  getShareUrl(): string {
    // 앱 스토어 URL이나 웹 게임 URL
    return 'https://catjump.game'; // 실제 URL로 변경 필요
  }

  /**
   * 플랫폼별 공유
   */
  async share(platform: SharePlatform, data: ShareData): Promise<ShareResult> {
    const shareText = this.generateShareText(data);
    const shareUrl = this.getShareUrl();

    let success = false;

    try {
      switch (platform) {
        case 'native':
          success = await this.shareNative(shareText, shareUrl, data.screenshot);
          break;
        case 'twitter':
          success = this.shareTwitter(shareText, shareUrl);
          break;
        case 'facebook':
          success = this.shareFacebook(shareUrl);
          break;
        case 'kakao':
          success = await this.shareKakao(shareText, shareUrl, data);
          break;
        case 'clipboard':
          success = await this.shareClipboard(shareText, shareUrl);
          break;
      }
    } catch (error) {
      console.error(`[ShareService] ${platform} 공유 실패:`, error);
      success = false;
    }

    // 공유 보상 처리
    const rewardGiven = success ? this.giveShareReward() : false;

    // 공유 횟수 기록
    if (success) {
      this.recordShare(platform);
    }

    return { success, platform, rewardGiven };
  }

  /**
   * 네이티브 공유 API (Web Share API)
   */
  private async shareNative(
    text: string,
    url: string,
    screenshot?: string
  ): Promise<boolean> {
    if (!navigator.share) {
      console.warn('[ShareService] Web Share API 미지원');
      return false;
    }


    // 기본 공유 데이터
    const webShareData: {
      title: string;
      text: string;
      url: string;
      files?: File[];
    } = {
      title: 'Cat Jump',
      text,
      url,
    };

    // 스크린샷이 있으면 파일로 변환
    if (screenshot && navigator.canShare) {
      try {
        const response = await fetch(screenshot);
        const blob = await response.blob();
        const file = new File([blob], 'catjump-score.png', { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          webShareData.files = [file];
        }
      } catch (error) {
        console.warn('[ShareService] 이미지 파일 변환 실패:', error);
      }
    }

    try {
      await navigator.share(webShareData);
      console.log('[ShareService] 네이티브 공유 성공');
      return true;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // 사용자가 공유 취소
        console.log('[ShareService] 사용자가 공유 취소');
        return false;
      }
      throw error;
    }
  }

  /**
   * 트위터 공유
   */
  private shareTwitter(text: string, url: string): boolean {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    return true;
  }

  /**
   * 페이스북 공유
   */
  private shareFacebook(url: string): boolean {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    return true;
  }

  /**
   * 카카오톡 공유
   */
  private async shareKakao(
    text: string,
    url: string,
    data: ShareData
  ): Promise<boolean> {
    // Kakao SDK가 로드되어 있는지 확인
    if (!window.Kakao) {
      console.warn('[ShareService] Kakao SDK 미로드');
      return this.shareClipboard(text, url);
    }

    if (!window.Kakao.isInitialized()) {
      console.warn('[ShareService] Kakao SDK 초기화 안됨');
      return this.shareClipboard(text, url);
    }

    try {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: data.isNewRecord ? '신기록 달성!' : 'Cat Jump 점수 공유',
          description: `${data.floor}층 달성! (${data.score.toLocaleString()}점)`,
          imageUrl: data.screenshot || 'https://catjump.game/og-image.png',
          link: {
            mobileWebUrl: url,
            webUrl: url,
          },
        },
        buttons: [
          {
            title: '나도 도전하기',
            link: {
              mobileWebUrl: url,
              webUrl: url,
            },
          },
        ],
      });
      return true;
    } catch (error) {
      console.error('[ShareService] 카카오 공유 실패:', error);
      return false;
    }
  }

  /**
   * 클립보드 복사
   */
  private async shareClipboard(text: string, url: string): Promise<boolean> {
    const fullText = `${text}\n${url}`;

    try {
      await navigator.clipboard.writeText(fullText);
      console.log('[ShareService] 클립보드 복사 완료');
      return true;
    } catch (error) {
      // 폴백: execCommand 사용
      try {
        const textarea = document.createElement('textarea');
        textarea.value = fullText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        console.log('[ShareService] 클립보드 복사 완료 (fallback)');
        return true;
      } catch (fallbackError) {
        console.error('[ShareService] 클립보드 복사 실패:', fallbackError);
        return false;
      }
    }
  }

  /**
   * 공유 보상 지급
   */
  private giveShareReward(): boolean {
    const now = Date.now();
    const lastRewardTime = this.getLastRewardTime();

    // 쿨다운 체크
    if (now - lastRewardTime < SHARE_REWARDS.cooldownMs) {
      console.log('[ShareService] 공유 보상 쿨다운 중');
      return false;
    }

    // 보상 지급
    SaveManager.addCoins(SHARE_REWARDS.coins);

    // 마지막 보상 시간 기록
    localStorage.setItem('catjump_last_share_reward', now.toString());
    this.lastShareTime = now;

    console.log(`[ShareService] 공유 보상 지급: ${SHARE_REWARDS.coins} 코인`);
    return true;
  }

  /**
   * 마지막 보상 시간 조회
   */
  private getLastRewardTime(): number {
    if (this.lastShareTime > 0) return this.lastShareTime;

    const saved = localStorage.getItem('catjump_last_share_reward');
    this.lastShareTime = saved ? parseInt(saved, 10) : 0;
    return this.lastShareTime;
  }

  /**
   * 공유 횟수 기록
   */
  private recordShare(_platform: SharePlatform): void {
    const saveData = SaveManager.getData();
    const totalShares = (saveData.stats.totalShares || 0) + 1;
    SaveManager.updateStats({ totalShares });
  }

  /**
   * 공유 보상 가능 여부
   */
  canGetShareReward(): boolean {
    const now = Date.now();
    const lastRewardTime = this.getLastRewardTime();
    return now - lastRewardTime >= SHARE_REWARDS.cooldownMs;
  }

  /**
   * 다음 공유 보상까지 남은 시간 (ms)
   */
  getTimeUntilNextReward(): number {
    const now = Date.now();
    const lastRewardTime = this.getLastRewardTime();
    const remaining = SHARE_REWARDS.cooldownMs - (now - lastRewardTime);
    return Math.max(0, remaining);
  }

  /**
   * 공유 보상 정보
   */
  getRewardInfo(): { coins: number; cooldownMs: number } {
    return { ...SHARE_REWARDS };
  }

  /**
   * Web Share API 지원 여부
   */
  isNativeShareSupported(): boolean {
    return typeof navigator.share === 'function';
  }
}

export const ShareService = new ShareServiceClass();
