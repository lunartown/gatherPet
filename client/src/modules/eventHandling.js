export const EventHandlingMixin = {
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
  },

  // DOM 이벤트 리스너 설정
  startPeriodicCheck() {
    console.log("startPeriodicCheck 메소드 시작");
    this.lastMessageCount = 0;

    const checkInterval = setInterval(() => {
      // console.log("주기적 체크 실행 중...");
      try {
        const bodyContainers = document.getElementsByClassName(
          "sendbird-channel-list__body"
        );
        // console.log("bodyContainers 찾음:", bodyContainers.length);

        if (bodyContainers.length === 0) {
          console.log("bodyContainers를 찾지 못함");
          return;
        }

        const chatContainer = bodyContainers[
          bodyContainers.length - 1
        ]?.querySelector(
          ".css-6unyhe > :nth-child(2) > :nth-child(2) > :first-child :first-child"
        );
        // console.log("chatContainer 찾음:", chatContainer ? "성공" : "실패");

        if (chatContainer) {
          const message = chatContainer.textContent;
          // console.log("현재 메시지:", message);
          // console.log("마지막 처리된 메시지:", this.lastProcessedMessage);

          if (message !== this.lastProcessedMessage) {
            console.log("새 메시지 발견:", message);
            this.lastProcessedMessage = message;
            this.onPlayerChat({ messageText: message });
          } else {
            // console.log("새 메시지 없음");
          }
        } else {
          // console.log("chatContainer를 찾지 못함");
        }
      } catch (error) {
        console.error("주기적 체크 중 오류 발생:", error);
      }
    }, 1000);
  },

  // AI 응답 생성 (큐 사용)
  async generateAIResponse(message) {
    try {
      return await this.addToRequestQueue({
        message,
        emotion: this.emotion,
      });
    } catch (error) {
      console.error("Error generating AI response:", error);
      return "Woof! (AI error)";
    }
  },

  // 컨페티 이벤트 처리
  onConfettiShot(data, context) {
    console.log("Confetti shot event received:", context);
    const shooterId = context.playerId;
    const shooter = game.players[shooterId];
    const myPlayer = game.getMyPlayer();

    if (this.isAdjacentAndFacing(shooter, myPlayer)) {
      this.changeOwner(shooterId);
    }
  },

  // 플레이어 말하기 이벤트 처리
  onPlayerSpeaking(data, context) {
    const speakerId = context.playerId;
    const speaker = game.players[speakerId];
    const myPlayer = game.getMyPlayer();

    if (this.isNearby(speaker, myPlayer)) {
      this.reactToVoice();
    }
  },

  // 채팅 메시지 처리
  async onPlayerChat(data) {
    console.log("onPlayerChat 호출됨, data:", data);
    const chatMessage = data.messageText;
    const response = await this.generateAIResponse(chatMessage);
    this.respondToChat(response);
  },

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
    }, 8000);
  },
};
