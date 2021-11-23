import { GuildChannel, GuildChannelResolvable, Interaction, TextChannel } from 'discord.js';
import { updateLevel } from '../helpers/accountManager';
import { warningEmbed } from '../helpers/warningHandler';
import { client } from '../index';

export default {
    name: 'interactionCreate',
    run: async (interaction: Interaction): Promise<void> => {
        if (!interaction.isCommand()) return;
        if (!interaction.guild?.me?.permissionsIn(interaction.channel as GuildChannelResolvable).has('MANAGE_MESSAGES')) {
            interaction.reply(warningEmbed({ title: 'Missing Permissions', description: 'I do not have the `Manage Messages` permission.' }));
            return;
        }

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        if (command.ownerOnly && interaction.user.id != process.env.OWNER_ID) {
            interaction.reply(warningEmbed({ title: 'Missing Permissions', description: 'This command is owner only.' }));
            return;
        }

        try {
            await command.run(interaction).then(() => {
                updateLevel(interaction.channel as GuildChannel & TextChannel, interaction.user);
            }).catch(err => {
                if (!interaction) {
                    return;
                }
                if (interaction.deferred || interaction.replied) {
                    interaction.followUp(warningEmbed({ title: 'Command Error', description: err }));
                } else {
                    interaction.reply(warningEmbed({ title: 'Command Error', description: err }));
                }
            });
        } catch (err) {
            if (!interaction) {
                return;
            }
            if (interaction.deferred || interaction.replied) {
                interaction.followUp(warningEmbed({ title: 'Command Error', description: err as string }));
            } else {
                interaction.reply(warningEmbed({ title: 'Command Error', description: err as string }));
            }
        }
    },
};