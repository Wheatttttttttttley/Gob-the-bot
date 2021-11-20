import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { addBalanceXP } from '../../../helpers/accountManager';
import { warningEmbed } from '../../../helpers/warningHandler';
import { ResultEmbed } from '../roulette';

export const splitSubcommand = new SlashCommandSubcommandBuilder()
    .setName('split')
    .setDescription('Play a split, pay 17x')
    .addNumberOption(options => options.setName('bet')
        .setRequired(true)
        .setDescription('The amount of chips you want to bet'))
    .addNumberOption(options => options.setName('first')
        .setRequired(true)
        .setDescription('The first number you want to bet on'))
    .addNumberOption(options => options.setName('second')
        .setRequired(true)
        .setDescription('The second number you want to bet on'));

export const splitRun = (interaction: CommandInteraction, bet: number, rndNumber: number) => {
    const first = interaction.options.getNumber('first') || 0;
    const second = interaction.options.getNumber('second') || 9;
    if (first < 0 || first > 36 || second < 0 || second > 36) {
        interaction.editReply(warningEmbed({ title: 'Invalid number', description: 'The number you bet on must be between 0 and 36' }));
        return;
    }
    if (first === second) {
        // straight up
        const result = first === rndNumber;
        if (result) {
            addBalanceXP(interaction.user.id, bet * 36, bet * 35);

            interaction.editReply({ embeds: [ResultEmbed('win', rndNumber, `${first}`, bet, bet * 35)] });
        } else {
            interaction.editReply({ embeds: [ResultEmbed('lose', rndNumber, `${first}`, bet, -bet)] });
        }
        return;
    }
    const result = first === rndNumber || second === rndNumber;
    if (result) {
        addBalanceXP(interaction.user.id, bet * 18, bet * 17);

        interaction.editReply({ embeds: [ResultEmbed('win', rndNumber, `${first} ${second}`, bet, bet * 17)] });
    } else {
        interaction.editReply({ embeds: [ResultEmbed('lose', rndNumber, `${first} ${second}`, bet, -bet)] });
    }
};