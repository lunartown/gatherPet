export const MovementMixin = {
  // 경로를 따라 이동
  async moveAlongPathSmooth(path) {
    for (const step of path) {
      const myPlayer = game.getMyPlayer();
      if (!myPlayer) return;

      const dx = step.x - myPlayer.x;
      const dy = step.y - myPlayer.y;
      const direction = this.getDirection(dx, dy);
      this.safeMove(direction);

      await new Promise((resolve) => setTimeout(resolve, this.moveDelay));
    }
  },

  // 방향 결정
  getDirection(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 1 : 0; // 오른쪽 : 왼쪽
    } else {
      return dy > 0 ? 3 : 2; // 아래 : 위
    }
  },

  // 안전한 이동
  safeMove(direction) {
    // console.log("Moving in direction:", direction);
    try {
      game.move(direction);
    } catch (error) {
      console.log("Error in move:", error);
    }
  },

  // 자유롭게 이동
  async moveFreely() {
    // console.log("Moving freely...");
    const myPlayer = game.getMyPlayer();
    if (!myPlayer) return;

    const maxDistance = 3;
    const targetX = myPlayer.x + Math.floor(Math.random() * (maxDistance * 2 + 1)) - maxDistance;
    const targetY = myPlayer.y + Math.floor(Math.random() * (maxDistance * 2 + 1)) - maxDistance;

    const path = this.findPath({ x: myPlayer.x, y: myPlayer.y }, { x: targetX, y: targetY });

    if (path.length > 1) {
      const moveCount = Math.min(path.length - 1, maxDistance);
      await this.moveAlongPathSmooth(path.slice(1, moveCount + 1));
    }

    if (Math.random() < 0.02) {
      this.performTrick();
    }

    this.updateEmotion("happiness", -2);
    this.updateEmotion("excitement", -1);
    this.updateEmotion("tiredness", 1);
  },

  isFacing(player, target) {
    const dx = player.x - target.x;
    const dy = player.y - target.y;

    // 방향 확인: 5(왼쪽), 7(오른쪽), 3(위), 1(아래)
    switch (player.direction) {
      case 5:
        return dx > 0;
      case 7:
        return dx < 0;
      case 3:
        return dy > 0;
      case 1:
        return dy < 0;
      case 4:
        return true;
      default:
        return false;
    }
  },

  // 플레이어 따라가기
  async followPlayer() {
    // console.log("Following player with ID:", this.ownerId);
    const myPlayer = game.getMyPlayer();
    const target = game.players[this.ownerId];
    if (!myPlayer || !target) {
      this.ownerId = null;
      this.showEmoji(this.sadEmoji);
      return;
    }

    const distance = this.getDistance(myPlayer, target);

    // console.log("Distance to target player:", distance);
    if (distance > this.loseInterestRange) {
      console.log("Target player is too far, losing interest");
      this.ownerId = null;
      this.showEmoji(this.sadEmoji);
      return;
    }

    if (distance > this.flashDistance) {
      this.emojiQueue = [];
      this.showEmoji("💢");
      const mapId = gameSpace.mapId;
      const x = myPlayer.x;
      const y = myPlayer.y;
      await this.delay(300);
      await this.changeColor("yellow");
      await this.delay(300);
      game.teleport(mapId, 1, 57);
      await this.delay(300);

      game.teleport(mapId, target.x + (x - target.x) * 0.1, target.y + (y - target.y) * 0.1);
      await this.changeColor("beige");
      await this.delay(300);
      return;
    }

    if (distance > this.idealDistance) {
      const path = this.findPath({ x: myPlayer.x, y: myPlayer.y }, { x: target.x, y: target.y });

      if (path.length > 1) {
        const moveCount = Math.min(path.length - 1, this.maxMoveDistance);
        await this.moveAlongPathSmooth(path.slice(1, moveCount + 1));
      }

      this.updateEmotion("happiness", 5);
      this.updateEmotion("excitement", 3);
      this.updateEmotion("tiredness", 2);
    } else {
      if (!this.isFacing(myPlayer, target)) {
        const dx = target.x - myPlayer.x;
        const dy = target.y - myPlayer.y;
        const direction = this.getDirection(dx, dy);
        game.move(direction, true);
      }

      if (Math.random() < 0.0006) {
        await this.performTrick();
      }
    }
  },
};
