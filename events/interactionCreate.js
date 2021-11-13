const { client } = require('../index.js');
const { MessageEmbed } = require('discord.js');

const playerSchema = require('../schemas/playerSchema.js');

function warningEmbed(title = 'ALERT', description = 'Something went wrong. Please contact me!') {
    return { embeds: [new MessageEmbed().setTitle(`:warning: ${title} :warning:`).setDescription(`**${description}**`).setColor(0xE74C3C)] };
}

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        playerSchema.exists({ _id: interaction.user.id })
            .then(async exists => {
                if (!exists) {
                    await new playerSchema({
                        _id: interaction.user.id,
                        balance: 1000,
                    }).save();
                }
            }).then(async () => {
                if (!interaction.guild.me.permissionsIn(interaction.channel).has('MANAGE_MESSAGES')) {
                    interaction.reply(warningEmbed('PERMISSION ALERT', 'Gob doesn\'t have ability to *"MANAGE_MESSAGES"*. Please try again!'));
                    return;
                }
                if (interaction.isCommand()) {
                    const command = client.commands.get(interaction.commandName);

                    if (!command) return;

                    try {
                        await command.execute(interaction);
                    } catch (error) {
                        console.error(error);
                        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                    }
                }
            });
    },
};