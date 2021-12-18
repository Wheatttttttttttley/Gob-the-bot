import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, Collection, CommandInteraction } from "discord.js";

export interface IClient extends Client {
  commands: Collection<
    string,
    {
      data: SlashCommandBuilder;
      ownerOnly?: boolean;
      run: (interaction: CommandInteraction) => Promise<void>;
    }
  >;
}
