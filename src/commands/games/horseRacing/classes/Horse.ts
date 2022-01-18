import { getPseudoRandom } from "../../../../helpers/randomNumber";

// 🐒🦮🐕‍🦺🐩🐕🐈🐅🐆🐎🦌🦏🦛🐂🐄🐖🐏🐑🐐🐪🐫🦙🦘🦥🦨🦡🐘🐁🐀🦔🐇🐿🦎🐊🐢🐍🐉🦕🦖🦦🦈🐬🐳🐋🐟🐠🐡🦆🐓🦃🦅🕊🦢🦜🦩🦚🦉🐦🐧🐤🦇🦋🐌🐛🦟🦗🐝
const emojiList = [
  "🐒",
  "🦮",
  "🐕‍🦺",
  "🐩",
  "🐕",
  "🐈",
  "🐅",
  "🐆",
  "🐎",
  "🦌",
  "🦏",
  "🦛",
  "🐂",
  "🐄",
  "🐖",
  "🐏",
  "🐑",
  "🐐",
  "🐪",
  "🐫",
  "🦙",
  "🦘",
  "🦥",
  "🦨",
  "🦡",
  "🐘",
  "🐁",
  "🐀",
  "🦔",
  "🐇",
  "🐿",
  "🦎",
  "🐊",
  "🐢",
  "🐍",
  "🐉",
  "🦕",
  "🦖",
  "🦦",
  "🦈",
  "🐬",
  "🐳",
  "🐋",
  "🐟",
  "🐠",
  "🐡",
  "🦆",
  "🐓",
  "🦃",
  "🦅",
  "🕊",
  "🦢",
  "🦜",
  "🦩",
  "🦚",
  "🦉",
  "🐦",
  "🐧",
  "🐤",
  "🦇",
  "🦋",
  "🐌",
  "🐛",
  "🦟",
  "🦗",
  "🐝",
];

export class Horse {
  emoji: string = emojiList[getPseudoRandom(0, emojiList.length)];
  speed: number = getPseudoRandom(13, 24);
  progress: number = 0;
  pay: number = 0;

  run() {
    this.progress += this.speed;
  }
}
