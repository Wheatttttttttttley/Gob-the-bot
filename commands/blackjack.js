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
        this.dealer = new Player();
        this.bet = bet;

        this.messageEmbed = null;
    }

    showCardAndPoints() {
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${this.user.username}'s Blackjack`)
            .setDescription(`**Welcome to blackjack!**\n**Staring bet:** ***${this.bet}***`)
            .addFields(
                { name: `Player (Points: ${this.player.getPoints()})`, value: this.player.showCards() },
                { name: `Dealer (Points: ${this.dealer.getPoints()})`, value: this.dealer.showCards() },
            )
            .setFooter('You can either react with 👍 to hit or react with 👎 to stand.');
        return embed;
    }

    async sendMessage(embed, interaction) {
        if (interaction) {
            if (!interaction.replied) {
                this.messageEmbed = await interaction.reply({ embeds: [embed], fetchReply: true });
            } else {
                this.messageEmbed = await interaction.followUp({ embeds: [embed], fetchReply: true });
            }
        } else {
            await this.messageEmbed.reactions.removeAll();
            await this.messageEmbed.edit({ embeds: [embed] });
        }
    }
}

async function gameRunner(interaction, game) {
    // Deal cards
    game.player.addCard(new Card());
    game.player.addCard(new Card());
    game.dealer.addCard(new Card());
    game.dealer.addCard(new Card(false));

    // Show cards
    if (game.player.points === 21 && game.dealer.points === 21) {
        game.dealer.hand[1].visible = true;
        return 'Draw';
    } else if (game.player.points === 21) {
        return 'Blackjack';
    } else if (game.dealer.points === 21) {
        game.dealer.hand[1].visible = true;
        return 'LoseBlackjack';
    }

    const emoji_filter = (reaction, user) => {
        return ['👍', '👎'].includes(reaction.emoji.name) && user.id === interaction.user.id;
    };

    await game.sendMessage(game.showCardAndPoints(), interaction);
    game.messageEmbed.react('👍').then(() => game.messageEmbed.react('👎'));

    // Player's turn
    while (true) {
        let isStanding = false;
        await game.messageEmbed.awaitReactions({ filter: emoji_filter, max: 1, time: 30000, errors: ['time'] })
            .then(collected => {
                const reaction = collected.first();

                if (reaction.emoji.name === '👍') {
                    game.player.addCard(new Card());
                } else if (reaction.emoji.name === '👎') {
                    isStanding = true;
                }
            })
            .catch(() => {
                game.sendMessage('You don\'t answer in time!');
                game.player.isBusted = true;
                return 'Lose';
            });
        if (isStanding || game.player.isBusted || game.player.points === 21) {
            break;
        } else {
            await game.sendMessage(game.showCardAndPoints());
            game.messageEmbed.react('👍').then(() => game.messageEmbed.react('👎'));
        }
    }

    if (game.player.isBusted) {
        return 'LoseBust';
    } else if (game.player.points === 21) {
        return 'Win';
    }

    // Dealer's turn
    game.dealer.hand[1].visible = true;
    game.sendMessage(game.showCardAndPoints());

    while (game.dealer.points < 17 && game.player.points > game.dealer.points) {
        await sleep(1500);
        game.dealer.addCard(new Card());
        game.sendMessage(game.showCardAndPoints());
    }

    // Find winner
    if (game.player.points > game.dealer.points || game.dealer.isBusted) {
        return 'Win';
    } else if (game.player.points < game.dealer.points) {
        return 'Lose';
    } else {
        return 'Draw';
    }
}

const warningEmbed = new MessageEmbed()
    .setTitle(':warning:ALERT:warning:')
    .setColor(0xE74C3C);

async function execute(interaction) {
    // Check if bot has permission to edit the message
    if (!interaction.guild.me.permissionsIn(interaction.channel).has('MANAGE_MESSAGES')) {
        warningEmbed.setDescription('Gob doesn\'t have "Mange Messages" permission. Please try again!');
        interaction.reply({ embeds: [warningEmbed] });
        return;
    }

    const playerBet = interaction.options.getNumber('bet');
    playerSchema.findOne({ _id: interaction.user.id })
        .then(async (player) => {
            // Check if player exists
            if (!player) {
                warningEmbed.setDescription('Gob can\'t find your account. Please try again!');
                interaction.reply({ embeds: [warningEmbed] });
                return;
            }
            // Check if player has enough money
            if (player.balance < playerBet) {
                warningEmbed.setTitle(':warning:BROKE ALERT:warning:')
                    .setDescription('You don\'t have enough money!');
                interaction.reply({ embeds: [warningEmbed] });
                return;
            }
            player.balance -= playerBet;
            await player.updateOne({ balance: player.balance });

            // Create game
            const game = new Game(interaction.user, playerBet);
            const result = await gameRunner(interaction, game);

            const resultEmbed = game.showCardAndPoints();

            // Result of game
            if (result === 'Win') {
                resultEmbed.addField('Result', `You won ${playerBet}$`)
                    .setColor('#57F287');
                player.balance += playerBet * 2;
            } else if (result === 'Blackjack') {
                resultEmbed.addField('Result', `You got blackjack! \n You won ${playerBet * 1.5}!`)
                    .setColor('#F1C40F');
                player.balance += playerBet * 2.5;
            } else if (result === 'Draw') {
                resultEmbed.addField('Result', 'Draw! You got your bet back')
                    .setColor(0x99AAB5);
                player.balance += playerBet;
            } else if (result === 'Lose') {
                resultEmbed.addField('Result', 'You lost your bet!')
                    .setColor(0xE74C3C);
            } else if (result === 'LoseBlackjack') {
                resultEmbed.addField('Result', 'Dealer got blackjack!\nYou lost your bet!')
                    .setColor(0xE74C3C);
            } else if (result === 'LoseBust') {
                resultEmbed.addField('Result', 'You busted!\nYou lost your bet!')
                    .setColor(0xE74C3C);
            }

            if (!interaction.replied) {
                game.sendMessage(resultEmbed, interaction);
            } else {
                game.sendMessage(resultEmbed);
            }
            // Update player balance
            await player.updateOne({ balance: player.balance });
        })
        .catch(console.error);
}

module.exports = {
    data: data,
    execute: execute,
};