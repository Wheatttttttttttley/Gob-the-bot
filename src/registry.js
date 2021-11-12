const { client } = require('./index.js');
const mongoose = require('mongoose');
const fs = require('fs');

async function registerCommands() {
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`../commands/${file}`);
        client.commands.set(command.data.name, command);
    }
}

async function registerEvents() {
    const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(`../events/${file}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

// Connect to MongoDB
async function mongoConnect() {
    await mongoose.connect(process.env.MONGO_URI || '', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        keepAlive: true,
    });
}
async function initialize() {
    console.log('Registering events');
    await registerEvents();
    console.log('Registering commands');
    await registerCommands();
    console.log('Connecting to MongoDB');
    await mongoConnect();
}

module.exports = {
    initialize: initialize,
};