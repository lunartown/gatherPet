export const EmotionsMixin = {
  // 감정 업데이트
  updateEmotion(type, value) {
    this.emotion[type] = Math.max(
      this.MIN_EMOTION,
      Math.min(this.MAX_EMOTION, this.emotion[type] + value)
    );
  },

  // 감정 감소
  decayEmotions() {
    Object.keys(this.emotion).forEach((key) => {
      this.emotion[key] = Math.max(this.MIN_EMOTION, this.emotion[key] - 1);
    });
  },

  // 감정 상태 가져오기
  getEmotionalState() {
    const { happiness, excitement, tiredness } = this.emotion;

    if (happiness > 80) return "very happy";
    if (happiness > 60) return "happy";
    if (happiness < 30) return "sad";

    if (excitement > 80) return "very excited";
    if (excitement > 60) return "excited";
    if (excitement < 30) return "bored";

    if (tiredness > 80) return "exhausted";
    if (tiredness > 60) return "tired";
    if (tiredness < 30) return "energetic";

    return "neutral";
  },

  // 감정 상태에 따른 반응
  reactToEmotionalState() {
    // console.log(
    //   "emotions : happiness : ",
    //   this.emotion.happiness + " excitement : ",
    //   this.emotion.excitement + " tiredness : ",
    //   this.emotion.tiredness
    // );
    const state = this.getEmotionalState();
    switch (state) {
      case "very happy":
        this.showEmoji("😄");
        this.performTrick();
        break;
      case "happy":
        this.showEmoji("🙂");
        break;
      case "sad":
        this.showEmoji("😢");
        break;
      case "very excited":
        this.showEmoji("🤩");
        this.performTrick();
        break;
      case "excited":
        this.showEmoji("😃");
        break;
      case "bored":
        this.showEmoji("😴");
        break;
      case "exhausted":
        this.showEmoji("😫");
        this.safeMove(Math.floor(Math.random() * 4)); // 랜덤한 방향으로 느리게 이동
        break;
      case "tired":
        this.showEmoji("😩");
        break;
      case "energetic":
        this.showEmoji("💪");
        this.performTrick();
        break;
      default:
        this.showEmoji("😐");
    }
  },

  // 음성에 반응
  reactToVoice() {
    console.log("Avatar pet is reacting to voice...");
    const reactions = ["👂", "🎵", "🔊", "😃", "🗣️"];
    const randomReaction =
      reactions[Math.floor(Math.random() * reactions.length)];
    this.showEmoji(randomReaction);
  },
};
