import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { addBalance, getAccount } from "../../helpers/accountManager";
import { warningEmbed } from "../../helpers/warningHandler";
import PlayerModel, { PlayerInt } from "../../models/playerModel";

const data = new SlashCommandBuilder()
  .setName("daily")
  .setDescription("Get your daily rewards!");

async function run(interaction: CommandInteraction): Promise<void> {
  const id = interaction.user.id;

  await getAccount(interaction.user.id)
    .then(async (player: PlayerInt) => {
      const then = new Date(player.cooldown.daily).getTime();
      const now = new Date().getTime();
      const diff = now - then;
      const left = 86400000 - diff;
      const leftHours = Math.floor(left / 3600000);
      const leftMinutes = Math.floor((left / 60000) % 60);
      const leftSeconds = Math.floor((left / 1000) % 60);

      if (leftHours > 0 || leftMinutes > 0 || leftSeconds > 0) {
        interaction.reply(
          warningEmbed({
            title: "ALREADY CLAIMED",
            description: `You have already claimed your daily rewards!\n\
                        Cooldown (⌛): ${leftHours} h ${leftMinutes} m ${leftSeconds} s`,
          }),
        );
        return;
      }

      const payout = 2000 + player.level * 500;
      addBalance(id, payout);

      await PlayerModel.findOneAndUpdate(
        { _id: id },
        { $set: { cooldown: { daily: new Date() } } },
        { upsert: true },
      );

      interaction.reply({
        embeds: [
          new MessageEmbed()
            .setTitle("✅ SUCCESS")
            .setDescription(
              `You have claimed your daily rewards!\nYou have received\n**${payout}** 💵`,
            )
            .setColor(0x2ecc71),
        ],
      });
    })
    .catch((err: Error) => {
      interaction.reply(
        warningEmbed({ description: `An error occured: ${err.message}` }),
      );
    });
}

export default {
  data,
  run,
};
