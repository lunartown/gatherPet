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
    game.subscribeToEvent(
      "playerSetsEmoteV2",
      this.onPlayerSetsEmote.bind(this)
    );
  },

  // DOM 이벤트 리스너 설정
  async startPeriodicCheck() {
    console.log("startPeriodicCheck 메소드 시작");
    this.lastMessageCount = 0;

    while (true) {
      try {
        const bodyContainers = await this.navigateToBodyContainer();
        // console.log(bodyContainers);
        if (!bodyContainers) {
          console.log("bodyContainer를 찾지 못함");
          await new Promise((resolve) => setTimeout(resolve, 2000)); // 5초 대기
          continue;
        }
        if (bodyContainers.length > 1) {
          const headContainer = bodyContainers[0];
          const groupChatContainer = headContainer.querySelector(
            ".css-6unyhe > :nth-child(2) > :nth-child(2) > :first-child :first-child"
          );

          if (groupChatContainer && groupChatContainer.textContent) {
            const data = groupChatContainer.textContent;
            const name = data.split(":")[0];
            if (data.split(":")[1] != undefined) {
              const message = data.split(":")[1].trim();

              if (
                message !== this.lastProcessedGroupMessage ||
                name !== this.lastProcessedGroupMessageFrom
              ) {
                console.log("새 메시지 발견:", message);
                this.lastProcessedGroupMessageFrom = name;
                this.lastProcessedGroupMessage = message;
                this.onPlayerChat({ messageText: message });
              }
            }
          } else {
            // console.log("chatContainer를 찾지 못함");
          }
        }

        const bodyContainer = bodyContainers[bodyContainers.length - 1];
        const nameContainer = bodyContainer.querySelector(
          ".css-6unyhe > :nth-child(2) > :first-child > :first-child :first-child"
        );
        const chatContainer = bodyContainer.querySelector(
          ".css-6unyhe > :nth-child(2) > :nth-child(2) > :first-child :first-child"
        );

        if (chatContainer && chatContainer.textContent) {
          const name = nameContainer.textContent;
          const message = chatContainer.textContent;
          // console.log("메시지 읽는 중", message);

          if (
            message !== this.lastProcessedMessage ||
            name !== this.lastProcessedMessageFrom
          ) {
            console.log("새 메시지 발견:", message);
            this.lastProcessedMessageFrom = name;
            this.lastProcessedMessage = message;
            this.onPlayerChat({ messageText: message });
          }
        } else {
          console.log("chatContainer를 찾지 못함");
        }
      } catch (error) {
        console.error("주기적 체크 중 오류 발생:", error);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 대기
    }
  },

  // 바디 컨테이너 탐색
  async navigateToBodyContainer() {
    function findBodyContainer() {
      return document.getElementsByClassName("sendbird-channel-list__body");
    }

    function clickBackButton() {
      const backButton = document.querySelector(
        'button[shape="icon"] svg path[d="M15 18l-6-6 6-6"]'
      );
      if (backButton) {
        const buttonElement = backButton.closest("button");
        if (buttonElement) {
          buttonElement.click();
          console.log("Back button clicked");
          return true;
        }
      }
      return false;
    }

    function clickChatButton() {
      const chatButton = document.querySelector('button[aria-label="Chat"]');
      if (chatButton) {
        chatButton.click();
        console.log("Chat button clicked");
        return true;
      }
      return false;
    }

    const maxAttempts = 5;
    const waitTime = 2000; // 2초

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      let bodyContainer = findBodyContainer();
      if (bodyContainer && bodyContainer.length > 0) {
        // console.log(`bodyContainer found on attempt ${attempt + 1}`);
        return bodyContainer;
      }

      console.log(
        `Attempt ${
          attempt + 1
        }: bodyContainer not found, attempting navigation...`
      );

      if (clickBackButton()) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        bodyContainer = findBodyContainer();
        if (bodyContainer && bodyContainer.length > 0) {
          console.log(
            `bodyContainer found after clicking back button on attempt ${
              attempt + 1
            }`
          );
          return bodyContainer;
        }
      } else {
        console.log("Back button not found, trying chat button");
        if (clickChatButton()) {
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          bodyContainer = findBodyContainer();
          if (bodyContainer && bodyContainer.length > 0) {
            console.log(
              `bodyContainer found after clicking chat button on attempt ${
                attempt + 1
              }`
            );
            return bodyContainer;
          }
        } else {
          console.log("Neither back button nor chat button found");
        }
      }

      if (attempt < maxAttempts - 1) {
        console.log(`Waiting before next attempt...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    // console.log(`bodyContainer not found after ${maxAttempts} attempts`);
    return null;
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
    // const currentName = game.getMyPlayer().name;
    // console.log("현재 이름:", currentName);
    game.setName(response);
    console.log("이름을 응답으로 변경함");

    setTimeout(() => {
      game.setName(this.name);
      console.log("8초 후 원래 이름으로 복구");
    }, 8000);
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

  // 이모티콘 설정 이벤트 처리
  onPlayerSetsEmote(data, context) {
    console.log("Player sets emote event received:", context);
    const emote = data.playerSetsEmoteV2.emote;
    const playerId = context.playerId;
    const player = game.players[playerId];
    const myPlayer = game.getMyPlayer();

    if (emote === "👋") {
      if (this.isAdjacentAndFacing(player, myPlayer)) {
        if (!this.isFacing(myPlayer, player)) {
          const dx = player.x - myPlayer.x;
          const dy = player.y - myPlayer.y;
          const direction = this.getDirection(dx, dy);
          game.move(direction, true);
        }
        this.emojiQueue = [];
        this.showEmoji("👋");
      }
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
};
