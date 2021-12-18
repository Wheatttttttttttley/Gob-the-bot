import { MessageEmbed } from "discord.js";

export function warningEmbed({
  title = "ALERT",
  description = "Something went wrong. Please contact me!",
}: { title?: string; description?: string } = {}): { embeds: MessageEmbed[] } {
  return {
    embeds: [
      new MessageEmbed()
        .setTitle(`⚠ ${title} ⚠`)
        .setDescription(`**${description}**`)
        .setColor(0xe74c3c),
    ],
  };
}
