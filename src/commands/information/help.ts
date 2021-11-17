import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { randomColor } from '../../handlers/randomColor';

const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Help! I need somebody help!');

const run = (interaction: CommandInteraction) => {
    interaction.reply({
        embeds: [
            new MessageEmbed()
                .setTitle('Help')
                .setColor(randomColor())
                .setFooter('Powered by Wheatley\'s engine')
                .setDescription('This is a list of commands you can use in this server.')
                .addField('💰 Currency 💰',
                    '`/balance` - See current balance.\n\
                    `/beg` - Beg people for some money.\n\
                    `/transfer` - Transfer money to someone.\n\
                    `/loan (WIP)` - Get a loan.\n\
                    `/pay (WIP)` - Pay the loan.',
                )
                .addField('🎲 Games 🎲',
                    '`/blackjack` - Play a game of blackjack.\n\
                    `/flip` - Flip a coin.\n\
                    `/rps` - Play Rock, Paper, Scissors.\n\
                    `/highlow`- Play a game of high/low.\n\
                    `/dice (WIP)` - Roll a dice.\n\
                    `/roulette (WIP)` - Play a game of roulette.\n\
                    `/poker (WIP)` - Play a game of poker.\n\
                    `/slots (WIP)` - Play a game of slots.',
                )
                .addField('ℹ Information ℹ',
                    '`/help` - This help message.\n\
                    `/profile` - See profile.\n\
                    `/info` - Information about the bot.',
                ),
        ],
    });
};

export default {
    data,
    run,
};