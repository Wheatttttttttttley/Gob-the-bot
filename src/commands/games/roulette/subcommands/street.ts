import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { addBalanceXP } from "../../../../helpers/accountManager";
import { ResultEmbed } from "../roulette";

export const streetSubcommand = new SlashCommandSubcommandBuilder()
  .setName("street")
  .setDescription("Play a street, pay 11x")
  .addNumberOption((options) =>
    options.setName("bet").setRequired(true).setDescription("The amount of chips you want to bet"),
  )
  .addStringOption((options) =>
    options
      .setName("guess")
      .setRequired(true)
      .setDescription("The numbers you want to bet on")
      .addChoices([
        ["1 2 3", "1 2 3"],
        ["4 5 6", "4 5 6"],
        ["7 8 9", "7 8 9"],
        ["10 11 12", "10 11 12"],
        ["13 14 15", "13 14 15"],
        ["16 17 18", "16 17 18"],
        ["19 20 21", "19 20 21"],
        ["22 23 24", "22 23 24"],
        ["25 26 27", "25 26 27"],
        ["28 29 30", "28 29 30"],
        ["31 32 33", "31 32 33"],
        ["34 35 36", "34 35 36"],
        ["0 1 2", "0 1 2"],
        ["0 2 3", "0 2 3"],
      ]),
  );

export const streetRun = (interaction: CommandInteraction, bet: number, rndNumber: number) => {
  const guess = interaction.options.getString("guess") || "";
  const result = guess.split(" ").includes(rndNumber.toString());
  if (result) {
    addBalanceXP(interaction.user.id, bet * 12, bet * 11);

    interaction.editReply({
      embeds: [ResultEmbed("win", rndNumber, guess, bet, bet * 11)],
    });
  } else {
    interaction.editReply({
      embeds: [ResultEmbed("lose", rndNumber, guess, bet, -bet)],
    });
  }
};
