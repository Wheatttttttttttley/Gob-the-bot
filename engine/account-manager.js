const { MessageEmbed } = require('discord.js');

const playerSchema = require('../schemas/playerSchema.js');

class AccountManager {
    constructor() {
        // do nothing
    }

    createAccount(id) {
        return new Promise((resolve, reject) => {
            playerSchema.create({ _id: id, balance: 1000 })
                .then(() => {
                    resolve();
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    getAccount(id) {
        return new Promise((resolve, reject) => {
            playerSchema.findOne({ _id: id })
                .then(player => {
                    if (player) {
                        resolve(player);
                    } else {
                        this.createAccount(id)
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

    addBalance(id, amount) {
        return new Promise((resolve, reject) => {
            try {
                playerSchema.findOneAndUpdate({ _id: id }, { $inc: { balance: amount } })
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

    createRole(guild) {
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

    async updateRole(channel, user) {
        const guild = channel.guild;
        let role = guild.roles.cache.find(r => r.name === 'Best Gambler');
        if (!role) {
            role = await this.createRole(guild);
        }
        return new Promise((resolve, reject) => {
            const member = guild.members.cache.get(user.id);
            this.getAccount(user.id)
                .then(async player => {
                    if (player.balance >= 100000 && !member.roles.cache.has(role?.id)) {
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
}

module.exports = { AccountManager: new AccountManager() };