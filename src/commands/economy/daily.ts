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
      if (!player.cooldown.daily) {
        player.cooldown.daily = new Date(0);
      }
      const then = player.cooldown.daily.getTime() + 25200000;
      const now = Date.now() + 25200000;

      // get rid of hours, minutes, seconds, and milliseconds
      const prev = then - (then % 86400000);
      const today = now - (now % 86400000);

      // if it's the same day, return
      if (prev === today) {
        const diff = today + 86400000 - now;
        const diffHours = Math.floor(diff / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diff / (1000 * 60)) % 60);
        const diffSeconds = Math.floor((diff / 1000) % 60);
        interaction.reply(
          warningEmbed({
            title: "ALREADY CLAIMED",
            description: `You've already claimed your daily rewards!\nYou can claim again in **${diffHours}h ${diffMinutes}m ${diffSeconds}s ⏲️**`,
          }),
        );
        return;
      }

      const payout = 10000 + player.level * 2000;
      addBalance(id, payout);

      await PlayerModel.findOneAndUpdate(
        { _id: id },
        { $set: { cooldown: { daily: new Date(today) } } },
        { upsert: true },
      );

      interaction.reply({
        embeds: [
          new MessageEmbed()
            .setTitle("✅ SUCCESS ✅")
            .setDescription(
              `You successfully claimed your daily rewards!\nYou received **${payout.toLocaleString()}** 💵`,
            )
            .setColor(0x2ecc71),
        ],
      });
    })
    .catch((err: Error) => {
      interaction.reply(warningEmbed({ description: `An error occured: **${err.message}**` }));
    });
}

export default {
  data,
  run,
};
