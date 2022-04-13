import { Collection, CommandInteraction, Interaction, Message, MessageEmbed, MessageReaction, User } from "discord.js";
import { promisify } from "util";
import { addBalance, getAccount } from "../../../../helpers/accountManager";
import { Card } from "./Card.js";
import { Player } from "./Player.js";

const sleep = promisify(setTimeout);

export class BlackJackGame {
  interaction: Interaction & CommandInteraction;
  user: User;
  player: Player;
  dealer: Player;
  bet: number;
  gameMessage: Message | null = null;
  isDoubled: boolean = false;
  emojiArray: string[] = ["👍", "👎", "🏳"];
  constructor(interaction: Interaction & CommandInteraction, bet: number) {
    this.interaction = interaction;
    this.user = interaction.user;
    this.player = new Player();
    this.dealer = new Player();
    this.bet = bet;
  }

  async reactMessageEmbed() {
    this.gameMessage?.react("👍");
    this.gameMessage?.react("👎");
    await getAccount(this.user.id).then((player: { balance: number }) => {
      if (player.balance >= this.bet) {
        this.gameMessage?.react("💵");
        this.emojiArray.push("💵");
      }
      this.gameMessage?.react("🏳");
    });
  }

  cardAndPointsEmbed() {
    const embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle(`🃏 ${this.user.username}'s Blackjack card 🃏`)
      .setDescription(`Bet: **${this.bet}** 💵${this.isDoubled ? ` *(Doubled)*` : ""}`)
      .addFields(
        {
          name: `Player (Points: ${this.player.getPoints()})`,
          value: this.player.showCards(),
        },
        {
          name: `Dealer (Points: ${this.dealer.getPoints()})`,
          value: this.dealer.showCards(),
        },
      )
      .setFooter("React with either 👍 to hit, 👎 to stand, 💵 to double, or 🏳 to surrender");
    return embed;
  }

  async sendEmbed(embed: MessageEmbed) {
    if (!this.interaction.replied) {
      this.gameMessage = (await this.interaction.reply({
        embeds: [embed],
        fetchReply: true,
      })) as Message;
    } else if (this.gameMessage) {
      await this.gameMessage.reactions?.removeAll();
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
      return "Draw";
    } else if (this.dealer.points === 21) {
      this.dealer.hand[1].isFaceUp = true;
      return "Lose";
    } else if (this.player.points === 21) {
      return "Blackjack";
    }

    // Player's turn
    this.reactMessageEmbed();

    const emojiFilter = (reaction: MessageReaction, user: User) => {
      return this.emojiArray.includes(reaction.emoji.name as string) && user.id === this.user.id;
    };

    let playerTurn = true,
      isSurrender = false;
    while (playerTurn) {
      await this.gameMessage
        ?.awaitReactions({
          filter: emojiFilter,
          max: 1,
          time: 60000,
          errors: ["time"],
        })
        .then(async (collected: Collection<string, MessageReaction>): Promise<void> => {
          const reaction = collected.first();

          if (reaction?.emoji.name === "👍") {
            this.player.addCard(new Card());
          } else if (reaction?.emoji.name === "👎") {
            playerTurn = false;
          } else if (reaction?.emoji.name === "💵") {
            addBalance(this.user.id, -this.bet);
            this.bet *= 2;
            this.player.addCard(new Card());
            this.isDoubled = true;
            playerTurn = false;
          } else if (reaction?.emoji.name === "🏳") {
            isSurrender = true;
            playerTurn = false;
          }
        })
        .catch(() => {
          return "Timeout";
        });
      if (!playerTurn || this.player.isBusted || this.player.points === 21) {
        break;
      } else {
        await this.sendEmbed(this.cardAndPointsEmbed());
        this.reactMessageEmbed();
      }
    }

    if (this.player.isBusted) {
      return "Lose";
    } else if (this.player.points === 21) {
      return "Win";
    } else if (isSurrender) {
      return "Surrender";
    }

    // Dealer's turn
    this.dealer.hand[1].isFaceUp = true;
    this.sendEmbed(this.cardAndPointsEmbed());

    while (this.dealer.points <= 17 && this.player.points > this.dealer.points) {
      await sleep(1000);
      this.dealer.addCard(new Card());
      this.sendEmbed(this.cardAndPointsEmbed());
    }

    // Find winner
    if (this.player.points > this.dealer.points || this.dealer.isBusted) {
      return "Win";
    } else if (this.player.points < this.dealer.points) {
      return "Lose";
    } else {
      return "Draw";
    }
  }
}
