import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { addBalanceXP } from '../../../handlers/account-manager';
import { ResultEmbed } from '../roulette';

export const dozenSubcommand = new SlashCommandSubcommandBuilder()
    .setName('dozen')
    .setDescription('Play a dozen roulette, pay 2:1')
    .addNumberOption(options => options.setName('bet')
        .setRequired(true)
        .setDescription('The amount of chips you want to bet'))
    .addNumberOption(options => options.setName('guess')
        .setRequired(true)
        .setDescription('The dozen you want to bet on')
        .addChoices([
            ['1-12', 1],
            ['13-24', 2],
            ['25-36', 3],
        ]));

export const dozenRun = (interaction: CommandInteraction, bet: number, rndNumber: number) => {
    const guess = interaction.options.getNumber('guess');
    const result = rndNumber / 12 === guess;
    if (result) {
        addBalanceXP(interaction.user.id, bet * 3, bet * 2);

        interaction.editReply({ embeds: [ResultEmbed('win', rndNumber, `${guess}`, bet, bet * 2)] });
    } else {
        interaction.editReply({ embeds: [ResultEmbed('lose', rndNumber, `${guess}`, bet, -bet)] });
    }
};