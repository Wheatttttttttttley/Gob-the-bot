import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { promisify } from 'util';
import { addBalance, addBalanceXP } from '../../helpers/accountManager';

const sleep = promisify(setTimeout);

const data = new SlashCommandBuilder()
    .setName('highlow')
    .setDescription('Guess the number is high[6-10] or low[1-5].')
    .addNumberOption(option =>
        option.setName('bet')
            .setRequired(true)
            .setDescription('The amount of money you want to bet.'))
    .addStringOption(option =>
        option.setName('guess')
            .setRequired(true)
            .setDescription('your guess')
            .addChoice('high', 'high')
            .addChoice('low', 'low'));

async function run(interaction: CommandInteraction) {
    const bet = interaction.options.getNumber('bet') || 0;
    const guess = interaction.options.getString('guess') || '';

    const embed = new MessageEmbed()
        .setTitle('🎲 High/Low 🎲')
        .setDescription(`You bet **${bet}$** and guessed **${guess}**`)
        .setColor(0xFFFF00);
    await interaction.reply({ embeds: [embed] });
    addBalance(interaction.user.id, -bet);

    await sleep(1500);
    const rndNumber = Math.floor(Math.random() * 10) + 1;

    const result = rndNumber > 5 ? 'high' : 'low';

    if (result === guess) {
        embed.setTitle('🎉 YOU WIN 🎉')
            .setColor(0x2ECC71)
            .setDescription(`The number was **${rndNumber}\nYou won ${bet} 💵**`);
        addBalanceXP(interaction.user.id, 2 * bet, bet);
    } else {
        embed.setTitle('😭 YOU LOSE 😭')
            .setColor(0xE74C3C)
            .setDescription(`The number was **${rndNumber}\nYou lost ${bet} 💵**`);
    }
    await interaction.editReply({ embeds: [embed] });
}

export default {
    data,
    run,
};