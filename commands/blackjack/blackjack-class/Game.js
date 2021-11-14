const { MessageEmbed } = require('discord.js');

const { Player } = require('./Player.js');
const { Card } = require('./Card.js');
const { AccountManager } = require('../../../engine/account-manager.js');

const sleep = require('util').promisify(setTimeout);

/**
 * @classdesc The Game class is used to represent a blackjack game.
 * @class Game
 *
 * @param {Discord.Interaction} interaction The interaction object.
 * @param {Discord.User} user The user that started the game.
 * @param {Number} bet The amount of money the user bet.
 *
 * @property {Discord.Interaction} interaction The interaction of the game.
 * @property {Discord.User} user The user that started the game.
 * @property {Player} player The player of the game.
 * @property {Player} dealer The dealer of the game.
 * @property {Number} bet The bet of the game.
 *
 * @returns {String} game result message.
 */
class Game {
    constructor(interaction, bet) {
        this.interaction = interaction;
        this.user = interaction.user;
        this.player = new Player();
        this.dealer = new Player();
        this.bet = bet;

        this.gameMessage = null;

        this.emojiArray = ['👍', '👎', '🏳'];
    }

    async reactMessageEmbed() {
        this.gameMessage.react('👍');
        this.gameMessage.react('👎');
        await AccountManager.getAccount(this.user.id)
            .then(player => {
                if (player.balance >= this.bet) {
                    this.gameMessage.react('💵');
                    this.emojiArray.push('💵');
                }
                this.gameMessage.react('🏳');
            });
    }

    cardAndPointsEmbed() {
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`🃏 ${this.user.username}'s Blackjack 🃏card`)
            .setDescription(`**Bet:** ***${this.bet}***`)
            .addFields(
                { name: `Player (Points: ${this.player.getPoints()})`, value: this.player.showCards() },
                { name: `Dealer (Points: ${this.dealer.getPoints()})`, value: this.dealer.showCards() },
            )
            .setFooter('React with either 👍 to hit, 👎 to stand, 💵 to double, or 🏳 to surrender');
        return embed;
    }

    async sendEmbed(embed) {
        if (!this.interaction.replied) {
            this.gameMessage = await this.interaction.reply({ embeds: [embed], fetchReply: true });
        } else if (this.gameMessage) {
            await this.gameMessage.reactions.removeAll();
            await this.gameMessage.edit({ embeds: [embed] });
        }
    }

    async gameRunner() {
        // Deal cards
        this.player.addCard(new Card());
        this.player.addCard(new Card());
        this.dealer.addCard(new Card());
        this.dealer.addCard(new Card(false));

        await this.sendEmbed(this.cardAndPointsEmbed());

        // Show cards
        if (this.player.points === 21 && this.dealer.points === 21) {
            this.dealer.hand[1].isFaceUp = true;
            return 'Draw';
        } else if (this.dealer.points === 21) {
            this.dealer.hand[1].isFaceUp = true;
            return 'Lose';
        } else if (this.player.points === 21) {
            return 'Blackjack';
        }

        // Player's turn
        this.reactMessageEmbed();

        const emojiFilter = (reaction, user) => {
            return this.emojiArray.includes(reaction.emoji.name) && user.id === this.user.id;
        };

        let playerTurn = true, isSurrender = false;
        while (playerTurn) {
            await this.gameMessage.awaitReactions({ filter: emojiFilter, max: 1, time: 60000, errors: ['time'] })
                .then(async (collected) => {
                    const reaction = collected.first();

                    if (reaction.emoji.name === '👍') {
                        this.player.addCard(new Card());
                    } else if (reaction.emoji.name === '👎') {
                        playerTurn = false;
                    } else if (reaction.emoji.name === '💵') {
                        AccountManager.addBalance(this.user.id, -this.bet);
                        this.bet *= 2;
                        this.player.addCard(new Card());
                        playerTurn = false;
                    } else if (reaction.emoji.name === '🏳') {
                        isSurrender = true;
                        playerTurn = false;
                    }
                })
                .catch(() => {
                    return 'Timeout';
                });
            if (!playerTurn || this.player.isBusted || this.player.points === 21) {
                break;
            } else {
                await this.sendEmbed(this.cardAndPointsEmbed());
                this.reactMessageEmbed();
            }
        }

        await sleep(500);

        if (this.player.isBusted) {
            return 'Lose';
        } else if (this.player.points === 21) {
            return 'Win';
        } else if (isSurrender) {
            return 'Surrender';
        }

        // Dealer's turn
        this.dealer.hand[1].isFaceUp = true;
        this.sendEmbed(this.cardAndPointsEmbed());

        while (this.dealer.points < 17 && this.player.points > this.dealer.points) {
            this.dealer.addCard(new Card());
            this.sendEmbed(this.cardAndPointsEmbed());
            await sleep(500);
        }

        // Find winner
        if (this.player.points > this.dealer.points || this.dealer.isBusted) {
            return 'Win';
        } else if (this.player.points < this.dealer.points) {
            return 'Lose';
        } else {
            return 'Draw';
        }
    }
}
exports.Game = Game;
