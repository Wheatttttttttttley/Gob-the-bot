import { CommandInteraction, GuildChannel, Interaction, TextChannel } from 'discord.js';
import { updateLevel, updateRole } from '../handlers/account-manager';
import { client } from '../index';

export default {
    name: 'interactionCreate',
    run: async (interaction: Interaction & CommandInteraction): Promise<void> => {
        if (!interaction.isCommand()) return;

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