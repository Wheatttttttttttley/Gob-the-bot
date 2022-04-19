import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { addBalance, getAccount } from "../../helpers/accountManager";
import { getPseudoRandom } from "../../helpers/randomNumber";
import { warningEmbed } from "../../helpers/warningHandler";

const data = new SlashCommandBuilder().setName("beg").setDescription("to beg for money...😓");

async function run(interaction: CommandInteraction) {
  const user = interaction.options?.getUser("user") || interaction.user;

  // beg for moeny
  getAccount(user.id)
    .then(async (account) => {
      const balance = account.balance;

      if (balance <= 10) {
        const rnd_money = getPseudoRandom(1000 + 25 * account.level, 2000 + 50 * account.level);
        addBalance(user.id, rnd_money);

        interaction.reply({
          embeds: [
            new MessageEmbed()
              .setTitle("😥 Poor little beggar, here's some money! 😥")
              .setDescription(`You got **${rnd_money}** 💵 from begging!`)
              .setColor(0xf1c40f),
          ],
        });
      } else if (balance > 0) {
        interaction.reply({
          embeds: [
            new MessageEmbed()
              .setTitle("🤬 Go away! 🤬")
              .setDescription("You already have enough money!")
              .setColor(0xe74c3c),
          ],
        });
      }
    })
    .catch((err) => {
      interaction.reply(warningEmbed({ title: "ERROR", description: err }));
    });
}

export default {
  data,
  run,
};
