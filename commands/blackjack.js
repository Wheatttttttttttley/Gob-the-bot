const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const playerSchema = require('../schemas/playerSchema');
const sleep = require('util').promisify(setTimeout);

const data = new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('Start a game of blackjack!')
    .addNumberOption(option =>
        option.setName('bet')
            .setRequired(true)
            .setDescription('The amount of money you want to bet.'));

class Player {
    constructor() {
        this.hand = [];
        this.aceCount = 0;
        this.points = 0;
        this.isBusted = false;
    }

    addCard(card) {
        this.hand.push(card);
        if (card.value === 0) {
            if (this.points + 11 > 21) {
                this.points += 1;
            } else {
                this.aceCount += 1;
                this.points += 11;
            }
        } else if (card.value >= 9) {
            this.points += 10;
        } else {
            this.points += card.value + 1;
        }

        while (this.aceCount > 0 && this.points > 21) {
            this.points -= 10;
            this.aceCount--;
        }

        if (this.points > 21) {
            this.isBusted = true;
        }
    }

    showCards() {
        let cards = '';
        for (let i = 0; i < this.hand.length; i++) {
            if (this.hand[i].visible) {
                cards += this.hand[i].suit + this.hand[i].rank + ' ';
            }
        }
        return cards;
    }

    getPoints() {
        if (!this.hand[1].visible) {
            let point = 0;
            if (this.hand[0].value === 0) {
                point = 11;
            } else if (this.hand[0].value >= 9) {
                point = 10;
            } else {
                point = this.hand[0].value + 1;
            }
            return point;
        }

        return this.points;

    }

}

class Card {
    constructor(visible = true) {
        this.suit = ['♣️', '♦️', '♥️', '♠️'][Math.floor(Math.random() * 4)];
        this.value = Math.floor(Math.random() * 13);
        this.rank = ['🅰', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', ':regional_indicator_j:', ':regional_indicator_q:', ':regional_indicator_k:'][this.value];

        this.visible = visible;
    }
}

class Game {
    constructor(user, bet) {
        this.user = user;
        this.player = new Player();
        this.playerSecondHand = new Player();
        this.dealer = new Player();
        this.bet = bet;

        this.gameMessage = null;

        this.emojiArray = ['👍', '👎'];
    }

    reactMessageEmbed() {
        this.gameMessage.react('👍');
        this.gameMessage.react('👎');
        playerSchema.findOne({ _id: this.user.id })
            .then(player => {
                if (player.balance >= this.bet) {
                    this.gameMessage.react('💵');
                    this.emojiArray.push('💵');
                }
            });
    }

    cardAndPointsEmbed() {
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${this.user.username}'s Blackjack`)
            .setDescription(`**Bet:** ***${this.bet}***`)
            .addFields(
                { name: `Player (Points: ${this.player.getPoints()})`, value: this.player.showCards() },
                { name: `Dealer (Points: ${this.dealer.getPoints()})`, value: this.dealer.showCards() },
            )
            .setFooter('React with either 👍 to hit, 👎 to stand, or 💵 to double');
        return embed;
    }

    async sendEmbed(embed, interaction) {
        if (interaction) {
            this.gameMessage = await interaction.reply({ embeds: [embed], fetchReply: true });
        } else {
            await this.gameMessage.reactions.removeAll();
            await this.gameMessage.edit({ embeds: [embed] });
        }
    }

    async gameRunner(interaction) {
        // Deal cards
        this.player.addCard(new Card());
        this.player.addCard(new Card());
        this.dealer.addCard(new Card());
        this.dealer.addCard(new Card(false));

        // Show cards
        if (this.player.points === 21 && this.dealer.points === 21) {
            this.dealer.hand[1].visible = true;
            return 'Draw';
        } else if (this.player.points === 21) {
            return 'Blackjack';
        } else if (this.dealer.points === 21) {
            this.dealer.hand[1].visible = true;
            return 'LoseBlackjack';
        }

        // Player's turn
        await this.sendEmbed(this.cardAndPointsEmbed(), interaction);
        this.reactMessageEmbed();

        const emojiFilter = (reaction, user) => {
            return this.emojiArray.includes(reaction.emoji.name) && user.id === this.user.id;
        };

        let playerTurn = true;
        while (playerTurn) {
            await this.gameMessage.awaitReactions({ filter: emojiFilter, max: 1, time: 60000, errors: ['time'] })
                .then(async (collected) => {
                    const reaction = collected.first();

                    if (reaction.emoji.name === '👍') {
                        this.player.addCard(new Card());
                    } else if (reaction.emoji.name === '👎') {
                        playerTurn = false;
                    } else if (reaction.emoji.name === '💵') {
                        await playerSchema.findOneAndUpdate({ _id: this.user.id }, { $inc: { balance: -this.bet } });
                        this.bet *= 2;
                        this.player.addCard(new Card());
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

        if (this.player.isBusted) {
            return 'LoseBust';
        } else if (this.player.points === 21) {
            return 'Win';
        }

        // Dealer's turn
        this.dealer.hand[1].visible = true;
        this.sendEmbed(this.cardAndPointsEmbed());

        while (this.dealer.points < 17 && this.player.points > this.dealer.points) {
            await sleep(1500);
            this.dealer.addCard(new Card());
            this.sendEmbed(this.cardAndPointsEmbed());
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

function warningEmbed(title = 'ALERT', description = 'Something went wrong. Please contact me!') {
    return { embeds: [new MessageEmbed().setTitle(':warning: ' + title + ' :warning:').setDescription('***' + description + '***').setColor(0xE74C3C)] };
}

async function execute(interaction) {
    // Check if bot has permission to edit the message
    if (!interaction.guild.me.permissionsIn(interaction.channel).has('MANAGE_MESSAGES')) {
        interaction.reply(warningEmbed('PERMISSION ALERT', 'Gob doesn\'t have ability to "MANAGE_MESSAGES". Please try again!'));
        return;
    }

    const playerBet = interaction.options.getNumber('bet');
    // Check if bet is valid
    if (!Number.isInteger(playerBet) || playerBet < 0) {
        interaction.reply(warningEmbed('INVALID BET ALERT', 'Bet must be a non-negative integer'));
        return;
    }

    playerSchema.findOne({ _id: interaction.user.id })
        .then(async (player) => {
            // Check if player exists
            if (!player) {
                interaction.reply(warningEmbed('ACCOUNT MISSING ALERT', 'Gob can\'t find your account. Please try again!'));
                return;
            }

            // Check if player has enough money
            if (player.balance < playerBet) {
                interaction.reply(warningEmbed('POVERTY ALERT', 'You don\'t have enough money!'));
                return;
            }

            await player.updateOne({ $inc: { balance: -playerBet } });

            // Create game
            const game = new Game(interaction.user, playerBet);
            const result = await game.gameRunner(interaction);

            const resultEmbed = game.cardAndPointsEmbed();

            // Result of game
            switch (result) {
            case 'Win':
                await player.updateOne({ $inc: { balance: game.bet * 2 } });

                resultEmbed.addField(':tada: WIN :tada:', `***You won ${game.bet}$!***`)
                    .setColor(0x57F287);
                break;
            case 'Blackjack':
                await player.updateOne({ $inc: { balance: Math.ceil(game.bet * 2.5) } });

                resultEmbed.addField(':tada: BLACKJACK :tada:', `***You got blackjack! You won ${ Math.ceil(game.bet * 1.5) }!***`)
                    .setColor(0x57F287);
                break;
            case 'Draw':
                await player.updateOne({ $inc: { balance: game.bet } });

                resultEmbed.addField(':neutral_face: DRAW :neutral_face:', '***You got your bet back!***')
                    .setColor(0x99AAB5);
                break;
            case 'Lose':
                resultEmbed.addField(':sob: LOSE :sob:', `***You lost ${game.bet}$!***`)
                    .setColor(0xF2F2F2);
                break;
            case 'LoseBust':
                resultEmbed.addField(':sob: LOSE :sob:', `***You busted! You lost ${game.bet}!***`)
                    .setColor(0xF2F2F2);
                break;
            case 'LoseBlackjack':
                resultEmbed.addField(':sob: LOSE :sob:', `***Dealer got blackjack! You lost ${game.bet}!***`)
                    .setColor(0xF2F2F2);
                break;
            case 'Timeout':
                resultEmbed.addField(':sob: TIMEOUT :sob:', `***You didn't react in time! You lost ${game.bet}!***`)
                    .setColor(0xF2F2F2);
                break;
            }

            await game.sendEmbed(resultEmbed);
        })
        .catch(console.error);
}

module.exports = {
    data: data,
    execute: execute,
};