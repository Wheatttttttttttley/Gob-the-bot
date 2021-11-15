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
                .setTitle('ℹ Information ℹ')
                .setColor(randomColor())
                .setThumbnail(interaction.client.user?.displayAvatarURL({ format: 'png', size: 512 }) || '')
                .setDescription('**Gob The Discord Bot**\n\
                Gob is a Discord bot that is designed to be a fun and easy way to play games.\n\
                🔵 Features\n\
                ◻ **Gob** can be used to play a variety of games, including:\n\
                    ◽ Blackjack\n\
                    ◽ Coinflip\n\
                    ◽ Rock, Paper, Scissors\n\
                    ◽ High/Low\n\
                    ◽ Dice (WIP)\n\
                    ◽ Roulette (WIP)\n\
                    ◽ Poker (WIP)\n\
                    ◽ slots (WIP)\n\
                ◻ **Gob** can be used to manage your server\'s economy.\n\
                    ◽ View your balance\n\
                    ◽ View your bank account (WIP)\n\
                    ◽ Get a loan (WIP)\n\
                    ◽ Pay your loan (WIP)\n\
                    ◽ Transfer money')
                .setFooter('This bot is a bot made by [@Wheatley#4748](https://discord.com/users/Wheatley#4748)\n')
                .addField('GitHub', ''),
        ],
    });
};

export default {
    data,
    run,
};