import { GuildChannel, MessageEmbed, TextChannel, User } from 'discord.js';
import PlayerModel, { PlayerInt } from '../models/playerModel';

export function createAccount(id: string): Promise<PlayerInt> {
    return new Promise((resolve, reject) => {
        PlayerModel.create({ _id: id, balance: 1000 })
            .then(account => {
                resolve(account);
            })
            .catch(err => {
                reject(err);
            });
    });
}

export function getAccount(id: string): Promise<PlayerInt> {
    return new Promise((resolve, reject) => {
        PlayerModel.findOne({ _id: id })
            .then((player: PlayerInt) => {
                if (player) {
                    resolve(player);
                } else {
                    createAccount(id)
                        .then(newAccount => {
                            resolve(newAccount);
                        })
                        .catch(err => {
                            reject(err);
                        });
                }
            })
            .catch(err => {
                reject(err);
            });
    });
}

export function addBalance(id: string, amount: number): Promise<number> {
    return new Promise((resolve, reject) => {
        try {
            PlayerModel.findOneAndUpdate({ _id: id }, { $inc: { balance: amount } })
                .then(player => {
                    resolve(player.balance);
                })
                .catch(err => {
                    reject(err);
                });
        } catch (err) {
            reject(err);
        }
    });
}

export function addXP(id: string, amount: number): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            PlayerModel.findOneAndUpdate({ _id: id }, { $inc: { xp: amount } })
                .then(() => {
                    resolve();
                })
                .catch(err => {
                    reject(err);
                });
        } catch (err) {
            reject(err);
        }
    });
}

export function updateLevel(channel: GuildChannel & TextChannel, user: User): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            getAccount(user.id).then(async (player: PlayerInt) => {
                if (player.xp >= player.xpToNextLevel) {
                    await PlayerModel.findOneAndUpdate(
                        { _id: user.id },
                        {
                            $inc: {
                                level: 1,
                                xp: -player.xpToNextLevel,
                            },
                            $set: {
                                xpToNextLevel: (2 * ((player.level) ** 2) - (player.level) + 10) * 100,
                            },
                        });
                    await channel.send({ embeds: [
                        new MessageEmbed()
                            .setTitle(`🎊 ${user.username} has leveled up! 🎊`)
                            .setDescription(`**${user.username}** is now level **${player.level + 1}!**`)
                            .setColor(0x3498DB)],
                    });
                    await updateLevel(channel, user);
                } else {
                    resolve();
                }
            }).catch(reject);
        } catch (err) {
            reject(err);
        }
    });
}