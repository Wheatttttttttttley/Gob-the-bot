import { GuildChannel, MessageEmbed, TextChannel, User } from "discord.js";
import PlayerModel, { PlayerInt } from "../models/playerModel";

export function createAccount(id: string): Promise<PlayerInt> {
  return new Promise((resolve, reject) => {
    PlayerModel.create({ _id: id }).then(resolve).catch(reject);
  });
}

export function getAccount(id: string): Promise<PlayerInt> {
  return new Promise((resolve, reject) => {
    PlayerModel.findOne({ _id: id })
      .then((player: PlayerInt) => {
        if (player) {
          resolve(player);
        } else {
          createAccount(id).then(resolve).catch(reject);
        }
      })
      .catch(reject);
  });
}

export function addBalance(id: string, amount: number): Promise<number> {
  amount = Math.ceil(amount);

  return new Promise((resolve, reject) => {
    try {
      PlayerModel.findOneAndUpdate({ _id: id }, { $inc: { balance: amount } }, { upsert: true })
        .then((player) => resolve(player?.balance || 0))
        .catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}

export function addXP(id: string, amount: number): Promise<void> {
  amount = Math.ceil(amount);

  return new Promise((resolve, reject) => {
    try {
      PlayerModel.findOneAndUpdate({ _id: id }, { $inc: { xp: amount } }, { upsert: true })
        .then(resolve)
        .catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}

export function addBalanceXP(id: string, balanceAmount: number, xpAmount: number): Promise<void> {
  balanceAmount = Math.ceil(balanceAmount);
  xpAmount = Math.ceil(xpAmount);

  return new Promise((resolve, reject) => {
    try {
      PlayerModel.findOneAndUpdate({ _id: id }, { $inc: { balance: balanceAmount, xp: xpAmount } }, { upsert: true })
        .then(resolve)
        .catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}

export function updateLevel(channel: GuildChannel & TextChannel, user: User): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      getAccount(user.id)
        .then(async (player: PlayerInt) => {
          if (player.xp >= player.xpToNextLevel) {
            while (player.xp >= player.xpToNextLevel) {
              player.xp -= player.xpToNextLevel;
              player.level++;
              player.xpToNextLevel = (2 * player.level ** 2 - player.level + 10) * 100;
            }
            await PlayerModel.findOneAndUpdate(
              { _id: user.id },
              {
                $set: {
                  level: player.level,
                  xp: player.xp,
                  xpToNextLevel: player.xpToNextLevel,
                },
              },
              { upsert: true },
            );
            await channel.send({
              embeds: [
                new MessageEmbed()
                  .setTitle(`🎊 ${user.username} has leveled up! 🎊`)
                  .setDescription(`**${user.username}** is now level **${player.level}!**`)
                  .setColor(0x3498db),
              ],
            });
          }
          resolve();
        })
        .catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}
