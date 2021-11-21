import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { addBalance, getAccount } from '../../helpers/accountManager';
import { warningEmbed } from '../../helpers/warningHandler';

const data = new SlashCommandBuilder()
    .setName('beg')
    .setDescription('to beg for money...😓');

async function run(interaction: CommandInteraction) {
    const user = interaction.options?.getUser('user') || interaction.user;

    // beg for moeny
    getAccount(user.id).then(async (account) => {
        const balance = account.balance;

        if (balance <= 10) {
            const rnd_money = Math.floor(Math.random() * (200 * account.level - (account.level * 50) + 1) + (account.level * 50));
            addBalance(user.id, rnd_money);

            interaction.reply({ embeds: [
                new MessageEmbed()
                    .setTitle('😥 Poor little beggar, here\'s some money! 😥')
                    .setDescription(`You got **${rnd_money}** 💵 from begging!`)
                    .setColor(0xF1C40F),
            ] });

        } else if (balance > 0) {
            interaction.reply({ embeds : [
                new MessageEmbed()
                    .setTitle('🤬 Go away! 🤬')
                    .setDescription('You already have enough money!')
                    .setColor(0xE74C3C),
            ] });
        }

    }).catch(err => {
        interaction.reply(warningEmbed({ title: 'ERROR', description: err }));
    });
}

export default {
    data,
    run,
};