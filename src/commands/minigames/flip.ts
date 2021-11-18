import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { promisify } from 'util';
import { addBalance, addBalanceXP, getAccount } from '../../handlers/account-manager';
import { warningEmbed } from '../../handlers/warningHandler';

const sleep = promisify(setTimeout);

const data = new SlashCommandBuilder()
    .setName('flip')
    .setDescription('Flip a coin!')
    .addNumberOption(option =>
        option.setName('bet')
            .setRequired(true)
            .setDescription('The amount of money you want to bet.'))
    .addStringOption(option =>
        option.setName('side')
            .setRequired(true)
            .setDescription('The side you want to bet on.')
            .addChoice('heads', 'h')
            .addChoice('tails', 't'));

async function run(interaction: CommandInteraction) {
    const bet = interaction.options.getNumber('bet') || 0;
    const side = interaction.options.getString('side') || '';
    const account = await getAccount(interaction.user.id);

    if (bet < 0 || !Number.isInteger(bet)) {
        interaction.reply(warningEmbed({ title: 'INVALID BET ALERT', description: 'Bet must be a *non-negative integer*' }));
        return;
    } else if (bet > account.balance) {
        interaction.reply(warningEmbed({ title: 'INSUFFICIENT FUNDS ALERT', description: `You don't have enough money to bet ${bet}` }));
        return;
    }

    const embed = new MessageEmbed()
        .setTitle('🎲 Coin flipping 🎲')
        .setDescription(`You bet **${bet}** on **${side === 'h' ? 'heads' : 'tails'}**`)
        .setColor(0xE91E63);
    await interaction.reply({ embeds: [embed] });
    addBalance(interaction.user.id, -bet);

    await sleep(1500);

    const rndSide = Math.random() < 0.5 ? 'h' : 't';
    const result = rndSide === side ? 'win' : 'lose';

    embed.setTitle(`🎲 ${result.toUpperCase()}! 🎲`)
        .setDescription(rndSide === 'h' ? '**HEADS** 🌝' : '**TAILS** 🌚');
    if (result === 'win') {
        embed.addField('✅ You won! ✅', `You won **${bet}**💵`).setColor(0x2ECC71);
        addBalanceXP(interaction.user.id, 2 * bet, bet);
    } else if (result === 'lose') {
        embed.addField('❌ You lost! ❌', `You lost **${bet}**💵`).setColor(0xE74C3C);
    }
    await interaction.editReply({ embeds: [embed] });
}

export default {
    data,
    run,
};