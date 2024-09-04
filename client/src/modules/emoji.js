export const EmojiMixin = {
  // 이모지 표시
  showEmoji(emoji) {
    this.queueEmoji(emoji);
  },

  // 이모지 큐에 추가
  queueEmoji(emoji) {
    this.emojiQueue.push(emoji);
    if (!this.isShowingEmoji) {
      this.showNextEmoji();
    }
  },

  // 다음 이모지 표시
  showNextEmoji() {
    if (this.emojiQueue.length === 0) {
      this.isShowingEmoji = false;
      game.setEmote(""); // 이모티콘 제거
      return;
    }

    this.isShowingEmoji = true;
    const emoji = this.emojiQueue.shift();
    game.setEmote(emoji);
    console.log(`Avatar pet showed ${emoji} emoji`);

    setTimeout(() => {
      this.showNextEmoji();
    }, this.emojiDuration);
  },
};
