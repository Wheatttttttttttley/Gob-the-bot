import { client } from '../index';

export default {
    name: 'ready',
    once: true,
    run: async () => {
        client.user?.setActivity('you crying', { type : 'WATCHING' });
    },
};