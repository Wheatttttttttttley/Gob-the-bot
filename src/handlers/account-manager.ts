import { Guild, GuildChannel, GuildMember, MessageEmbed, Role, TextChannel, User } from 'discord.js';
import PlayerModel, { PlayerInt } from '../models/playerModel';

export function createAccount(id: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        PlayerModel.create({ _id: id, balance: 1000 })
            .then(() => {
                resolve();
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
                        .then(() => {
                            resolve(player);
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


function createRole(guild: Guild): Promise<Role> {
    return new Promise((resolve, reject) => {
        try {
            resolve(
                guild.roles.create({
                    name: process.env.EXCLUSIVE_ROLE_NAME as string,
                    color: 0x3498DB,
                    permissions: [],
                }),
            );
        } catch (err) {
            reject(err);
        }
    });
}

export async function updateRole(channel: GuildChannel & TextChannel, user: User): Promise<void> {
    if (!channel.guild?.me?.permissions.has('MANAGE_ROLES')) {
        console.log('Bot does not have permission to manage roles');
        return;
    }
    const guild = channel.guild;
    let role: Role = guild.roles.cache.find(r => r.name === process.env.EXCLUSIVE_ROLE_NAME as string) || await createRole(guild);
    if (!role) {
        role = await createRole(guild);
    }
    const member: GuildMember = await guild.members.fetch(user.id);

    return new Promise<void>((resolve, reject) => {
        getAccount(user.id)
            .then(async (player: PlayerInt): Promise<void> => {
                if (player.balance >= 100000 && !member.roles.cache.has(role.id)) {
                    try {
                        await member.roles.add(role);
                        channel.send({ embeds: [
                            new MessageEmbed()
                                .setTitle(`🎊 ${user.username} has reached $100,000! 🎊`)
                                .setColor(0x2ECC71)
                                .setDescription(`🎉 **Congratulations!**\n${user.username} are one of the *${process.env.EXCLUSIVE_ROLE_NAME}* now`)],
                        });
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                } else if (player.balance < 75000 && member.roles.cache.has(role?.id)) {
                    try {
                        await member.roles.remove(role);
                        channel.send({ embeds: [
                            new MessageEmbed()
                                .setTitle(`${user.username} has dropped below $75,000!`)
                                .setColor(0xE74C3C)
                                .setDescription(`:cry: **Oh no!**\n${user.username} are no longer one of the *${process.env.EXCLUSIVE_ROLE_NAME}*`)],
                        });
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                }
            })
            .catch(err => {
                reject(err);
            });
    });
}