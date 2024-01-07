import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

const token = process.env.WEATHER_BOT_TOKEN;

// Create a new bot instance
export const weatherBot = new TelegramBot(token, { polling: true });
