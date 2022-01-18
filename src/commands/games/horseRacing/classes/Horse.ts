import { getPseudoRandom } from "../../../../helpers/randomNumber";

// 🐒🦮🐕‍🦺🐩🐕🐈🐅🐆🐎🦌🦏🦛🐂🐃🐄🐖🐏🐑🐐🐪🐫🦙🦘🦥🦨🦡🐘🐁🐀🦔🐇🐿🦎🐊🐢🐍🐉🦕🦖🦦🦈🐬🐳🐋🐟🐠🐡🦆🐓🦃🦅🕊🦢🦜🦩🦚🦉🐦🐧🐤🦇🦋🐌🐛🦟🦗🐜🐝
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
  "🐃",
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
  "🐜",
  "🐝",
];

export class Horse {
  emoji: string;
  speed: number;
  progress: number;
  winning: boolean;
  pay = 0;
  constructor() {
    this.emoji = emojiList[getPseudoRandom(0, emojiList.length)];
    // this.speed = getPseudoRandom(5, 12);
    this.speed = 5;
    this.progress = 0;
    this.winning = false;
  }

  async run() {
    this.progress += this.speed;
    if (this.progress >= 100) {
      this.winning = true;
    }
  }
}
