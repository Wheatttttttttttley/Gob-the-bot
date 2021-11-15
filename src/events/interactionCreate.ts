import { GuildChannel, GuildChannelResolvable, Interaction, TextChannel } from 'discord.js';
import { updateLevel, updateRole } from '../handlers/account-manager';
import { warningEmbed } from '../handlers/warningHandler';
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

        try {
            await command.run(interaction)
                .then(() => {
                    updateRole(interaction.channel as GuildChannel & TextChannel, interaction.user);
                    updateLevel(interaction.channel as GuildChannel & TextChannel, interaction.user);
                }).catch(console.error);
        } catch (error) {
            console.error(error);
        }
    },
};