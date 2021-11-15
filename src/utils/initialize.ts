import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { readdirSync } from 'fs';
import { connect } from 'mongoose';
import { client } from '../index';

const commandFolders: string[] = [
    'blackjack',
    'currency',
    'information',
    'minigames',
];

async function registerCommands(): Promise<void> {
    console.log('Registering commands');

    const commandFiles = [];

    for (const file of readdirSync('./prod/commands').filter(filename => filename.endsWith('.js'))) {
        commandFiles.push(`../commands/${file}`);
    }
    for (const folder of commandFolders) {
        for (const file of readdirSync(`./prod/commands/${folder}`).filter(filename => filename.endsWith('.js'))) {
            commandFiles.push(`../commands/${folder}/${file}`);
        }
    }

    const JSONCommands: object[] = [];

    for (const file of commandFiles) {
        await import (file).then(module => {
            const command = module.default;
            JSONCommands.push(command.data.toJSON());
            client.commands.set(command.data.name, command);
        });
    }
    console.log('Commands registered!');

    console.log('Started refreshing application (/) commands.');
    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN as string);
    try {
        if (process.env.GUILD_ID) {
            console.log('Running in dev mode.');
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID as string, process.env.GUILD_ID as string),
                { body: JSONCommands },
            );
        } else {
            console.log('Running in production mode.');
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID as string),
                { body: JSONCommands },
            );
        }

    } catch (error) {
        console.error(error);
    } finally {
        console.log('Finished refreshing application (/) commands.');
    }
}

async function registerEvents(): Promise<void> {
    console.log('Registering events');
    const eventFiles = readdirSync('./prod/events').filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        import (`../events/${file}`).then(module => {
            const event = module.default;
            if (event.once) {
                client.once(event.name, (...args) => event.run(...args));
            } else {
                client.on(event.name, (...args) => event.run(...args));
            }
        });
    }
    console.log('Events registered!');
}

async function connectDatabase(): Promise<void> {
    console.log('Connecting to database');
    await connect(process.env.MONGO_URI as string, {
        keepAlive: true,
    });
    console.log('Connected to database');
}

function validateEnv(): void {
    if (!process.env.TOKEN) {
        throw new Error('TOKEN is not defined!');
    }
    if (!process.env.CLIENT_ID) {
        throw new Error('CLIENT_ID is not defined!');
    }
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not defined!');
    }
}

export async function initialize(): Promise<void> {
    validateEnv();

    await registerEvents();
    await registerCommands();
    await connectDatabase();
}