export class MyCustomPet {
  constructor() {
    // 기본 설정
    this.isActive = false;
    this.ownerId = null;
    this.grid = null;
    this.name = "Lily the Ghost";

    // 동작 관련 설정
    this.movementInterval = null;
    this.followRange = 8;
    this.loseInterestRange = 12;
    this.normalInterval = 3000;
    this.followingInterval = 1;
    this.maxMoveDistance = 3;
    this.maxFollowDistance = 3;
    this.flashDistance = 5;
    this.idealDistance = 2;
    this.moveDelay = 170;

    // 이모지 및 아이템 설정
    this.sadEmoji = "😢";
    this.heartEmoji = "❤️";
    this.flowerItemId = "flower";

    // 서버 URL 설정 (실제 서버 URL로 변경 필요)
    this.serverUrl = "http://localhost:3000";
    this.apiRequestQueue = [];
    this.isProcessingQueue = false;

    // 이벤트 리스너 설정
    this.setupEventListeners();

    // 감정 설정
    this.emotion = {
      happiness: 50,
      excitement: 50,
      tiredness: 50,
    };
    this.MAX_EMOTION = 100;
    this.MIN_EMOTION = 0;
    this.emotionDecayInterval = setInterval(() => this.decayEmotions(), 1000); // 1분마다 감정 감소

    // 이모지 큐 설정
    this.emojiQueue = [];
    this.isShowingEmoji = false;
    this.emojiDuration = 3000;

    // 메시지 관련 설정
    this.lastProcessedMessage = "";
    this.lastProcessedMessageFrom = "";
    this.lastProcessedGroupMessage = "";
    this.lastProcessedGroupMessageFrom = "";

    this.costume = {
      white: {
        skin: "gV7nljNpXAGHgAEnbBWv",
        hair: "3ZnyOry7q9szgHCU1URo",
        facial_hair: "",
        top: "GOIono5TlL1mMHqoryfb",
        bottom: "R-mO0WjmRySf-DdFAMmb",
        shoes: "qXZsUMXd6wr2ICupUTcz",
        hat: "",
        glasses: "",
        other: "",
        costume: "Mva4mNGosmKAroMHPP5j",
        mobility: "",
        jacket: "",
      },
      orange: {
        skin: "gV7nljNpXAGHgAEnbBWv",
        hair: "3ZnyOry7q9szgHCU1URo",
        facial_hair: "",
        top: "GOIono5TlL1mMHqoryfb",
        bottom: "R-mO0WjmRySf-DdFAMmb",
        shoes: "qXZsUMXd6wr2ICupUTcz",
        hat: "",
        glasses: "",
        other: "",
        costume: "RwIQhCJaKItQY2O5nQgD",
        mobility: "",
        jacket: "",
      },
      yellow: {
        skin: "gV7nljNpXAGHgAEnbBWv",
        hair: "3ZnyOry7q9szgHCU1URo",
        facial_hair: "",
        top: "GOIono5TlL1mMHqoryfb",
        bottom: "R-mO0WjmRySf-DdFAMmb",
        shoes: "qXZsUMXd6wr2ICupUTcz",
        hat: "",
        glasses: "",
        other: "",
        costume: "fQKQ0hT47tEiGOK8LH9D",
        mobility: "",
        jacket: "",
      },
      beige: {
        skin: "gV7nljNpXAGHgAEnbBWv",
        hair: "3ZnyOry7q9szgHCU1URo",
        facial_hair: "",
        top: "GOIono5TlL1mMHqoryfb",
        bottom: "R-mO0WjmRySf-DdFAMmb",
        shoes: "qXZsUMXd6wr2ICupUTcz",
        hat: "",
        glasses: "",
        other: "",
        costume: "arv3Gj35Qeu5vrpg-lTm",
        mobility: "",
        jacket: "",
      },
      gray: {
        skin: "gV7nljNpXAGHgAEnbBWv",
        hair: "3ZnyOry7q9szgHCU1URo",
        facial_hair: "",
        top: "GOIono5TlL1mMHqoryfb",
        bottom: "R-mO0WjmRySf-DdFAMmb",
        shoes: "qXZsUMXd6wr2ICupUTcz",
        hat: "",
        glasses: "",
        other: "",
        costume: "cKgv0pjT9PWQ5q5Xf4ib",
        mobility: "",
        jacket: "",
      },
      skyblue: {
        skin: "gV7nljNpXAGHgAEnbBWv",
        facial_hair: "",
        hair: "3ZnyOry7q9szgHCU1URo",
        top: "GOIono5TlL1mMHqoryfb",
        bottom: "R-mO0WjmRySf-DdFAMmb",
        shoes: "qXZsUMXd6wr2ICupUTcz",
        hat: "",
        glasses: "",
        other: "",
        costume: "arv3Gj35Qeu5vrpg-lTm",
        mobility: "",
        jacket: "",
      },
    };
  }

  // 행동 시작
  async startBehavior() {
    if (this.isActive) return;
    this.isActive = true;
    this.initializeGrid();
    this.startPeriodicCheck();
    await this.scheduleNextBehavior();
    console.log("Avatar pet behavior started!");
  }

  // 행동 정지
  stopBehavior() {
    if (!this.isActive) return;
    this.isActive = false;
    clearTimeout(this.movementInterval);
    this.ownerId = null;
    console.log("Avatar pet behavior stopped.");
  }

  // 그리드 초기화
  initializeGrid() {
    const map = game.completeMaps[game.getMyPlayer().map];
    if (!map) return;

    this.grid = new Array(60).fill(null).map(() => new Array(126).fill(1));

    for (let y = 0; y < 60; y++) {
      for (let x = 0; x < 126; x++) {
        if (map.collisions[y] && map.collisions[y][x]) {
          this.grid[y][x] = 0;
        }
      }
    }
  }

  // 다음 행동 스케줄링
  async scheduleNextBehavior() {
    const interval = this.ownerId ? this.followingInterval : this.normalInterval;
    await new Promise((resolve) => setTimeout(resolve, interval));
    if (this.isActive) {
      await this.behave();
      await this.scheduleNextBehavior();
    }
  }

  // 주요 행동 로직
  async behave() {
    // console.log("Avatar pet is behaving...");
    const myPlayer = game.getMyPlayer();
    if (!myPlayer) return;

    if (Math.random() < (this.ownerId ? 0.00015 : 0.015)) {
      this.reactToEmotionalState();
    }

    if (this.ownerId) {
      const owner = game.players[this.ownerId];
      if (owner) {
        // console.log("Owner found!");
        await this.followPlayer();
      } else {
        this.ownerId = null;
        this.showEmoji(this.sadEmoji);
      }
    } else {
      const nearbyPlayer = this.findNearbyPlayerToFollow();
      if (nearbyPlayer) {
        this.setNewOwner(nearbyPlayer.id);
        await this.followPlayer();
      } else {
        await this.moveFreely();
      }
    }
  }
}
