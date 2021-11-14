import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';

const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Help! I need somebody help!');

const run = async (interaction: CommandInteraction): Promise<void> => {
    interaction.reply({
        embeds: [
            new MessageEmbed()
                .setTitle('Help')
                .setColor(0x1ABC9C)
                .setFooter('Powered by Wheatley\'s engine')
                .setDescription('This is a list of commands you can use in this server.')
                .addField('💸 Currency 💵',
                    '`/balance` - See current balance.\n\
                    `/beg` - Beg people for some money.\n\
                    `/loan (WIP)` - Get a loan.\n\
                    `/pay (WIP)` - Pay the loan.\n\
                    `/transfer` - Transfer money to someone.')
                .addField('🎲 Games 🎲',
                    '`/blackjack` - Play a game of blackjack.\n\
                    `/roll (WIP)` - Roll a dice.\n\
                    `/flip` - Flip a coin.\n\
                    `/rps` - Play Rock, Paper, Scissors.\n\
                    `/highlow`- Play a game of high/low.')
                .addField('ℹ Information ℹ',
                    '`/help` - This help message.\n\
                    `/profile (WIP)` - See profile.\n\
                    `/info (WIP)` - Information about the bot.'),
        ],
    });
};


export default {
    data,
    run,
};