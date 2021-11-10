const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('Start a game of blackjack!');

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
    constructor(user) {
        this.user = user;
        this.player = new Player();
        this.dealer = new Player();
        this.bet = 1000;
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
            return 'Your points: ' + this.player.points + '\n' +
                'Dealer\'s points: ' + point;
        }

        return 'Your points: ' + this.player.points + '\n' +
               'Dealer\'s points: ' + this.dealer.points;
    }
}

async function gameRunner(game, interaction) {

    game.player.addCard(new Card());
    game.player.addCard(new Card());
    game.dealer.addCard(new Card());
    game.dealer.addCard(new Card(false));
    if (game.dealer.points === 21) {
        game.dealer.hand[1].visible = true;
    }

    if (game.player.points === 21 && game.dealer.points === 21) {
        interaction.followUp(game.showCards() + '\n' + game.showPoints() + '\nDraw!');
        return;
    } else if (game.player.points === 21) {
        interaction.followUp(game.showCards() + '\n' + game.showPoints() + '\nYou win!');
        return;
    } else if (game.dealer.points === 21) {
        interaction.followUp(game.showCards() + '\n' + game.showPoints() + '\nYou lose!');
        return;
    }

    interaction.followUp(game.showCards() + '\n' +
                        game.showPoints() + '\n' +
                        'Type \'hit\' to draw a card.\n' +
                        'Type \'stand\' to stop drawing cards.');

    const msg_filter = (msg) => {
        return ['hit', 'stand'].includes(msg.content) && msg.author.id === interaction.user.id;
    };

    while (true) {
        let isStanding = false;
        await interaction.channel.awaitMessages({ filter: msg_filter, max: 1, time: 30000, errors: ['time'] })
            .then(collected => {
                if (collected.first().content.toLowerCase() === 'hit') {
                    game.player.addCard(new Card());
                    interaction.followUp(game.showCards() + '\n' +
                                        game.showPoints() + '\n' +
                                        'Type \'hit\' to draw a card.\n' +
                                        'Type \'stand\' to stop drawing cards.');
                    if (game.player.isBusted) {
                        interaction.followUp('You lose!');
                        return;
                    } else if (game.player.points === 21) {
                        interaction.followUp('You win!');
                        return;
                    }
                } else if (collected.first().content.toLowerCase() === 'stand') {
                    isStanding = true;
                }
            })
            .catch(() => {
                interaction.followUp('You don\'t answer in time!');
                return;
            });
        if (isStanding) {
            break;
        } else {
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    }

    game.dealer.hand[1].visible = true;
    interaction.followUp(game.showCards() + '\n' + game.showPoints());
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Dealer's turn
    while (game.dealer.points < 17) {
        game.dealer.addCard(new Card());
        interaction.followUp(game.showCards() + '\n' + game.showPoints());

        if (game.dealer.isBusted) {
            interaction.followUp('You win!');
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    if (game.player.points > game.dealer.points) {
        interaction.followUp('You win!');
    } else if (game.player.points < game.dealer.points) {
        interaction.followUp('You lose!');
    } else {
        interaction.followUp('Draw!');
    }
    return;
}
const games = {};
async function execute(interaction) {
    if (games[interaction.user.id]) {
        if (!interaction.replied) {
            interaction.reply('You are already playing a game!');
        } else {
            interaction.followUp('You are already playing a game!');
        }
        return;
    }
    interaction.reply('Welcome to Blackjack!');

    games[interaction.user.id] = new Game(interaction.user);
    await gameRunner(games[interaction.user.id], interaction);
    delete games[interaction.user.id];
}

module.exports = {
    data: data,
    execute: execute,
};