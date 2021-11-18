import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { readdirSync } from 'fs';
import { connect } from 'mongoose';
import { IClient } from '../interfaces/IClient';

const commandFolders: string[] = [
    'blackjack',
    'currency',
    'information',
    'minigames',
    // TODO: implement poker
    // 'poker',
    'roulette',
];

async function registerCommands(client: IClient): Promise<void> {
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
    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN as string);
    try {
        if (process.env.GUILD_ID) {
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID as string, process.env.GUILD_ID as string),
                { body: JSONCommands },
            );
        } else {
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID as string),
                { body: JSONCommands },
            );
        }
    } catch (error) {
        return;
    }
}

async function registerEvents(client: IClient): Promise<void> {
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
}

async function connectDatabase(): Promise<void> {
    await connect(process.env.MONGO_URI as string, {
        keepAlive: true,
    });
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

export async function initialize(client: IClient): Promise<void> {
    validateEnv();

    await registerEvents(client);
    await registerCommands(client);
    await connectDatabase();
}