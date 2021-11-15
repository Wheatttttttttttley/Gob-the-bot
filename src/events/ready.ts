import { client } from '../index';

export default {
    name: 'ready',
    once: true,
    run: async () => {
        console.log(`Ready! Logged in as ${client.user?.tag}!`);
        client.user?.setActivity('you crying inside', { type : 'WATCHING' });
    },
};