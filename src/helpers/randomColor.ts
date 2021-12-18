import { ColorResolvable } from "discord.js";

const letters = "0123456789ABCDEF";

// export random color as #hex
export const randomColor = () =>
  `#${Array.from(
    { length: 6 },
    () => letters[Math.floor(Math.random() * 16)],
  ).join("")}` as ColorResolvable;
