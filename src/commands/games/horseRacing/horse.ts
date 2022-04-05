import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message, MessageEmbed, MessageReaction, User } from "discord.js";
import { addBalance, addBalanceXP } from "../../../helpers/accountManager";
import { clamp } from "../../../helpers/clamp";
import { warningEmbed } from "../../../helpers/warningHandler";
import { HorseGame } from "./classes/Game";

const data = new SlashCommandBuilder()
  .setName("horse")
  .setDescription("Gambling in horse racing")
  .addNumberOption((option) =>
    option.setName("bet").setRequired(true).setDescription("The amount of money you want to bet."),
  )
  .addNumberOption((option) =>
    option
      .setName("horse-amount")
      .setRequired(false)
      .setDescription("The amount of horses in the races.")
      .addChoices([
        ["3", 3],
        //TODO:
        // ["6", 6],
        // ["9", 9],
      ]),
  );

const numberToEmoji: { [key: number]: string } = {
  1: "1️⃣",
  2: "2️⃣",
  3: "3️⃣",
  4: "4️⃣",
  5: "5️⃣",
  6: "6️⃣",
  7: "7️⃣",
  8: "8️⃣",
  9: "9️⃣",
};
const emojiToNumber: { [key: string]: number } = {
  "1️⃣": 1,
  "2️⃣": 2,
  "3️⃣": 3,
  "4️⃣": 4,
  "5️⃣": 5,
  "6️⃣": 6,
  "7️⃣": 7,
  "8️⃣": 8,
  "9️⃣": 9,
};

const run = async (interaction: CommandInteraction) => {
  await interaction.deferReply();

  // get options from the command
  const bet = interaction.options.getNumber("bet") || 0;
  const horseAmount = interaction.options.getNumber("horse-amount") || 3;

  addBalance(interaction.user.id, -bet);

  // create a new game
  const game = new HorseGame(horseAmount);
  await interaction.editReply({
    embeds: [
      new MessageEmbed()
        .setTitle("🏇 Horse Racing! 🏇")
        .setColor(0x0099ff)
        .setDescription("Choose a horse to bet on")
        .addFields(
          ...game.horses.map((horse, i) => ({
            name: `${i + 1} ${horse.emoji}`,
            value: `⚡ : ${horse.speed}\n💰 : ${horse.pay.toFixed(2)}x`,
            inline: true,
          })),
        ),
    ],
  });

  // add reactions to the message
  const message = (await interaction.fetchReply()) as Message;
  for (let i = 0; i < horseAmount; i++) {
    await message.react(numberToEmoji[i + 1]);
  }

  const numberEmojiArray = Object.values(numberToEmoji).slice(0, horseAmount);

  // wait for a reaction
  // the chosen horse will be the number of the emoji
  let horseNumber: number | undefined = undefined;
  const filter = (reaction: MessageReaction, user: User) =>
    numberEmojiArray.includes(reaction.emoji.name as string) && user.id === interaction.user.id;
  await message
    .awaitReactions({ filter, time: 60000, max: 1 })
    .then(async (reactions) => {
      const reaction = reactions.first();
      horseNumber = emojiToNumber[reaction?.emoji.name as string];
    })
    .catch(() => {
      horseNumber = undefined;
    });
  await message.reactions.removeAll();

  // if the user didn't choose a horse in time, end the game
  if (horseNumber === undefined) {
    addBalance(interaction.user.id, bet * 0.5);

    interaction.editReply(
      warningEmbed({
        title: "TIMEOUT ALERT",
        description: "You did not choose a horse in time. You lost half of your bet.",
      }),
    );

    return;
  }

  // show the progress of the game every second
  const showProgressInterval = setInterval(() => {
    interaction.editReply({
      embeds: [game.getProgressEmbed(bet, horseNumber ?? 0)],
    });
  }, 1000);

  // play the game
  const winner = await game.play();

  // clear the progress interval
  clearInterval(showProgressInterval);

  // resulting the game
  const isWon = winner === horseNumber - 1;
  if (isWon) {
    addBalanceXP(interaction.user.id, game.horses[horseNumber - 1].pay * bet, game.horses[horseNumber - 1].pay * bet);
  }

  await interaction.editReply({
    embeds: [
      new MessageEmbed()
        .setTitle(`🏇 ${isWon ? "WON" : "LOST"} ! 🏇`)
        .setColor(isWon ? 0x2ecc71 : 0xe74c3c)
        .setDescription(
          `You bet ${bet} 💵 on number **${numberToEmoji[horseNumber]}** with rate **${
            game.horses[horseNumber - 1].pay
          }x**`,
        )
        .addField(
          "🚩 Field 🚩",
          game.horses
            .map(
              (horse, index) =>
                `${`${numberToEmoji[index + 1]} ${"▰".repeat(clamp((horse.progress / 10) >> 0, 0, 10))}${
                  horse.emoji
                }${"▱".repeat(clamp(10 - ((horse.progress / 10) >> 0), 0, 10))} **${horse.speed}** ⚡`}`,
            )
            .join("\n"),
        )
        .addField(
          `${isWon ? "✅" : "❌"} You ${isWon ? "won" : "lost"}! ${isWon ? "✅" : "❌"}`,
          `You ${isWon ? "won" : "lost"} **${Math.ceil(isWon ? game.horses[horseNumber - 1].pay * bet : bet)}** 💵`,
        ),
    ],
  });
};

export default {
  data,
  run,
};
