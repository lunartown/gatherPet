export const PlayerInteractionMixin = {
  // 근처의 플레이어 찾기
  findNearbyPlayerToFollow() {
    const myPlayer = game.getMyPlayer();
    if (!myPlayer) return null;

    const nearbyPlayers = Object.values(game.players).filter((player) => {
      if (player.id === myPlayer.id) return false;
      const distance = this.getDistance(myPlayer, player);
      return distance <= this.followRange;
    });

    if (nearbyPlayers.length > 0) {
      return nearbyPlayers.reduce(
        (closest, player) => {
          const distance = this.getDistance(myPlayer, player);
          return distance < closest.distance ? { player, distance } : closest;
        },
        { player: null, distance: Infinity }
      ).player;
    }

    return null;
  },

  // 새 주인 설정
  setNewOwner(newOwnerId) {
    this.ownerId = newOwnerId;
    const newOwnerName = game.players[newOwnerId]?.name || "알 수 없음";
    console.log(
      `새로운 주인이 생겼습니다! 이름: ${newOwnerName}, ID: ${newOwnerId}`
    );
    this.updateEmotion("happiness", 20);
    this.updateEmotion("excitement", 15);
    this.updateEmotion("tiredness", -10);
    this.showEmoji(this.heartEmoji);
  },

  // 주인 변경
  changeOwner(newOwnerId) {
    this.ownerId = newOwnerId;
    const newOwnerName = game.players[newOwnerId]?.name || "알 수 없음";
    console.log(
      `주인이 바뀌었습니다! 새 주인의 이름: ${newOwnerName}, ID: ${newOwnerId}`
    );
    this.showEmoji(this.heartEmoji);
  },

  // 인접하고 마주보고 있는지 확인
  isAdjacentAndFacing(player, target) {
    console.log("Checking if player is adjacent and facing target...");
    console.log("Player:", player.direction);
    const dx = player.x - target.x;
    const dy = player.y - target.y;
    const distance = Math.abs(dx) + Math.abs(dy);
    console.log("Distance:", distance, dx, dy);
    console.log("Player direction:", player.direction);

    if (distance !== 1) return false;

    // 방향 확인: 5(왼쪽), 7(오른쪽), 3(위), 1(아래)
    switch (player.direction) {
      case 5:
      case 6:
        return dx === 1 && dy === 0;
      case 7:
      case 8:
        return dx === -1 && dy === 0;
      case 3:
      case 4:
        return dx === 0 && dy === 1;
      case 1:
      case 2:
        return dx === 0 && dy === -1;
      default:
        return false;
    }
  },
};
