import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { addBalanceXP } from "../../../helpers/accountManager";
import { ResultEmbed } from "../roulette";

export const columnSubcommand = new SlashCommandSubcommandBuilder()
  .setName("column")
  .setDescription("Play a column, pay 2x")
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
      .setDescription("The column you want to bet on")
      .addChoices([
        [
          "1 4 7 10 13 16 19 22 25 28 31 34",
          "1 4 7 10 13 16 19 22 25 28 31 34",
        ],
        [
          "2 5 8 11 14 17 20 23 26 29 32 35",
          "2 5 8 11 14 17 20 23 26 29 32 35",
        ],
        [
          "3 6 9 12 15 18 21 24 27 30 33 36",
          "3 6 9 12 15 18 21 24 27 30 33 36",
        ],
      ]),
  );

export const columnRun = (
  interaction: CommandInteraction,
  bet: number,
  rndNumber: number,
) => {
  const guess = interaction.options.getString("guess") || "";
  const result = guess.split(" ").includes(rndNumber.toString());
  if (result) {
    addBalanceXP(interaction.user.id, bet * 3, bet * 2);

    interaction.editReply({
      embeds: [ResultEmbed("win", rndNumber, guess, bet, bet * 2)],
    });
  } else {
    interaction.editReply({
      embeds: [ResultEmbed("lose", rndNumber, guess, bet, -bet)],
    });
  }
};
