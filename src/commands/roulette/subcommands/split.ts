import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { addBalanceXP } from '../../../handlers/account-manager';
import { ResultEmbed } from '../roulette';

export const splitSubcommand = new SlashCommandSubcommandBuilder()
    .setName('split')
    .setDescription('Play a split roulette, pay 17:1')
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
    const first = interaction.options.getNumber('first');
    const second = interaction.options.getNumber('second');
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