class MyCustomPet {
  constructor() {
    // 기본 설정
    this.isActive = false;
    this.ownerId = null;
    this.grid = null;
    this.lastProcessedMessage = "";

    // 동작 관련 설정
    this.movementInterval = null;
    this.followRange = 8;
    this.loseInterestRange = 12;
    this.normalInterval = 3000;
    this.followingInterval = 0;
    this.maxMoveDistance = 3;
    this.maxFollowDistance = 3;
    this.idealDistance = 2;
    this.moveDelay = 170;

    // 이모지 및 아이템 설정
    this.sadEmoji = "😢";
    this.heartEmoji = "❤️";
    this.flowerItemId = "flower";

    // 서버 URL 설정 (실제 서버 URL로 변경 필요)
    this.serverUrl = "http://localhost:3000";

    // 이벤트 리스너 설정
    this.setupEventListeners();
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    game.subscribeToEvent(
      "playerShootsConfetti",
      this.onConfettiShot.bind(this)
    );
    game.subscribeToEvent(
      "playerActivelySpeaking",
      this.onPlayerSpeaking.bind(this)
    );
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
    const interval = this.ownerId
      ? this.followingInterval
      : this.normalInterval;
    await new Promise((resolve) => setTimeout(resolve, interval));
    if (this.isActive) {
      await this.behave();
      await this.scheduleNextBehavior();
    }
  }

  // 주요 행동 로직
  async behave() {
    const myPlayer = game.getMyPlayer();
    if (!myPlayer) return;

    if (this.ownerId) {
      const owner = game.players[this.ownerId];
      if (owner) {
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
  }

  // 방향 결정
  getDirection(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 1 : 0; // 오른쪽 : 왼쪽
    } else {
      return dy > 0 ? 3 : 2; // 아래 : 위
    }
  }

  // 안전한 이동
  safeMove(direction) {
    try {
      game.move(direction);
    } catch (error) {
      console.log("Error in move:", error);
    }
  }

  // 자유롭게 이동
  async moveFreely() {
    const myPlayer = game.getMyPlayer();
    if (!myPlayer) return;

    const maxDistance = 3;
    const targetX =
      myPlayer.x +
      Math.floor(Math.random() * (maxDistance * 2 + 1)) -
      maxDistance;
    const targetY =
      myPlayer.y +
      Math.floor(Math.random() * (maxDistance * 2 + 1)) -
      maxDistance;

    const path = this.findPath(
      { x: myPlayer.x, y: myPlayer.y },
      { x: targetX, y: targetY }
    );

    if (path.length > 1) {
      const moveCount = Math.min(path.length - 1, maxDistance);
      await this.moveAlongPathSmooth(path.slice(1, moveCount + 1));
    }

    if (Math.random() < 0.02) {
      this.performTrick();
    }
  }

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
  }

  // 새 주인 설정
  setNewOwner(newOwnerId) {
    this.ownerId = newOwnerId;
    const newOwnerName = game.players[newOwnerId]?.name || "알 수 없음";
    console.log(
      `새로운 주인이 생겼습니다! 이름: ${newOwnerName}, ID: ${newOwnerId}`
    );
    this.showEmoji(this.heartEmoji);
  }

  // 플레이어 따라가기
  async followPlayer() {
    const myPlayer = game.getMyPlayer();
    const target = game.players[this.ownerId];
    if (!myPlayer || !target) {
      this.ownerId = null;
      this.showEmoji(this.sadEmoji);
      return;
    }

    const distance = this.getDistance(myPlayer, target);

    if (distance > this.loseInterestRange) {
      console.log("Target player is too far, losing interest");
      this.ownerId = null;
      this.showEmoji(this.sadEmoji);
      return;
    }

    if (distance > this.idealDistance) {
      const path = this.findPath(
        { x: myPlayer.x, y: myPlayer.y },
        { x: target.x, y: target.y }
      );

      if (path.length > 1) {
        const moveCount = Math.min(path.length - 1, this.maxMoveDistance);
        await this.moveAlongPathSmooth(path.slice(1, moveCount + 1));
      }
    } else {
      if (Math.random() < 0.02) {
        this.performTrick();
      }
    }
  }

  // A* 알고리즘을 사용한 경로 찾기
  findPath(start, goal) {
    const openSet = new PriorityQueue();
    const closedSet = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    openSet.enqueue(start, 0);
    gScore.set(this.pointToString(start), 0);
    fScore.set(this.pointToString(start), this.heuristic(start, goal));

    while (!openSet.isEmpty()) {
      const current = openSet.dequeue();

      if (current.x === goal.x && current.y === goal.y) {
        return this.reconstructPath(cameFrom, current);
      }

      closedSet.add(this.pointToString(current));

      for (const neighbor of this.getNeighbors(current)) {
        if (closedSet.has(this.pointToString(neighbor))) continue;

        const tentativeGScore = gScore.get(this.pointToString(current)) + 1;

        if (
          !openSet.includes(neighbor) ||
          tentativeGScore < gScore.get(this.pointToString(neighbor))
        ) {
          cameFrom.set(this.pointToString(neighbor), current);
          gScore.set(this.pointToString(neighbor), tentativeGScore);
          fScore.set(
            this.pointToString(neighbor),
            gScore.get(this.pointToString(neighbor)) +
              this.heuristic(neighbor, goal)
          );
          if (!openSet.includes(neighbor)) {
            openSet.enqueue(neighbor, fScore.get(this.pointToString(neighbor)));
          }
        }
      }
    }

    return [];
  }

  // 이웃 노드 가져오기
  getNeighbors(point) {
    const neighbors = [];
    const directions = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ];
    for (const dir of directions) {
      const newX = point.x + dir.x;
      const newY = point.y + dir.y;
      if (
        newX >= 0 &&
        newX < 126 &&
        newY >= 0 &&
        newY < 60 &&
        this.grid[newY][newX] === 1
      ) {
        neighbors.push({ x: newX, y: newY });
      }
    }
    return neighbors;
  }

  // 휴리스틱 함수
  heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  // 포인트를 문자열로 변환
  pointToString(point) {
    return `${point.x},${point.y}`;
  }

  // 경로 재구성
  reconstructPath(cameFrom, current) {
    const path = [current];
    while (cameFrom.has(this.pointToString(current))) {
      current = cameFrom.get(this.pointToString(current));
      path.unshift(current);
    }
    return path;
  }

  // 거리 계산
  getDistance(player1, player2) {
    return Math.sqrt(
      Math.pow(player1.x - player2.x, 2) + Math.pow(player1.y - player2.y, 2)
    );
  }

  // 트릭 수행
  performTrick() {
    // 트릭 수행 로직 (필요한 경우 구현)
  }

  // 컨페티 이벤트 처리
  onConfettiShot(data, context) {
    console.log("Confetti shot event received:", context);
    const shooterId = context.playerId;
    const shooter = game.players[shooterId];
    const myPlayer = game.getMyPlayer();

    if (this.isAdjacentAndFacing(shooter, myPlayer)) {
      this.changeOwner(shooterId);
    }
  }

  // 인접하고 마주보고 있는지 확인
  isAdjacentAndFacing(player, target) {
    console.log("Checking if player is adjacent and facing target...");
    console.log("Player:", player.direction);
    const dx = player.x - target.x;
    const dy = player.y - target.y;
    const distance = Math.abs(dx) + Math.abs(dy);
    console.log("Distance:", distance, dx, dy);

    if (distance !== 1) return false;

    // 방향 확인: 5(왼쪽), 7(오른쪽), 3(위), 1(아래)
    switch (player.direction) {
      case 5:
        return dx === 1 && dy === 0;
      case 7:
        return dx === -1 && dy === 0;
      case 3:
        return dx === 0 && dy === 1;
      case 1:
        return dx === 0 && dy === -1;
      default:
        return false;
    }
  }

  // 주인 변경
  changeOwner(newOwnerId) {
    this.ownerId = newOwnerId;
    const newOwnerName = game.players[newOwnerId]?.name || "알 수 없음";
    console.log(
      `주인이 바뀌었습니다! 새 주인의 이름: ${newOwnerName}, ID: ${newOwnerId}`
    );
    this.showEmoji(this.heartEmoji);
  }

  // 이모지 표시
  showEmoji(emoji, duration = 3000) {
    try {
      game.setEmote(emoji);
      console.log(`Avatar pet showed ${emoji} emoji`);

      setTimeout(() => {
        game.setEmote(""); // 빈 문자열을 사용하여 이모지 제거
        console.log("Emoji removed");
      }, duration);
    } catch (error) {
      console.log("Error in showEmoji:", error);
    }
  }

  startPeriodicCheck() {
    console.log("startPeriodicCheck 메소드 시작");
    this.lastMessageCount = 0;

    const checkInterval = setInterval(() => {
      console.log("주기적 체크 실행 중...");
      try {
        const bodyContainers = document.getElementsByClassName(
          "sendbird-channel-list__body"
        );
        console.log("bodyContainers 찾음:", bodyContainers.length);

        if (bodyContainers.length === 0) {
          console.log("bodyContainers를 찾지 못함");
          return;
        }

        const chatContainer = bodyContainers[
          bodyContainers.length - 1
        ]?.querySelector(
          ".css-6unyhe > :nth-child(2) > :nth-child(2) > :first-child :first-child"
        );
        console.log("chatContainer 찾음:", chatContainer ? "성공" : "실패");

        if (chatContainer) {
          const message = chatContainer.textContent;
          console.log("현재 메시지:", message);
          console.log("마지막 처리된 메시지:", this.lastProcessedMessage);

          if (message !== this.lastProcessedMessage) {
            console.log("새 메시지 발견:", message);
            this.lastProcessedMessage = message;
            this.onPlayerChat({ messageText: message });
          } else {
            console.log("새 메시지 없음");
          }
        } else {
          console.log("chatContainer를 찾지 못함");
        }
      } catch (error) {
        console.error("주기적 체크 중 오류 발생:", error);
      }
    }, 1000);

    // 5분 후에 주기적 체크를 중지 (테스트용)
    setTimeout(() => {
      console.log("5분 경과, 주기적 체크 중지");
      clearInterval(checkInterval);
    }, 300000);
  }

  // 채팅 메시지 처리
  async onPlayerChat(data) {
    console.log("onPlayerChat 호출됨, data:", data);
    const chatMessage = data.messageText;
    const response = await this.generateAIResponse(chatMessage);
    this.respondToChat(response);
  }

  // AI 응답 생성 (서버와 통신)
  async generateAIResponse(message) {
    try {
      const response = await fetch(`${this.serverUrl}/generate-response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error generating AI response:", error);
      return "Woof! (AI error)";
    }
  }

  // 채팅에 응답
  respondToChat(response) {
    console.log("respondToChat 호출됨, 응답:", response);
    const currentName = game.getMyPlayer().name;
    console.log("현재 이름:", currentName);
    game.setName(response);
    console.log("이름을 응답으로 변경함");

    setTimeout(() => {
      game.setName(currentName);
      console.log("5초 후 원래 이름으로 복구");
    }, 5000);
  }

  // 플레이어 말하기 이벤트 처리
  onPlayerSpeaking(data, context) {
    const speakerId = context.playerId;
    const speaker = game.players[speakerId];
    const myPlayer = game.getMyPlayer();

    if (this.isNearby(speaker, myPlayer)) {
      this.reactToVoice();
    }
  }

  // 근처에 있는지 확인
  isNearby(player1, player2, range = 5) {
    return this.getDistance(player1, player2) <= range;
  }

  // 음성에 반응
  reactToVoice() {
    console.log("Avatar pet is reacting to voice...");
    const reactions = ["👂", "🎵", "🔊", "😃", "🗣️"];
    const randomReaction =
      reactions[Math.floor(Math.random() * reactions.length)];
    this.showEmoji(randomReaction);
  }
}

// 우선순위 큐 클래스 (A* 알고리즘에 사용)
class PriorityQueue {
  constructor() {
    this.elements = [];
  }

  enqueue(element, priority) {
    this.elements.push({ element, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }

  dequeue() {
    return this.elements.shift().element;
  }

  isEmpty() {
    return this.elements.length === 0;
  }

  includes(element) {
    return this.elements.some(
      (item) => item.element.x === element.x && item.element.y === element.y
    );
  }
}

// MyCustomPet 인스턴스 생성 및 시작
const myCustomPet = new MyCustomPet();
myCustomPet.startBehavior();

// 필요한 경우 행동 정지
// myCustomPet.stopBehavior();
