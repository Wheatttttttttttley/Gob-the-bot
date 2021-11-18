import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { addBalanceXP } from '../../../handlers/account-manager';
import { ResultEmbed } from '../roulette';

export const highLowSubcommand = new SlashCommandSubcommandBuilder()
    .setName('high-low')
    .setDescription('Play a high-low roulette, pay 1:1')
    .addNumberOption(options => options.setName('bet')
        .setRequired(true)
        .setDescription('The amount of chips you want to bet'))
    .addNumberOption(options => options.setName('guess')
        .setRequired(true)
        .setDescription('The high-low you want to bet on')
        .addChoices([
            ['low [1-18]', 0],
            ['high [19-36]', 1],
        ]));

export const highLowRun = (interaction: CommandInteraction, bet: number, rndNumber: number) => {
    const guess = interaction.options.getNumber('guess');
    const result = guess === Math.floor(rndNumber / 18);
    if (result) {
        addBalanceXP(interaction.user.id, bet * 2, bet);

        interaction.editReply({ embeds: [ResultEmbed('win', rndNumber, `${guess ? 'high' : 'low'}`, bet, bet)] });
    } else {
        interaction.editReply({ embeds: [ResultEmbed('lose', rndNumber, `${guess ? 'high' : 'low'}`, bet, bet)] });
    }
};