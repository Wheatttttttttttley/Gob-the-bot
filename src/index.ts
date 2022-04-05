import { Client, Collection, Intents } from "discord.js";
import { IClient } from "./interfaces/IClient";
import { initialize } from "./utils/initialize";

export const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
  shards: "auto",
  restTimeOffset: 100,
}) as IClient;

(async (): Promise<void> => {
  client.commands = new Collection();

  await initialize(client);

  await client.login(process.env.TOKEN);
})();
