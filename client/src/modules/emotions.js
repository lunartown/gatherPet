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
    console.log(
      "emotions : happiness : ",
      this.emotion.happiness + " excitement : ",
      this.emotion.excitement + " tiredness : ",
      this.emotion.tiredness
    );
    const state = this.getEmotionalState();
    const emojiLists = {
      "very happy": ["😄", "🎉", "🎈", "🎊", "💖"],
      happy: ["🙂", "☀️", "🌻", "🌈", "✨"],
      sad: ["😢", "☁️", "🌧️", "🍂", "🕯️"],
      "very excited": ["🤩", "🎆", "🚀", "⚡", "🔥"],
      excited: ["😃", "🌟", "🎵", "🏃‍♂️", "💫"],
      bored: ["😴", "🕰️", "📚", "🧩", "🎭"],
      exhausted: ["😫", "🏳️", "🛌", "☕", "🧘‍♂️"],
      tired: ["😩", "🌙", "🛋️", "🧸", "🍵"],
      energetic: ["💪", "🏋️‍♂️", "🚴‍♀️", "🏆", "🥇"],
      default: ["😐", "❓", "🤔", "🧐", "📊"],
    };

    const chooseRandomEmoji = (list) =>
      list[Math.floor(Math.random() * list.length)];

    switch (state) {
      case "very happy":
        this.showEmoji(chooseRandomEmoji(emojiLists["very happy"]));
        break;
      case "happy":
        this.showEmoji(chooseRandomEmoji(emojiLists["happy"]));
        break;
      case "sad":
        this.showEmoji(chooseRandomEmoji(emojiLists["sad"]));
        break;
      case "very excited":
        this.showEmoji(chooseRandomEmoji(emojiLists["very excited"]));
        break;
      case "excited":
        this.showEmoji(chooseRandomEmoji(emojiLists["excited"]));
        break;
      case "bored":
        this.showEmoji(chooseRandomEmoji(emojiLists["bored"]));
        break;
      case "exhausted":
        this.showEmoji(chooseRandomEmoji(emojiLists["exhausted"]));
        this.safeMove(Math.floor(Math.random() * 4));
        break;
      case "tired":
        this.showEmoji(chooseRandomEmoji(emojiLists["tired"]));
        break;
      case "energetic":
        this.showEmoji(chooseRandomEmoji(emojiLists["energetic"]));
        break;
      default:
        this.showEmoji(chooseRandomEmoji(emojiLists["default"]));
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
