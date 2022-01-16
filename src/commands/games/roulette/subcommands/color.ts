import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { addBalanceXP } from "../../../../helpers/accountManager";
import { ResultEmbed } from "../roulette";

export const colorSubcommand = new SlashCommandSubcommandBuilder()
  .setName("color")
  .setDescription("Play a color, pay 1x")
  .addNumberOption((options) =>
    options
      .setName("bet")
      .setRequired(true)
      .setDescription("The amount of chips you want to bet"),
  )
  .addStringOption((options) =>
    options
      .setName("guess")
      .setRequired(true)
      .setDescription("The color you want to bet on")
      .addChoices([
        ["red", "red"],
        ["black", "black"],
      ]),
  );

export const colorRun = (
  interaction: CommandInteraction,
  bet: number,
  rndNumber: number,
) => {
  const guess = interaction.options.getString("guess") || "";
  const rndColor = [
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
  ].includes(rndNumber)
    ? "red"
    : "black";
  const result = guess === rndColor;
  if (result) {
    addBalanceXP(interaction.user.id, bet * 2, bet);

    interaction.editReply({
      embeds: [ResultEmbed("win", rndNumber, guess, bet, bet)],
    });
  } else {
    interaction.editReply({
      embeds: [ResultEmbed("lose", rndNumber, guess, bet, bet)],
    });
  }
};
