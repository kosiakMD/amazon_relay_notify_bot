import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

const token = process.env.RELAY_BOT_TOKEN;

// Create a new bot instance
export const relayBot = new TelegramBot(token, { polling: true });
