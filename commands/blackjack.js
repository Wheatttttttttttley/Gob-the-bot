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

    showCards() {
        let cards = '';
        for (let i = 0; i < this.player.hand.length; i++) {
            cards += this.player.hand[i].suit + this.player.hand[i].rank + ' ';
        }
        cards += '\n';
        for (let i = 0; i < this.dealer.hand.length; i++) {
            if (this.dealer.hand[i].visible) {
                cards += this.dealer.hand[i].suit + this.dealer.hand[i].rank + ' ';
            }
        }
        return cards;
    }

    showPoints() {
        if (!this.dealer.hand[1].visible) {
            let point = 0;
            if (this.dealer.hand[0].value === 0) {
                point = 11;
            } else if (this.dealer.hand[0].value >= 9) {
                point = 10;
            } else {
                point = this.dealer.hand[0].value + 1;
            }
            return `Your points: ${this.player.points}\nDealer's points: ${point}`;
        }

        return `Your points: ${this.player.points}\nDealer's points: ${this.dealer.points}`;
    }

    showCardAndPoints() {
        return this.showCards() + '\n' + this.showPoints();
    }

    async sendMessage(message, interaction = null) {
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${this.user.username}'s Blackjack`)
            .setDescription(message);

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
    game.player.addCard(new Card());
    game.player.addCard(new Card());
    game.dealer.addCard(new Card());
    game.dealer.addCard(new Card(false));

    if (game.player.points === 21 && game.dealer.points === 21) {
        game.dealer.hand[1].visible = true;
        game.sendMessage(`${game.showCardAndPoints()}\nDraw!`, interaction);
        return 1.0;
    } else if (game.player.points === 21) {
        game.sendMessage(`${game.showCardAndPoints()}\nYou win!`, interaction);
        return 1.5;
    } else if (game.dealer.points === 21) {
        game.dealer.hand[1].visible = true;
        game.sendMessage(`${game.showCardAndPoints()}\nYou lose!`, interaction);
        return 0.0;
    }

    const emoji_filter = (reaction, user) => {
        return ['👍', '👎'].includes(reaction.emoji.name) && user.id === interaction.user.id;
    };

    await game.sendMessage(`${game.showCardAndPoints()}\nHit or stand?`, interaction);
    game.messageEmbed.react('👍').then(() => game.messageEmbed.react('👎'));

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
                return 0.0;
            });
        if (isStanding || game.player.isBusted || game.player.points === 21) {
            break;
        } else {
            await game.sendMessage(`${game.showCardAndPoints()}\nHit or stand?`);
            game.messageEmbed.react('👍').then(() => game.messageEmbed.react('👎'));
        }
    }

    if (game.player.isBusted) {
        game.sendMessage(`${game.showCardAndPoints()}\nYou lose!`);
        return 0.0;
    } else if (game.player.points === 21) {
        game.sendMessage(`${game.showCardAndPoints()}\nYou win!`);
        return 1.0;
    }

    game.dealer.hand[1].visible = true;
    game.sendMessage(game.showCardAndPoints());

    // Dealer's turn
    while (game.dealer.points < 17 && game.player.points > game.dealer.points) {
        await sleep(1500);
        game.dealer.addCard(new Card());
        game.sendMessage(game.showCardAndPoints());
    }

    if (game.player.points > game.dealer.points || game.dealer.isBusted) {
        game.sendMessage(`${game.showCardAndPoints()}\nYou win!`);
        return 1.0;
    } else if (game.player.points < game.dealer.points) {
        game.sendMessage(`${game.showCardAndPoints()}\nYou lose!`);
        return 0.0;
    } else {
        game.sendMessage(`${game.showCardAndPoints()}\nDraw!`);
        return 1.0;
    }
}

async function execute(interaction) {
    if (!interaction.guild.me.permissionsIn(interaction.channel).has('MANAGE_MESSAGES')) {
        interaction.reply('Gob doesn\'t have manage messages permission.');
        return;
    }

    const playerBet = interaction.options.getNumber('bet');
    playerSchema.findOne({ _id: interaction.user.id })
        .then(async (player) => {
            if (player.balance < playerBet) {
                interaction.reply('You don\'t have enough money.');
                return;
            }
            player.balance -= playerBet;
            await player.updateOne({ balance: player.balance });

            const game = new Game(interaction.user, playerBet);
            const multiplier = await gameRunner(interaction, game);

            player.balance += (playerBet * multiplier);
            await player.updateOne({ balance: player.balance });
        });
}

module.exports = {
    data: data,
    execute: execute,
};