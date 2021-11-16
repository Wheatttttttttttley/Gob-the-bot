import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { warningEmbed } from '../../handlers/warningHandler';
import { Deck } from './poker-class/Deck';

const data = new SlashCommandBuilder()
    .setName('poker')
    .setDescription('Play poker')
    .addNumberOption(options => options.setName('bet')
        .setRequired(true)
        .setDescription('The amount of chips you want to bet'))
    .setDefaultPermission(false);

async function run(interaction: CommandInteraction) {
    const bet = interaction.options.getNumber('bet') || 0;

    if (!Number.isInteger(bet) || bet < 0) {
        interaction.reply(warningEmbed({ title: 'INVALID BET', description: 'Bet must a postive integer' }));
        return;
    }

    const deck = new Deck();
    deck.shuffle();

    // TODO: implement poker logic
    interaction.reply(warningEmbed({ title: 'POKER', description: 'Poker is not implemented yet' }));

    return;
}

export default {
    data,
    run,
};