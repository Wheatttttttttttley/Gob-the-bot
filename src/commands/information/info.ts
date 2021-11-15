import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { randomColor } from '../../handlers/randomColor';

const data = new SlashCommandBuilder()
    .setName('info')
    .setDescription('Information about the bot.');

const run = async (interaction: CommandInteraction): Promise<void> => {
    interaction.reply({
        embeds: [
            new MessageEmbed()
                .setColor(randomColor())
                .setTitle('ℹ Information ℹ')
                .setDescription('Gob is a bot that mainly does fun and games.')
                .setThumbnail(interaction.client.user?.displayAvatarURL({ format: 'png', size: 64 }) || '')
                .addField('Source 🔗', '[GitHub](https://github.com/Wheatttttttttttley/Gob-the-bot.git)', true)
                .addField('Invite 📧', '[Invite](https://discord.com/api/oauth2/authorize?client_id=902678755397480518&permissions=276220275776&scope=bot%20applications.commands)', true)
                .addField('Donate 💘', '[Ko-fi](https://ko-fi.com/wheatley62820)', true)
                .setFooter('Powerd by Wheatley\'s engine. © 2020', interaction.client.user?.displayAvatarURL({ format: 'png', size: 64 }) || ''),
        ],
    });
};

export default {
    data,
    run,
};