import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { addBalanceXP } from "../../../../helpers/accountManager";
import { ResultEmbed } from "../roulette";

export const cornerSubcommand = new SlashCommandSubcommandBuilder()
  .setName("corner")
  .setDescription("Play a corner, pay 8x")
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
      .setDescription("The numbers you want to bet on")
      .addChoices([
        ["0 1 2 3", "0 1 2 3"],
        ["1 2 4 5", "1 2 4 5"],
        ["2 3 5 6", "2 3 5 6"],
        ["4 5 7 8", "4 5 7 8"],
        ["5 6 8 9", "5 6 8 9"],
        ["7 8 10 11", "7 8 10 11"],
        ["8 9 11 12", "8 9 11 12"],
        ["10 11 13 14", "10 11 13 14"],
        ["11 12 14 15", "11 12 14 15"],
        ["13 14 16 17", "13 14 16 17"],
        ["14 15 17 18", "14 15 17 18"],
        ["16 17 19 20", "16 17 19 20"],
        ["17 18 20 21", "17 18 20 21"],
        ["19 20 22 23", "19 20 22 23"],
        ["20 21 23 24", "20 21 23 24"],
        ["22 23 25 26", "22 23 25 26"],
        ["23 24 26 27", "23 24 26 27"],
        ["25 26 28 29", "25 26 28 29"],
        ["26 27 29 30", "26 27 29 30"],
        ["28 29 31 32", "28 29 31 32"],
        ["29 30 32 33", "29 30 32 33"],
        ["31 32 34 35", "31 32 34 35"],
        ["32 33 35 36", "32 33 35 36"],
      ]),
  );

export const cornerRun = (
  interaction: CommandInteraction,
  bet: number,
  rndNumber: number,
) => {
  const guess = interaction.options.getString("guess") || "";
  const result = guess.split(" ").includes(rndNumber.toString());
  if (result) {
    addBalanceXP(interaction.user.id, bet * 9, bet * 8);

    interaction.editReply({
      embeds: [ResultEmbed("win", rndNumber, guess, bet, bet * 8)],
    });
  } else {
    interaction.editReply({
      embeds: [ResultEmbed("lose", rndNumber, guess, bet, -bet)],
    });
  }
};
