const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const playerSchema = require('../schemas/playerSchema');

const data = new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your balance!')
    .addUserOption(options =>
        options.setName('user')
            .setDescription('The user to check the balance of.'));

function warningEmbed(title = 'ALERT', description = 'Something went wrong. Please contact me!') {
    return { embeds: [new MessageEmbed().setTitle(':warning: ' + title + ' :warning:').setDescription('***' + description + '***').setColor(0xE74C3C)] };
}

function execute(interaction) {
    const user = interaction.options?.getUser('user') || interaction.user;

    playerSchema.findOne({ _id: user.id })
        .then(async player => {
            // if can't find player
            if (!player) {
                // try create player
                try {
                    await new playerSchema({
                        _id: user.id,
                        balance: 1000,
                    }).save();
                } catch {
                // if the player already exists, there must be an error
                    interaction.reply(warningEmbed('ACCOUNT MISSING ALERT', 'Gob can\'t find your account. Please try again!'));
                } finally {
                    execute(interaction);
                }
                return;
            }

            const balanceEmbed = new MessageEmbed()
                .setTitle(`${user.username}'s balance`)
                .setColor(0x2ECC71)
                .setDescription(`:dollar:: ${player.balance}`);

            interaction.reply({ embeds: [balanceEmbed] });
        })
        .catch(console.error);
}

module.exports = {
    data: data,
    execute: execute,
};