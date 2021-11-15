import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { getAccount } from '../../handlers/account-manager';
import { warningEmbed } from '../../handlers/warningHandler';
import { PlayerInt } from '../../models/playerModel';

const data = new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your balance!')
    .addUserOption(options =>
        options.setName('user')
            .setDescription('The user to check the balance of.'));

async function run(interaction: CommandInteraction): Promise<void> {
    const user = interaction.options?.getUser('user') || interaction.user;

    getAccount(user.id)
        .then((player: PlayerInt) => {
            interaction.reply({ embeds: [
                new MessageEmbed()
                    .setTitle(`💰 Balance of ${user.username} 💰`)
                    .setColor(0x2ECC71)
                    .setDescription(`**💵 : ${player.balance}**`)],
            });

        }).catch((err: string | undefined) => {
            interaction.reply(warningEmbed({ title: 'ERROR', description: err }));
        });
}

export default {
    data,
    run,
};