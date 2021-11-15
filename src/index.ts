import { Client, Collection, Intents } from 'discord.js';
import { IClient } from './interfaces/IClient';
import { initialize } from './utils/initialize';

export const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
}) as IClient;

(async (): Promise<void> => {
    client.commands = new Collection();

    await initialize();

    await client.login(process.env.TOKEN);
})();