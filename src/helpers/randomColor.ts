import { ColorResolvable } from 'discord.js';

export const randomColor = () => `0x${Math.floor(Math.random() * 16777215).toString(16)}` as ColorResolvable;