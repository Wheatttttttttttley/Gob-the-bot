const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const { AccountManager } = require('../engine/account-manager.js');
const dailyRewardSchema = require('../schemas/dailyRewardSchema.js');

let claimedCache = [];

const data = new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Get your daily rewards!');

function warningEmbed(title = 'ALERT', description = 'Something went wrong. Please contact me!') {
    return { embeds: [new MessageEmbed().setTitle(':warning: ' + title + ' :warning:').setDescription('**' + description + '**').setColor(0xE74C3C)] };
}

const clearCache = () => {
    claimedCache = [];
    // clear cache after 10 minutes
    setTimeout(clearCache, 1000 * 60 * 10);
};
clearCache();

async function execute(interaction) {
    const id = interaction.user.id;

    if (claimedCache.includes(id)) {
        return interaction.reply(warningEmbed('ALREADY CLAIMED', 'You have already claimed your daily rewards!'));
    }

    const objId = {
        _id: id,
    };

    const result = await dailyRewardSchema.findOne(objId);

    if (result) {
        const then = new Date(result.updatedAt).getTime();
        const now = new Date().getTime();
        const diff = now - then;
        const diffHours = Math.floor(diff / (1000 * 60 * 60));

        if (diffHours < 23) {
            claimedCache.push(id);

            interaction.reply(warningEmbed('ALREADY CLAIMED', 'You have already claimed your daily rewards!'));
            return;
        }
    }

    await dailyRewardSchema.findOneAndUpdate(objId, objId, { upsert: true });

    AccountManager.addBalance(id, 2000);

    claimedCache.push(id);

    const successEmbed = new MessageEmbed()
        .setTitle(':white_check_mark: SUCCESS')
        .setDescription('You have claimed your daily rewards!\nYou have received\n**2000**💵')
        .setColor(0x2ECC71);
    interaction.reply({ embeds: [successEmbed] });
}

module.exports = {
    data: data,
    execute: execute,
};