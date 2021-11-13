const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const { AccountManager } = require('../src/account-manager.js');

const sleep = require('util').promisify(setTimeout);

const data = new SlashCommandBuilder()
    .setName('beg')
    .setDescription('to beg for money...😓');

function warningEmbed(title = 'ALERT', description = 'Something went wrong. Please contact me!') {
    return { embeds: [new MessageEmbed().setTitle(':warning: ' + title + ' :warning:').setDescription('**' + description + '**').setColor(0xE74C3C)] };
}

async function execute(interaction) {
    const user = interaction.options?.getUser('user') || interaction.user;

    // beg for moeny
    AccountManager.getBalance(user)
        .then(async (balance) => {
            interaction.deferReply();
            await sleep(3000);

            if (balance <= 0) {
                const rnd_money = Math.floor(Math.random() * (200 - 1) + 50);
                AccountManager.updateBalance(user.id, rnd_money);

                const begEmbed = new MessageEmbed()
                    .setTitle('😥 Poor little beggar, here\'s some money! 😥')
                    .setDescription(`You got **${rnd_money}** 💵 from begging!`)
                    .setColor(0xF1C40F);
                interaction.editReply({ embeds: [begEmbed] });

            } else if (balance > 0) {
                const begEmbed = new MessageEmbed()
                    .setTitle('🤬 Go away! 🤬')
                    .setDescription('You alreaday have money!')
                    .setColor(0xE74C3C);
                interaction.editReply({ embeds: [begEmbed] });
            }

        }).catch(err => {
            if (interaction.deferred) {
                interaction.editReply(warningEmbed('ERROR', err));
            } else {
                interaction.reply(warningEmbed('ERROR', err));
            }
        });
}

module.exports = {
    data: data,
    execute: execute,
};