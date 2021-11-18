import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { addBalanceXP } from '../../../handlers/account-manager';
import { ResultEmbed } from '../roulette';

export const evenOddSubcommand = new SlashCommandSubcommandBuilder()
    .setName('even-odd')
    .setDescription('Play an even-odd, pay 1x')
    .addNumberOption(options => options.setName('bet')
        .setRequired(true)
        .setDescription('The amount of chips you want to bet'))
    .addNumberOption(options => options.setName('guess')
        .setRequired(true)
        .setDescription('The even-odd you want to bet on')
        .addChoices([
            ['even', 0],
            ['odd', 1],
        ]));

export const evenOddRun = (interaction: CommandInteraction, bet: number, rndNumber: number) => {
    const guess = interaction.options.getNumber('guess');
    const result = guess === rndNumber % 2;
    if (result) {
        addBalanceXP(interaction.user.id, bet * 2, bet);

        interaction.editReply({ embeds: [ResultEmbed('win', rndNumber, `${guess ? 'odd' : 'even'}`, bet, bet)] });
    } else {
        interaction.editReply({ embeds: [ResultEmbed('lose', rndNumber, `${guess ? 'odd' : 'even'}`, bet, bet)] });
    }
};