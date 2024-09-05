export const TricksMixin = {
  // 트릭 수행
  async performTrick() {
    const tricks = [
      this.teleportTrick,
      this.dance,
      this.spin,
      this.shootConfetti,
      this.flip,
    ];

    this.emojiQueue = [];

    const randomTrick = tricks[Math.floor(Math.random() * tricks.length)];

    try {
      this.isPerformingTrick = true;
      await randomTrick.call(this);
    } finally {
      this.isPerformingTrick = false;
    }
  },

  async teleportTrick() {
    this.showEmoji("🌟");
    const myPlayer = game.getMyPlayer();
    const mapId = gameSpace.mapId;
    const x = myPlayer.x;
    const y = myPlayer.y;

    game.move(4);
    await this.delay(500);
    await this.changeColor("yellow");
    await this.delay(1000);
    game.teleport(mapId, 1, 57);
    await this.delay(1000);
    game.teleport(mapId, x, y);
    await this.delay(1000);
    this.changeColor("beige");
  },

  async changeColor(color) {
    const costume = this.costume[color];
    game.setCurrentlyEquippedWearables(costume);
  },

  // 춤추기
  async dance() {
    this.showEmoji("🎵");
    console.log("Dancing!");
    game.move(4);

    await new Promise((resolve) => {
      setTimeout(() => {
        game.move(3, true);
        resolve();
      }, 4000);
    });

    console.log("Dance completed!");
  },

  // 회전
  async spin() {
    this.showEmoji("🌀");
    console.log("Spinning!");
    const direction = [3, 1, 2, 0];
    let count = 0;
    let interval = 300; // 시작 간격을 0.5초로 설정

    return new Promise((resolve) => {
      const spinAction = () => {
        game.move(direction[count % 4], true);
        count++;

        if (count <= 50) {
          // 회전 속도를 점진적으로 증가 (간격을 줄임)
          interval = interval <= 50 ? 50 : interval * 0.9; // 매 회전마다 간격을 90%로 줄임
          setTimeout(spinAction, interval);
        } else {
          console.log("Spinning completed!");
          resolve(); // 스핀이 완료되면 Promise를 resolve
        }
      };

      // 첫 번째 회전 시작
      setTimeout(spinAction, interval);
    });
  },

  // 꽃가루 발사
  async shootConfetti() {
    console.log("Shooting confetti!");
    this.showEmoji("🌸");
    const direction = [3, 1, 2, 0];
    let count = 0;

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        game.move(direction[count % 4], true);
        game.shootConfetti();
        count++;

        if (count > 4) {
          clearInterval(interval);
          console.log("Confetti shooting completed!");
          resolve(); // 꽃가루 발사가 완료되면 Promise를 resolve
        }
      }, 800);
    });
  },

  async flip() {
    console.log("Flipping!");
    // 실제 공중제비 구현
  },
};
