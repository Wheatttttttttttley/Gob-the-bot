import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { randomColor } from "../../helpers/randomColor";

const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Help! I need somebody help!")
  .addStringOption((options) =>
    options
      .setName("command")
      .setDescription("The command you want help with.")
      .setRequired(false)
      .addChoices([
        ["balance", "balance"],
        ["beg", "beg"],
        ["transfer", "transfer"],
        ["blackjack", "blackjack"],
        ["flip", "flip"],
        ["rps", "rps"],
        ["highlow", "highlow"],
        ["dice", "dice"],
        ["roulette", "roulette"],
        ["horse", "horse"],
        ["help", "help"],
        ["profile", "profile"],
        ["info", "info"],
      ]),
  );

const run = async (interaction: CommandInteraction) => {
  if (!interaction.options.getString("command")) {
    interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle("Command List")
          .setColor(randomColor())
          .setFooter("Powered by Wheatley's engine ⚡")
          .setDescription("This is a list of commands you can use in this server.")
          .addField("💰 Currency 💰", "`/balance` `/beg` `/transfer`")
          .addField("🎲 Games 🎲", "`/blackjack` `/flip` `/rps` `/highlow` `/dice` `/roulette` `/horse`")
          .addField("ℹ Information ℹ", "`/help` `/profile` `/info`"),
      ],
    });
    return;
  }
  const command = interaction.options.getString("command");
  const embed = new MessageEmbed()
    .setTitle(`ℹ ${command?.toUpperCase()} ℹ`)
    .setColor(randomColor())
    .setFooter("Powered by Wheatley's engine ⚡");
  switch (command) {
    case "balance":
      embed.setDescription("`/balance [user (optional)]` - Shows user's current balance.");
      break;
    case "beg":
      embed.setDescription("`/beg` - Beg people for some money.");
      break;
    case "transfer":
      embed.setDescription("`/transfer [toUser] [amount]` - Transfer money to someone.");
      break;
    case "blackjack":
      embed
        .setDescription("`/blackjack [bet]` - Play a game of blackjack.")
        .addField("GOALS 🎯", "Get as close to 21 as possible without going over.")
        .addField(
          "START 🚩",
          "Dealers and players are dealt 2 cards.\nThe dealer's second card is hidden. If nobody got blackjack, the game continues.",
        )
        .addField("BLACKJACK 🥇", "If your starting hand's points are 21, you get a blackjack.")
        .addField(
          "PLAYER'S TURN 🃏",
          "The player can hit, stay, double, or surrender. If the player stays, the dealer's turn begins.",
        )
        .addField(
          "DEALER'S TURN 🎴",
          "The dealer can hit or stay. If the dealer's points are more than 17, the dealer must stay.",
        )
        .addField(
          "WINNING 🏆",
          "The winner is the player with the closest count to 21 without going over 21.\nIf the player and dealer have the same count, the player gets their bet back.",
        )
        .addField("PAYOUT 💰", "blackjack: **1.5x**\nwin: **1x**\ndraw: *you get your bet back*")
        .addField("SOURCE 📚", "[Bicycle Cards](https://bicyclecards.com/how-to-play/blackjack/)");
      break;
    case "flip":
      embed
        .setDescription("`/flip [heads|tails]` - Flip a coin.")
        .addField("GOALS 🎯", "Flip a coin and see if you get heads or tails.")
        .addField("PAYOUT 💰", "win: **1x**");
      break;
    case "rps":
      embed
        .setDescription("`/rps [rock|paper|scissors]` - Play rock paper scissors.")
        .addField("GOALS 🎯", "Play rock paper scissors and see who wins.")
        .addField("PAYOUT 💰", "win: **1x**\ndraw: *you get your bet back*");
      break;
    case "highlow":
      embed
        .setDescription("`/highlow [low|high]` - Play high low.")
        .addField("GOALS 🎯", "Play high low and see if the number is low[1-5] or high[6-10]")
        .addField("PAYOUT 💰", "win: **1x**");
      break;
    case "dice":
      embed
        .setDescription("`/dice [1-6]` - Roll a dice.")
        .addField("GOALS 🎯", "Roll a dice and see if you get the number.")
        .addField("PAYOUT 💰", "win: **5x**");
      break;
    case "roulette":
      embed
        .setDescription("`/roulette [type]` - Play roulette.")
        .addField("GOALS 🎯", "Place a bet. Roll the wheel and see if you win.")
        .addField(
          "TYPES 🎲",
          "**Straight Up** : Place a bet on a number between 1-36.\n" +
            "**Split** : Place a bet on 2 numbers between 1-36.\n" +
            "**Street** : Place a bet on a row of numbers.\n" +
            "**Corner** : Place a bet on 1 corner of 4 numbers.\n" +
            "**Line** : Place a bet on 2 adjacency rows of numbers.\n" +
            "**Column** : Place a bet 1 column of numbers.\n" +
            "**Dozen** : Place a bet on a dozen of numbers.\n" +
            "**Color** : Place a bet on a color of numbers.\n" +
            "**Even/Odd** : You can guess that the number is even or odd.\n" +
            "**High/Low** : You can guess that the number is low[1-18] or high.[19-36]",
        )
        .addField(
          "COLORS 🎨",
          "🔴 Red: 1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36\n" +
            "🔵 Black: 2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35\n" +
            "🟢 Green: 0",
        )
        .addField("PAYOUT 💰", "Payout rates:")
        .addFields([
          { name: "Straight Up", value: "**35x**", inline: true },
          { name: "Split", value: "**17x**", inline: true },
          { name: "Street", value: "**11x**", inline: true },
          { name: "Corner", value: "**8x**", inline: true },
          { name: "Line", value: "**5x**", inline: true },
          { name: "Column", value: "**2x**", inline: true },
          { name: "Dozen", value: "**2x**", inline: true },
          { name: "Color", value: "**1x**", inline: true },
          { name: "Even/Odd", value: "**1x**", inline: true },
          { name: "High/Low", value: "**1x**", inline: true },
        ])
        .addField(
          "SOURCE 📚",
          "[Casino News Daily](https://www.casinonewsdaily.com/roulette-guide/european-roulette/)",
        );
      break;
    case "horse":
      embed
        .setDescription("`/horse [bet] [horse-amount (optional)]` - Gambling in horse racing.")
        .addField("GOALS 🎯", "Bet on a horse. If the horse wins the race, you wins!")
        .addField(
          "HORSES 🏇",
          "Each race has 6 horses. Each of the horses has its own speed(⚡) and rate(💰).\nThe lower the horse's speed the higher rate. You should weigh carefully.",
        )
        .addField("PAYOUT 💰", "***Depends on the horse***");
      break;
    case "help":
      embed.setDescription("`/help [command (optional)]` - Show a list of commands or help with a specific command.");
      break;
    case "profile":
      embed.setDescription("`/profile [user (optional)]` - Shows user's profile.");
      break;
    case "info":
      embed.setDescription("`/info` - Shows information about the bot.");
      break;
    default:
      embed.setDescription("That command doesn't exist.");
      break;
  }
  interaction.reply({ embeds: [embed] });
};

export default {
  data,
  run,
};
