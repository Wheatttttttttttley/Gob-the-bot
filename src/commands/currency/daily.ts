import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { addBalance } from '../../handlers/account-manager';
import { warningEmbed } from '../../handlers/warningHandler';
import DailyRewardModel from '../../models/dailyRewardModel';

const data = new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Get your daily rewards!');

async function run(interaction: CommandInteraction): Promise<void> {
    const id = interaction.user.id;

    const objId = {
        _id: id,
    };

    const result = await DailyRewardModel.findOne(objId);

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
                warningEmbed({ title: 'ALREADY CLAIMED',
                    description : `You have already claimed your daily rewards!\n\
                    Cooldown (⌛): ${leftHours} h ${leftMinutes} m ${leftSeconds} s`,
                }));
            return;
        }
    }

    await DailyRewardModel.findOneAndUpdate(objId, objId, { upsert: true });

    addBalance(id, 2000);

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('✅ SUCCESS')
            .setDescription('You have claimed your daily rewards!\nYou have received\n**2000**💵')
            .setColor(0x2ECC71)],
    });
}

export default {
    data,
    run,
};