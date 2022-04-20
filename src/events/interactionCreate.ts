import { GuildChannel, GuildChannelResolvable, Interaction, TextChannel } from "discord.js";
import { getAccount, updateLevel } from "../helpers/accountManager";
import { warningEmbed } from "../helpers/warningHandler";
import { client } from "../index";

export default {
  name: "interactionCreate",
  run: async (interaction: Interaction): Promise<void> => {
    if (!interaction.isCommand()) return;
    if (!interaction.guild?.me?.permissionsIn(interaction.channel as GuildChannelResolvable).has("MANAGE_MESSAGES")) {
      interaction.reply(
        warningEmbed({
          title: "Missing Permissions",
          description: "I do not have the **Manage Messages** permission.",
        }),
      );
      return;
    }

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    if (command.ownerOnly && interaction.user.id != process.env.OWNER_ID) {
      interaction.reply(
        warningEmbed({
          title: "Missing Permissions",
          description: "You don't have the permission to use this command.",
        }),
      );
      return;
    }

    // Bet validator
    const bet = interaction.options.getNumber("bet");
    if (bet !== null) {
      const account = await getAccount(interaction.user.id);

      if (bet < 0 || !Number.isInteger(bet)) {
        interaction.reply(
          warningEmbed({
            title: "INVALID BET",
            description: "Bet must be **zero/positive integer.**",
          }),
        );
        return;
      } else if (bet > account.balance) {
        interaction.reply(
          warningEmbed({
            title: "INSUFFICIENT FUNDS",
            description: `You don't have enough money to bet **${bet}**💵`,
          }),
        );
        return;
      }
    }

    try {
      await command
        .run(interaction)
        .then(() => updateLevel(interaction.channel as GuildChannel & TextChannel, interaction.user));
    } catch (err) {
      if (!interaction) {
        return;
      } else if (interaction.deferred || interaction.replied) {
        interaction.followUp(warningEmbed({ title: "Command Error", description: err as string }));
      } else {
        interaction.reply(warningEmbed({ title: "Command Error", description: err as string }));
      }
    }
  },
};
