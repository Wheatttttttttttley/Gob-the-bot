import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { promisify } from "util";
import { addBalance, addBalanceXP } from "../../../helpers/accountManager";

const sleep = promisify(setTimeout);

const data = new SlashCommandBuilder()
  .setName("dice")
  .setDescription("Roll a dice!")
  .addNumberOption((option) =>
    option
      .setName("bet")
      .setRequired(true)
      .setDescription("The amount of money you want to bet."),
  )
  .addNumberOption((option) =>
    option
      .setName("sides")
      .setRequired(true)
      .setDescription("The number of sides the dice has.")
      .addChoices([
        ["1", 1],
        ["2", 2],
        ["3", 3],
        ["4", 4],
        ["5", 5],
        ["6", 6],
      ]),
  );

async function run(interaction: CommandInteraction) {
  const bet = interaction.options.getNumber("bet") || 0;
  const sides = interaction.options.getNumber("sides") || 0;

  const embed = new MessageEmbed()
    .setTitle("🎲 Dice Rolling 🎲")
    .setDescription(`You bet **${bet}** on **${sides}**`)
    .setColor(0xe91e63);
  await interaction.reply({ embeds: [embed] });
  addBalance(interaction.user.id, -bet);

  await sleep(1500);

  const rndSide = Math.floor(Math.random() * 6) + 1;
  const result = rndSide === sides ? "win" : "lose";

  embed
    .setTitle(`🎲 ${result.toUpperCase()}! 🎲`)
    .setDescription(
      `Dice rolled: ${["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣"][rndSide - 1]}`,
    );
  if (result === "win") {
    embed
      .addField("✅ You won! ✅", `You won **${bet}** 💵`)
      .setColor(0x2ecc71);
    addBalanceXP(interaction.user.id, 6 * bet, 5 * bet);
  } else if (result === "lose") {
    embed
      .addField("❌ You lost! ❌", `You lost **${bet}** 💵`)
      .setColor(0xe74c3c);
  }
  await interaction.editReply({ embeds: [embed] });
}

export default {
  data,
  run,
};
