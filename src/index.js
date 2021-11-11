const { Client, Collection, Intents } = require('discord.js');
if (!process.env.TOKEN) {
    require('dotenv').config();
}

const client = new Client({ intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
],
});

(async () => {
    console.log('Initializing...');

    await client.login(process.env.TOKEN);
    client.user.setActivity('you crying inside', { type : 'WATCHING' });

    client.commands = new Collection();
    await require('./registry.js').initialize();

    console.log(`Ready! Logged in as ${client.user.tag}`);
})();

module.exports = { client };