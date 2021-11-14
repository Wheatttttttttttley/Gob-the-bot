const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Collection, Intents } = require('discord.js');
const fs = require('fs');
const mongoose = require('mongoose');
if (!process.env.TOKEN) {
    require('dotenv').config();
}

const client = new Client({ intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
],
});

async function registerCommands() {
    const commandFolders = [
        'blackjack', 'currency', 'minigames',
    ];

    const commandFiles = [];
    // Register commands in the command folders
    for (const file of fs.readdirSync('./commands').filter(filename => filename.endsWith('.js'))) {
        commandFiles.push(`./commands/${file}`);
    }
    for (const folder of commandFolders) {
        for (const file of fs.readdirSync(`./commands/${folder}`).filter(filename => filename.endsWith('.js'))) {
            commandFiles.push(`./commands/${folder}/${file}`);
        }
    }

    const commands = [];
    client.commands = new Collection();

    for (const file of commandFiles) {
        const command = require(file);
        commands.push(command.data.toJSON());
        client.commands.set(command.data.name, command);
    }

    console.log('Started refreshing application (/) commands.');
    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
    try {
        if (process.env.GUILD_ID) {
            console.log('Running in dev mode.');
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands },
            );
        } else {
            console.log('Running in production mode.');
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands },
            );
        }

    } catch (error) {
        console.error(error);
    } finally {
        console.log('Finished refreshing application (/) commands.');
    }
}

async function registerEvents() {
    const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(`./events/${file}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

async function mongoConnect() {
    await mongoose.connect(process.env.MONGO_URI || '', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        keepAlive: true,
    });
}

(async () => {
    await client.login(process.env.TOKEN);

    console.log('Registering events');
    await registerEvents();
    console.log('Registering commands');
    await registerCommands();
    console.log('Connecting to MongoDB');
    await mongoConnect();

    console.log(`Ready! Logged in as ${client.user.tag}!`);
    client.user.setActivity('you crying inside', { type : 'WATCHING' });
})();

module.exports = { client };