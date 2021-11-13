const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Help! I need somebody help!');

async function execute(interaction) {
    interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle('Help')
            .setColor(0x1ABC9C)
            .setFooter('Powered by Wheatlet\'s engine')
            .setDescription('This is a list of commands you can use in this server.')
            .addField(':money_with_wings: Currency :money_with_wings:',
                '`/balance` - See current balance.\n\
                `/beg` - Beg people for some money.\n\
                `/loan (WIP)` - Get a loan.\n\
                `/pay (WIP)` - Pay the loan.\n\
                `/transfer (WIP)` - Transfer money to someone.')
            .addField(':game_die: Games :game_die:',
                '`/blackjack` - Play a game of blackjack.\n\
                `/roll (WIP)` - Roll a dice.\n\
                `/flip (WIP)` - Flip a coin.\n\
                `/rps (WIP)` - Play Rock, Paper, Scissors.')
            .addField(':information_source: Information :information_source:',
                '`/help` - This help message.\n\
                `/profile (WIP)` - See profile.\n\
                `/info (WIP)` - Information about the bot.')],
    });
}

module.exports = {
    data: data,
    execute: execute,
};