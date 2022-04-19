import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { addBalance, getAccount } from "../../helpers/accountManager";
import { warningEmbed } from "../../helpers/warningHandler";
import PlayerModel, { PlayerInt } from "../../models/playerModel";

const data = new SlashCommandBuilder().setName("daily").setDescription("Get your daily rewards!");

async function run(interaction: CommandInteraction): Promise<void> {
  const id = interaction.user.id;

  await getAccount(interaction.user.id)
    .then(async (player: PlayerInt) => {
      // get the current date + GMT offset (+07:00)
      const then = new Date(player.cooldown.daily.getTime() + 25200000);
      const now = new Date(Date.now() + 25200000);

      // if it's the same day, return
      if (
        then.getUTCDate() === now.getUTCDate() &&
        then.getUTCMonth() === now.getUTCMonth() &&
        then.getUTCFullYear() === now.getUTCFullYear()
      ) {
        interaction.reply(
          warningEmbed({
            title: "ALREADY CLAIMED",
            description: `You have already claimed your daily rewards today!`,
          }),
        );
        return;
      }

      const payout = 10000 + player.level * 2000;
      addBalance(id, payout);

      await PlayerModel.findOneAndUpdate({ _id: id }, { $set: { cooldown: { daily: new Date() } } }, { upsert: true });

      interaction.reply({
        embeds: [
          new MessageEmbed()
            .setTitle("✅ SUCCESS")
            .setDescription(`You have claimed your daily rewards!\nYou have received\n**${payout}** 💵`)
            .setColor(0x2ecc71),
        ],
      });
    })
    .catch((err: Error) => {
      interaction.reply(warningEmbed({ description: `An error occured: ${err.message}` }));
    });
}

export default {
  data,
  run,
};
