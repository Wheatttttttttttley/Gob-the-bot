const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const { AccountManager } = require('../../engine/account-manager.js');
const dailyRewardSchema = require('../../schemas/dailyRewardSchema.js');

const data = new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Get your daily rewards!');

function warningEmbed(title = 'ALERT', description = 'Something went wrong. Please contact me!') {
    return { embeds: [
        new MessageEmbed()
            .setTitle(':warning: ' + title + ' :warning:')
            .setDescription('**' + description + '**')
            .setColor(0xE74C3C)],
    };
}

async function execute(interaction) {
    const id = interaction.user.id;

    const objId = {
        _id: id,
    };

    const result = await dailyRewardSchema.findOne(objId);

    if (result) {
        const then = new Date(result.updatedAt).getTime();
        const now = new Date().getTime();
        const diff = now - then;
        const left = 86400000 - diff;
        const leftHours = Math.floor(left / 3600000);
        const leftMinutes = Math.floor((left / 60000) % 60);
        const leftSeconds = Math.floor((left / 1000) % 60);

        if (leftHours > 0 || leftMinutes > 0 || leftSeconds > 0) {
            interaction.reply(
                warningEmbed('ALREADY CLAIMED',
                    `You have already claimed your daily rewards!\n\
                    Cooldown (⌛): ${leftHours} h ${leftMinutes} m ${leftSeconds} s`,
                ));
            return;
        }
    }

    await dailyRewardSchema.findOneAndUpdate(objId, objId, { upsert: true });

    AccountManager.addBalance(id, 2000);

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(':white_check_mark: SUCCESS')
            .setDescription('You have claimed your daily rewards!\nYou have received\n**2000**💵')
            .setColor(0x2ECC71)],
    });
}

module.exports = {
    data: data,
    execute: execute,
};