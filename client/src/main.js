import { MyCustomPet } from "./core/core.js";
import { ApiMixin } from "./modules/api.js";
import { EmojiMixin } from "./modules/emoji.js";
import { EmotionsMixin } from "./modules/emotions.js";
import { EventHandlingMixin } from "./modules/eventHandling.js";
import { MovementMixin } from "./modules/movement.js";
import { PathfindingMixin } from "./modules/pathfinding.js";
import { PlayerInteractionMixin } from "./modules/playerInteraction.js";
import { UtilsMixin } from "./utils/utils.js";

Object.assign(
  MyCustomPet.prototype,
  MovementMixin,
  PathfindingMixin,
  PlayerInteractionMixin,
  EventHandlingMixin,
  EmotionsMixin,
  EmojiMixin,
  ApiMixin,
  UtilsMixin
);

function runCustomPet() {
  const myCustomPet = new MyCustomPet();
  myCustomPet.startBehavior();
  console.log("Custom pet is now running!");
  return myCustomPet;
}

// 자동으로 CustomPet 실행
const pet = runCustomPet();

// 전역 스코프에 pet 객체 노출 (필요한 경우)
window.pet = pet;
