import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { promisify } from 'util';
import { addBalance, addBalanceXP, getAccount } from '../../handlers/account-manager';
import { warningEmbed } from '../../handlers/warningHandler';
import { Game } from './blackjack-class/Game';

const sleep = promisify(setTimeout);

const data = new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('Start a game of blackjack!')
    .addNumberOption(option =>
        option.setName('bet')
            .setRequired(true)
            .setDescription('The amount of money you want to bet.'));

const run = async (interaction: CommandInteraction): Promise<void> => {
    const playerBet = interaction.options.getNumber('bet') || 0;
    // Check if bet is valid
    if (!Number.isInteger(playerBet) || playerBet < 0) {
        interaction.reply(warningEmbed({ title: 'INVALID BET ALERT', description: 'Bet must be a *positive integer*' }));
        return;
    }

    const player = await getAccount(interaction.user.id);
    if (player.balance < playerBet) {
        interaction.reply(warningEmbed({ title: 'INSUFFICIENT FUNDS ALERT', description: `You don't have enough money to bet ${playerBet}` }));
        return;
    }
    addBalance(interaction.user.id, -playerBet);

    // Create game
    const game = new Game(interaction, playerBet);

    type resultType = 'Win' | 'Blackjack' | 'Draw' | 'Lose' | 'Timeout' | 'Surrender';
    const result = await game.gameRunner() as resultType;
    await sleep(500);

    const resultEmbed = game.cardAndPointsEmbed();

    // Result of game
    switch (result) {
    case 'Win':
        addBalanceXP(interaction.user.id, game.bet * 2, game.bet);

        resultEmbed.addField('🎉 WIN 🎉', `You won **${ game.bet }** 💵`)
            .setColor(0x57F287);
        break;
    case 'Blackjack':
        addBalanceXP(interaction.user.id, game.bet * 2.5, game.bet * 1.5);

        resultEmbed.addField('🎉 BLACKJACK 🎉', `You got blackjack! You won **${ Math.ceil(game.bet * 1.5) }** 💵`)
            .setColor(0x57F287);
        break;
    case 'Draw':
        addBalanceXP(interaction.user.id, game.bet, game.bet * 0.5);

        resultEmbed.addField('😐 DRAW 😐', 'You got your bet back!')
            .setColor(0x99AAB5);
        break;
    case 'Lose':
        resultEmbed.addField('😭 LOSE 😭', `You lost **${game.bet}** 💵`)
            .setColor(0xE74C3C);
        break;
    case 'Timeout':
        resultEmbed.addField('😭 TIMEOUT 😭', `You didn't react in time! You lost **${game.bet}** 💵`)
            .setColor(0xE74C3C);
        break;
    case 'Surrender':
        addBalance(interaction.user.id, game.bet * 0.5);
        resultEmbed.addField('🏳 SURRENDER 🏳', `You surrendered! You lost **${game.bet * 0.5}** 💵`)
            .setColor(0xE74C3C);
        break;
    }

    await game.sendEmbed(resultEmbed);
};

export default {
    data,
    run,
};