import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { promisify } from "util";
import { addBalance, addBalanceXP } from "../../../helpers/accountManager";
import { BlackJackGame } from "./classes/Game";

const sleep = promisify(setTimeout);

const data = new SlashCommandBuilder()
  .setName("blackjack")
  .setDescription("Start a game of blackjack!")
  .addNumberOption((option) =>
    option.setName("bet").setRequired(true).setDescription("The amount of money you want to bet."),
  );

const run = async (interaction: CommandInteraction): Promise<void> => {
  const playerBet = interaction.options.getNumber("bet") || 0;

  addBalance(interaction.user.id, -playerBet);

  // Create game
  const game = new BlackJackGame(interaction, playerBet);

  type resultType = "Win" | "Blackjack" | "Draw" | "Lose" | "Timeout" | "Surrender";
  const result = (await game.gameRunner()) as resultType;

  const resultEmbed = game.cardAndPointsEmbed();

  await sleep(1000);
  // Result of game
  switch (result) {
    case "Win":
      addBalanceXP(interaction.user.id, game.bet * 2, game.bet);

      resultEmbed.addField("🎉 WIN 🎉", `You won **${game.bet.toLocaleString()}** 💵`).setColor(0x57f287);
      break;
    case "Blackjack":
      addBalanceXP(interaction.user.id, game.bet * 2.5, game.bet * 1.5);

      resultEmbed
        .addField("🎉 BLACKJACK 🎉", `You got blackjack! You won **${Math.ceil(game.bet * 1.5).toLocaleString()}** 💵`)
        .setColor(0x57f287);
      break;
    case "Draw":
      addBalanceXP(interaction.user.id, game.bet, game.bet * 0.5);

      resultEmbed.addField("😐 DRAW 😐", "You got your bet back!").setColor(0x99aab5);
      break;
    case "Lose":
      resultEmbed.addField("😭 LOSE 😭", `You lost **${game.bet.toLocaleString()}** 💵`).setColor(0xe74c3c);
      break;
    case "Timeout":
      resultEmbed
        .addField("😭 TIMEOUT 😭", `You didn't react in time! You lost **${game.bet.toLocaleString()}** 💵`)
        .setColor(0xe74c3c);
      break;
    case "Surrender":
      addBalance(interaction.user.id, game.bet * 0.5);
      resultEmbed
        .addField("🏳 SURRENDER 🏳", `You surrendered! You lost **${Math.floor(game.bet * 0.5).toLocaleString()}** 💵`)
        .setColor(0xe74c3c);
      break;
  }

  await game.sendEmbed(resultEmbed);
};

export default {
  data,
  run,
};
