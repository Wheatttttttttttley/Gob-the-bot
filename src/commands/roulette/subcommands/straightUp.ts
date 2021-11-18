import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { addBalanceXP } from '../../../handlers/account-manager';
import { warningEmbed } from '../../../handlers/warningHandler';
import { ResultEmbed } from '../roulette';

export const straightUpSubcommand = new SlashCommandSubcommandBuilder()
    .setName('straight-up')
    .setDescription('Play a straight up, pay 35x')
    .addNumberOption(options => options.setName('bet')
        .setRequired(true)
        .setDescription('The amount of chips you want to bet'))
    .addNumberOption(options => options.setName('number')
        .setRequired(true)
        .setDescription('The number you want to bet on'));

export const straightUpRun = (interaction: CommandInteraction, bet: number, rndNumber: number) => {
    const number = interaction.options.getNumber('number') || 0;
    if (number < 0 || number > 36) {
        interaction.editReply(warningEmbed({ title: 'Invalid number', description: 'The number you bet on must be between 0 and 36' }));
        return;
    }
    const result = number === rndNumber;
    if (result) {
        addBalanceXP(interaction.user.id, bet * 36, bet * 35);

        interaction.editReply({ embeds: [ResultEmbed('win', rndNumber, `${number}`, bet, bet * 35)] });
    } else {
        interaction.editReply({ embeds: [ResultEmbed('lose', rndNumber, `${number}`, bet, -bet)] });
    }
};