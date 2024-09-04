export const UtilsMixin = {
  // 거리 계산
  getDistance(player1, player2) {
    return Math.sqrt(
      Math.pow(player1.x - player2.x, 2) + Math.pow(player1.y - player2.y, 2)
    );
  },

  // 포인트를 문자열로 변환
  pointToString(point) {
    return `${point.x},${point.y}`;
  },

  // 근처에 있는지 확인
  isNearby(player1, player2, range = 5) {
    return this.getDistance(player1, player2) <= range;
  },

  // 트릭 수행
  performTrick() {
    // 트릭 수행 로직 (필요한 경우 구현)
  },
};
