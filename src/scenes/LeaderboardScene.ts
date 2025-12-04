import Phaser from 'phaser';
import { SCENE_KEYS } from '@config/GameConfig';
import { AudioManager } from '@managers/AudioManager';
import { LeaderboardService, LeaderboardEntry, LeaderboardType } from '@services/LeaderboardService';

/**
 * 리더보드 씬 - 순위표 화면
 */
export class LeaderboardScene extends Phaser.Scene {
  private currentType: LeaderboardType = 'global';
  private currentPage = 1;
  private isLoading = false;
  private entries: LeaderboardEntry[] = [];
  private hasMore = false;
  private myRank: number | null = null;

  // UI 요소
  private listContainer!: Phaser.GameObjects.Container;
  private loadingText!: Phaser.GameObjects.Text;
  private tabButtons: Map<LeaderboardType, Phaser.GameObjects.Text> = new Map();
  private myRankText!: Phaser.GameObjects.Text;
  private loadMoreButton!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENE_KEYS.LEADERBOARD });
  }

  create(): void {
    AudioManager.setScene(this);

    this.createBackground();
    this.createHeader();
    this.createTabs();
    this.createListContainer();
    this.createMyRankPanel();
    this.createBackButton();

    // 초기 데이터 로드
    this.loadLeaderboard(true);
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, width, height);
  }

  private createHeader(): void {
    const { width } = this.cameras.main;

    // 제목
    this.add
      .text(width / 2, 40, '리더보드', {
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // 트로피 아이콘 (간단한 그래픽)
    const trophy = this.add.graphics();
    trophy.fillStyle(0xffd700);
    trophy.fillRect(width / 2 - 60, 25, 20, 30);
    trophy.fillCircle(width / 2 - 50, 25, 12);
  }

  private createTabs(): void {
    const { width } = this.cameras.main;
    const tabY = 90;
    const tabWidth = 100;

    const tabs: { type: LeaderboardType; label: string }[] = [
      { type: 'global', label: '전체' },
      { type: 'weekly', label: '주간' },
      { type: 'friends', label: '친구' },
    ];

    tabs.forEach((tab, index) => {
      const x = width / 2 + (index - 1) * (tabWidth + 10);
      const isActive = tab.type === this.currentType;

      const tabBtn = this.add
        .text(x, tabY, tab.label, {
          fontSize: '18px',
          color: isActive ? '#ffffff' : '#888888',
          backgroundColor: isActive ? '#4ade80' : '#333333',
          padding: { x: 20, y: 10 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      tabBtn.on('pointerdown', () => {
        AudioManager.playButtonClick();
        this.switchTab(tab.type);
      });

      this.tabButtons.set(tab.type, tabBtn);
    });
  }

  private switchTab(type: LeaderboardType): void {
    if (type === this.currentType || this.isLoading) return;

    this.currentType = type;
    this.currentPage = 1;

    // 탭 스타일 업데이트
    this.tabButtons.forEach((btn, tabType) => {
      const isActive = tabType === type;
      btn.setStyle({
        color: isActive ? '#ffffff' : '#888888',
        backgroundColor: isActive ? '#4ade80' : '#333333',
      });
    });

    this.loadLeaderboard(true);
  }

  private createListContainer(): void {
    const { width, height } = this.cameras.main;

    this.listContainer = this.add.container(0, 130);

    // 로딩 텍스트
    this.loadingText = this.add
      .text(width / 2, 200, '로딩 중...', {
        fontSize: '20px',
        color: '#888888',
      })
      .setOrigin(0.5);

    // 더 보기 버튼
    this.loadMoreButton = this.add
      .text(width / 2, height - 150, '더 보기', {
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#3b82f6',
        padding: { x: 30, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);

    this.loadMoreButton.on('pointerdown', () => {
      AudioManager.playButtonClick();
      this.loadMore();
    });
  }

  private createMyRankPanel(): void {
    const { width, height } = this.cameras.main;

    // 내 순위 패널 배경
    const panel = this.add.graphics();
    panel.fillStyle(0x2a2a4e, 0.9);
    panel.fillRoundedRect(20, height - 120, width - 40, 60, 10);

    // 내 순위 텍스트
    this.myRankText = this.add
      .text(width / 2, height - 90, '내 순위: 로딩 중...', {
        fontSize: '18px',
        color: '#ffd700',
      })
      .setOrigin(0.5);
  }

  private createBackButton(): void {
    const backBtn = this.add
      .text(30, 40, '←', {
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    backBtn.on('pointerdown', () => {
      AudioManager.playButtonClick();
      this.scene.start(SCENE_KEYS.MENU);
    });
  }

  private async loadLeaderboard(reset: boolean = false): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;
    this.loadingText.setVisible(true);
    this.loadMoreButton.setVisible(false);

    if (reset) {
      this.currentPage = 1;
      this.entries = [];
      this.clearList();
    }

    try {
      const result = await LeaderboardService.getLeaderboard(
        this.currentType,
        this.currentPage
      );

      this.entries = reset ? result.entries : [...this.entries, ...result.entries];
      this.hasMore = result.hasMore;
      this.myRank = result.myRank;

      this.renderList();
      this.updateMyRankPanel();
    } catch (error) {
      console.error('[LeaderboardScene] 로드 실패:', error);
      this.showError('데이터를 불러올 수 없습니다');
    } finally {
      this.isLoading = false;
      this.loadingText.setVisible(false);
      this.loadMoreButton.setVisible(this.hasMore);
    }
  }

  private loadMore(): void {
    if (this.hasMore && !this.isLoading) {
      this.currentPage++;
      this.loadLeaderboard(false);
    }
  }

  private clearList(): void {
    this.listContainer.removeAll(true);
  }

  private renderList(): void {
    this.clearList();

    const { width } = this.cameras.main;
    const itemHeight = 50;
    const startY = 10;

    if (this.entries.length === 0) {
      const emptyText = this.add
        .text(width / 2, 100, '순위 정보가 없습니다', {
          fontSize: '18px',
          color: '#888888',
        })
        .setOrigin(0.5);
      this.listContainer.add(emptyText);
      return;
    }

    this.entries.forEach((entry, index) => {
      const y = startY + index * itemHeight;
      const itemContainer = this.createLeaderboardItem(entry, y);
      this.listContainer.add(itemContainer);
    });

    // 스크롤 가능 영역 설정
    const maxScroll = Math.max(0, this.entries.length * itemHeight - 300);
    this.setupScrolling(maxScroll);
  }

  private createLeaderboardItem(
    entry: LeaderboardEntry,
    y: number
  ): Phaser.GameObjects.Container {
    const { width } = this.cameras.main;
    const container = this.add.container(0, y);

    // 배경
    const bg = this.add.graphics();
    if (entry.isCurrentUser) {
      bg.fillStyle(0x4ade80, 0.3);
    } else if (entry.rank <= 3) {
      bg.fillStyle(0xffd700, 0.1);
    } else {
      bg.fillStyle(0x333333, 0.5);
    }
    bg.fillRoundedRect(20, 0, width - 40, 45, 8);
    container.add(bg);

    // 순위
    const rankColor = this.getRankColor(entry.rank);
    const rankText = this.add
      .text(50, 22, `${entry.rank}`, {
        fontSize: '20px',
        color: rankColor,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    container.add(rankText);

    // 순위 아이콘 (1, 2, 3위)
    if (entry.rank <= 3) {
      const medalColors = [0xffd700, 0xc0c0c0, 0xcd7f32];
      const medal = this.add.graphics();
      medal.fillStyle(medalColors[entry.rank - 1]);
      medal.fillCircle(50, 22, 15);
      medal.lineStyle(2, 0xffffff, 0.5);
      medal.strokeCircle(50, 22, 15);
      container.add(medal);
      rankText.setDepth(1);
    }

    // 닉네임
    const nickname = entry.isCurrentUser ? `${entry.nickname} (나)` : entry.nickname;
    const nicknameText = this.add
      .text(100, 15, nickname, {
        fontSize: '16px',
        color: entry.isCurrentUser ? '#4ade80' : '#ffffff',
      });
    container.add(nicknameText);

    // 점수
    const scoreText = this.add
      .text(width - 80, 15, LeaderboardService.formatScore(entry.score), {
        fontSize: '18px',
        color: '#ffd700',
        fontStyle: 'bold',
      })
      .setOrigin(1, 0);
    container.add(scoreText);

    // 층수
    const floorText = this.add
      .text(width - 80, 32, `${entry.floor}층`, {
        fontSize: '12px',
        color: '#888888',
      })
      .setOrigin(1, 0);
    container.add(floorText);

    return container;
  }

  private getRankColor(rank: number): string {
    if (rank === 1) return '#ffd700';
    if (rank === 2) return '#c0c0c0';
    if (rank === 3) return '#cd7f32';
    if (rank <= 10) return '#00bfff';
    return '#ffffff';
  }

  private updateMyRankPanel(): void {
    if (this.myRank) {
      const tier = LeaderboardService.getTier(this.myRank);
      this.myRankText.setText(`내 순위: ${this.myRank}위 (${tier.name})`);
    } else {
      this.myRankText.setText('순위 없음 - 게임을 플레이해보세요!');
    }
  }

  private showError(message: string): void {
    const { width } = this.cameras.main;

    const errorText = this.add
      .text(width / 2, 200, message, {
        fontSize: '18px',
        color: '#ff6b6b',
      })
      .setOrigin(0.5);

    this.listContainer.add(errorText);
  }

  private setupScrolling(maxScroll: number): void {
    if (maxScroll <= 0) return;

    let scrollY = 0;
    const { height } = this.cameras.main;

    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: Phaser.GameObjects.GameObject[], _deltaX: number, deltaY: number) => {
      scrollY = Phaser.Math.Clamp(scrollY + deltaY * 0.5, 0, maxScroll);
      this.listContainer.y = 130 - scrollY;
    });

    // 터치 드래그 스크롤
    let startY = 0;
    let startScrollY = 0;

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y > 130 && pointer.y < height - 120) {
        startY = pointer.y;
        startScrollY = scrollY;
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && startY > 0) {
        const deltaY = startY - pointer.y;
        scrollY = Phaser.Math.Clamp(startScrollY + deltaY, 0, maxScroll);
        this.listContainer.y = 130 - scrollY;
      }
    });

    this.input.on('pointerup', () => {
      startY = 0;
    });
  }

  /**
   * 씬 종료 시 정리
   */
  shutdown(): void {
    // 이벤트 리스너 제거
    this.input.off('wheel');
    this.input.off('pointerdown');
    this.input.off('pointermove');
    this.input.off('pointerup');

    // 탭 버튼 정리
    this.tabButtons.clear();
  }
}
