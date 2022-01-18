import { ColorResolvable } from "discord.js";
import { getPseudoRandom } from "./randomNumber";

const letters = "0123456789ABCDEF";

// export random color as #hex
export const randomColor = () =>
  `#${Array.from({ length: 6 }, () => letters[getPseudoRandom(0, 15)]).join(
    "",
  )}` as ColorResolvable;
