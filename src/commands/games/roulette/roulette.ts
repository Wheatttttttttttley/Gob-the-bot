import { SlashCommandBuilder } from "@discordjs/builders";
import { ColorResolvable, CommandInteraction, MessageEmbed } from "discord.js";
import { addBalance } from "../../../helpers/accountManager";
import { getTrueRandom } from "../../../helpers/randomNumber";
import { warningEmbed } from "../../../helpers/warningHandler";
import { colorRun, colorSubcommand } from "./subcommands/color";
import { columnRun, columnSubcommand } from "./subcommands/column";
import { cornerRun, cornerSubcommand } from "./subcommands/corner";
import { dozenRun, dozenSubcommand } from "./subcommands/dozen";
import { evenOddRun, evenOddSubcommand } from "./subcommands/evenOdd";
import { highLowRun, highLowSubcommand } from "./subcommands/highLow";
import { lineRun, lineSubcommand } from "./subcommands/line";
import { splitRun, splitSubcommand } from "./subcommands/split";
import { straightUpRun, straightUpSubcommand } from "./subcommands/straightUp";
import { streetRun, streetSubcommand } from "./subcommands/street";

const data = new SlashCommandBuilder()
  .setName("roulette")
  .setDescription("Play roulette")
  .addSubcommand(straightUpSubcommand)
  .addSubcommand(splitSubcommand)
  .addSubcommand(streetSubcommand)
  .addSubcommand(cornerSubcommand)
  .addSubcommand(lineSubcommand)
  .addSubcommand(columnSubcommand)
  .addSubcommand(dozenSubcommand)
  .addSubcommand(colorSubcommand)
  .addSubcommand(evenOddSubcommand)
  .addSubcommand(highLowSubcommand);

export const ResultEmbed = (
  result: "win" | "lose",
  rndNumber: number,
  guess: string,
  initialBet: number,
  gain: number,
) => {
  let color = "🟢";
  if ([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(rndNumber)) {
    color = "🔴";
  } else if (rndNumber !== 0) {
    color = "🔵";
  }
  return new MessageEmbed()
    .setTitle("💎 Roulette 💎")
    .setDescription(`You bet **${initialBet}** 💵 on **${guess}**!`)
    .addField("Rolled", `${color}** : ${rndNumber}**`)
    .addField(
      result === "win" ? "🤑 WIN 🤑" : "😭 LOSE 😭",
      result === "win" ? `You won **${gain}** 💵` : `You lost **${initialBet} 💵**`,
    )
    .setColor((result === "win" ? "0x57F287" : "0xE74C3C") as ColorResolvable);
};

const run = async (interaction: CommandInteraction) => {
  await interaction.deferReply();
  const subcommand = interaction.options.getSubcommand() || "";
  const bet = interaction.options.getNumber("bet") || 0;

  addBalance(interaction.user.id, -bet);
  const rndNumber = await getTrueRandom(0, 36);
  switch (subcommand) {
    case "straight-up":
      straightUpRun(interaction, bet, rndNumber);
      break;
    case "split":
      splitRun(interaction, bet, rndNumber);
      break;
    case "street":
      streetRun(interaction, bet, rndNumber);
      break;
    case "corner":
      cornerRun(interaction, bet, rndNumber);
      break;
    case "line":
      lineRun(interaction, bet, rndNumber);
      break;
    case "column":
      columnRun(interaction, bet, rndNumber);
      break;
    case "dozen":
      dozenRun(interaction, bet, rndNumber);
      break;
    case "color":
      colorRun(interaction, bet, rndNumber);
      break;
    case "even-odd":
      evenOddRun(interaction, bet, rndNumber);
      break;
    case "high-low":
      highLowRun(interaction, bet, rndNumber);
      break;
    default:
      interaction.editReply(
        warningEmbed({
          title: "Invalid subcommand",
          description: "Please use a valid subcommand.",
        }),
      );
  }
};

export default {
  data,
  run,
};
