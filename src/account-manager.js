const { MessageEmbed } = require('discord.js');

const playerSchema = require('../schemas/playerSchema.js');

class AccountManager {
    constructor() {
        // do nothing
    }

    async createAccount(id) {
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

    async getAccount(id) {
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

    async updateBalance(id, amount) {
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

    async updateRole(channel, user) {
        return new Promise((resolve, reject) => {
            const guild = channel.guild;
            const role = guild.roles.cache.find(r => r.name === 'Best Gambler');
            // if guild doesn't have the role, create it
            if (!role) {
                try {
                    guild.roles.create({
                        name: 'Best Gambler',
                        color: 0x3498DB,
                        permissions: [],
                    });
                } catch (err) {
                    reject(err);
                }
            }

            const member = guild.members.cache.get(user.id);
            this.getAccount(user.id)
                .then(async player => {
                    if (player.balance >= 100000 && !member.roles.cache.has(role.id)) {
                        try {
                            await member.roles.add(role);
                            const roleEmbed = new MessageEmbed()
                                .setTitle(`${user.username} has reached $100,000!`)
                                .setColor(0x2ECC71)
                                .setDescription(`:tada: **Congratulations!**\n${user.username} are one of the *Best Gambler* now`);
                            channel.send({ embeds: [roleEmbed] });
                        } catch (err) {
                            reject(err);
                        } finally {
                            resolve();
                        }
                    } else if (player.balance < 75000 && member.roles.cache.has(role.id)) {
                        try {
                            await member.roles.remove(role);
                            const roleEmbed = new MessageEmbed()
                                .setTitle(`${user.username} has dropped below $75,000!`)
                                .setColor(0xE74C3C)
                                .setDescription(`:cry: **Oh no!**\n${user.username} are no longer one of the *Best Gambler*`);
                            channel.send({ embeds: [roleEmbed] });
                        } catch (err) {
                            reject(err);
                        } finally {
                            resolve();
                        }
                    }
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    async getBalance(user) {
        return new Promise((resolve, reject) => {
            playerSchema.findOne({ _id: user.id })
                .then(async player => {
                    if (!player) {
                        try {
                            await this.createAccount(user.id);
                        } catch (err) {
                        // reject if can't find the user but can't create the account
                            reject(err);
                        } finally {
                            // try again
                            await this.getBalance(user)
                                .then(resolve)
                                .catch(reject);
                        }
                    } else {
                        resolve(player.balance);
                    }
                });
        });
    }
}

module.exports = { AccountManager: new AccountManager() };