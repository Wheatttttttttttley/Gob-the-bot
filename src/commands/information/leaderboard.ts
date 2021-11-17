import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import playerModel from '../../models/playerModel';
import { warningEmbed } from '../../handlers/warningHandler';

const data = new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('See the leaderboard!')
    .addStringOption(options =>
        options.setName('by')
            .setDescription('rank by...')
            .addChoice('balance', 'balance')
            .addChoice('level', 'level'));

async function run(interaction: CommandInteraction): Promise<void> {
    const by = interaction.options?.getString('by') || 'balance';
    if (by === 'balance') {
        playerModel.find({}).sort({ balance: -1 }).exec((err, players) => {
            if (err) {
                interaction.reply(warningEmbed({ title: 'ERROR', description: err as unknown as string }));
                return;
            }
            const playersInGuild = players.map(player => {
                const member = interaction.guild?.members.cache.get(player._id);
                return {
                    user: member?.user,
                    balance: player.balance,
                };
            }).filter(player => player.user);
            interaction.reply({ embeds: [
                new MessageEmbed()
                    .setTitle('🏆 Leaderboard 🏆')
                    .setColor(0x00AE86)
                    .setFooter('Top 5 players in this guild')
                    .setDescription(
                        playersInGuild.map((player, index) => `${index + 1}. **${player.user?.username}** ${player.balance} 💵`).join('\n'),
                    ),
            ] });
        });
    } else if (by === 'level') {
        playerModel.find({}).sort({ level: -1 }).exec((err, players) => {
            if (err) {
                interaction.reply(warningEmbed({ title: 'ERROR', description: err as unknown as string }));
                return;
            }
            const playersInGuild = players.map(player => {
                const member = interaction.guild?.members.cache.get(player._id);
                return {
                    user: member?.user,
                    level: player.level,
                };
            }).filter(player => player.user);
            interaction.reply({ embeds: [
                new MessageEmbed()
                    .setTitle('🏆 Leaderboard 🏆')
                    .setColor(0x00AE86)
                    .setFooter('Top 5 players in this guild')
                    .setDescription(
                        playersInGuild.map((player, index) => `${index + 1}. **${player.user?.username}** : ${player.level} 🌟`).join('\n'),
                    ),
            ] });
        });
    } else {
        interaction.reply(warningEmbed({ title: 'INVALID OPTION', description: 'leaderboard is only rank by balance or level' }));
    }
}

export default {
    data,
    run,
};