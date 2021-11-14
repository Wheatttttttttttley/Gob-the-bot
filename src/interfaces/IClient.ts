import { SlashCommandBuilder } from '@discordjs/builders';
import { Client, Collection, CommandInteraction } from 'discord.js';

export interface IClient extends Client {
    commands: Collection<string, {
        data: SlashCommandBuilder,
        run: (interaction: CommandInteraction) => Promise<void>,
    }>;
}