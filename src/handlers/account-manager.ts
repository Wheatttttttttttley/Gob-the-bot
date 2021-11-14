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

function createRole(guild: Guild): Promise<Role> {
    return new Promise((resolve, reject) => {
        try {
            resolve(
                guild.roles.create({
                    name: 'Best Gambler',
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
    const guild = channel.guild;
    const role: Role = guild.roles.cache.find(r => r.name === 'Best Gambler') || await createRole(guild);
    const member: GuildMember = await guild.members.fetch(user.id);

    return new Promise<void>((resolve, reject) => {
        getAccount(user.id)
            .then(async (player: PlayerInt): Promise<void> => {
                if (player.balance >= 100000 && !member.roles.cache.has(role.id)) {
                    try {
                        await member.roles.add(role);
                        channel.send({ embeds: [
                            new MessageEmbed()
                                .setTitle(`${user.username} has reached $100,000!`)
                                .setColor(0x2ECC71)
                                .setDescription(`:tada: **Congratulations!**\n${user.username} are one of the *Best Gambler* now`)],
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
                                .setDescription(`:cry: **Oh no!**\n${user.username} are no longer one of the *Best Gambler*`)],
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