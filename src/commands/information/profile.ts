import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { getAccount } from '../../handlers/account-manager';
import { randomColor } from '../../handlers/randomColor';
import { warningEmbed } from '../../handlers/warningHandler';

const data = new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your profile')
    .addUserOption(options =>
        options.setName('user')
            .setDescription('The user to view the profile of'));

async function run(interaction: CommandInteraction): Promise<void> {
    const user = interaction.options?.getUser('user') || interaction.user;

    if (user.bot) {
        interaction.reply(warningEmbed({ title: 'Bot profiles are not supported', description: 'Please use a human profile' }));
        return;
    }

    getAccount(user.id).then(account => {
        const numberEmoji = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
        let level = account.level;
        let levelString = '';
        while (level > 0) {
            levelString = numberEmoji[level % 10] + levelString;
            level = Math.floor(level / 10);
        }
        const xp = account.xp;
        const xpToNextLevel = account.xpToNextLevel;
        const piece = Math.floor((xp / xpToNextLevel) * 10);
        const progressBar = `${'🟩'.repeat(piece)}${'◽'.repeat(10 - piece)}`;

        interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle(`${user.username}'s Profile`)
                    .setThumbnail(user.displayAvatarURL({ format: 'png', size: 512 }))
                    .addField('Balance', `💵 **: ${account.balance}**`, true)
                    .addField('Level', `🌟 **:** ${levelString}`, true)
                    .addField(' 🔸 XP 🔸', `**${xp}** / **${xpToNextLevel}**\n${progressBar}`)
                    .setColor(randomColor()),
            ],
        });
    }).catch(console.error);
}

export default {
    data,
    run,
};