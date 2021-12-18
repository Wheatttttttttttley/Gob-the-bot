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
    this.emoji = emojiList[Math.floor(Math.random() * emojiList.length)];
    // this.speed = Math.floor(Math.random() * (12 - 5 + 1) + 5);
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
