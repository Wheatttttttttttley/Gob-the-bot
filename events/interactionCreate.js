const { client } = require('../src/index.js');
const playerSchema = require('../schemas/playerSchema.js');

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
            });

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
    },
};