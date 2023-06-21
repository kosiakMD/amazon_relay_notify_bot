import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { getForecast, getForecastAtTime, getWeather } from './weather.modue.js';
import { deserialize } from './utils.js';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;


// Create a new bot instance
const bot = new TelegramBot(token, { polling: true });

async function handleCommand(command, msg) {
  switch (command) {
    case 'chatid':
      await bot.sendMessage(msg.chat.id, `Current chat ID is: ${msg.chat.id}`);
      break;
    case 'userid':
      // send back telegram user id who sent message
      await bot.sendMessage(msg.chat.id, `Your ID is: ${msg.from.id}`);
      break;
    default:
      await bot.sendMessage(msg.chat.id, 'Unknown command.');
  }
}

async function handleCallbackQuery(chatId, stringData, message_id) {
  const data = deserialize(stringData)
  const [command, ...meta] = data;
  console.log('command', command);
  console.log('meta', meta);
  // if message_id response to message
  const options = message_id ? { reply_to_message_id: message_id } : undefined;

  try {
    switch (command) {
      case 'weather': {
        const [lat, long] = meta;
        let weather = await getWeather(lat, long);
        await bot.sendMessage(chatId, weather, options);
        break;
      }
      case 'forecastAt': {
        const [time, lat, long] = meta;
        const forecast = await getForecastAtTime(time, lat, long);
        await bot.sendMessage(chatId, forecast, options);
        break;
      }
      case 'forecast24': {
        const [lat, long] = meta;
        const forecast = await getForecast(lat, long);
        await bot.sendMessage(chatId, forecast, options);
        break;
      }
      default: {
        await bot.sendMessage(chatId, 'Unknown command.', options);
        break;
      }
    }
  } catch (error) {
    // console.error('handleCallbackQuery error', error);
    console.error('handleCallbackQuery error', error.code, error.message);
    await bot.sendMessage(chatId, 'Error: ' + error.message, options);
  }
}

bot.on('callback_query', async (callbackQuery) => {
  const { message, data } = callbackQuery;
  console.log('callbackQuery data', data);
  const { chat: { id: chat_id }, message_id } = message;

  await handleCallbackQuery(chat_id, data, message_id);
});

// Listen for any messages and log them
bot.on('message', async (msg) => {
  console.log('msg.chat', msg.chat);
  const botId = (await bot.getMe()).id;

  // handle callback_data CallbackQuery
  // and handle as others
  if (msg.callback_query) {
    console.log('msg.callback_query', msg.callback_query);
    await handleCommand('weather', msg.callback_query.data);
  }

  if (msg.new_chat_member && msg.new_chat_member.id === botId) {
    console.log('Bot added to chat:', msg.chat.id);
  } else if (msg.new_chat_members) {
    msg.new_chat_members.forEach((member) => {
      if (member.id === botId) {
        console.log('Bot added to chat:', msg.chat.id);
      }
    });
  } else if (msg.left_chat_member && msg.left_chat_member.id === botId) {
    console.log('Bot removed from chat:', msg.chat.id);
  }

  // Check if the message text starts with "/echo"
  if (msg.text) {
    const match = msg.text.match(/\/(\w+)(@\w+)?/);
    if (match) {
      console.log('message', msg);
      const command = match[1];
      console.log('Command:', command);
      await handleCommand(command, msg);
    }
  }
});

// Log any errors
bot.on('polling_error', (error) => {
  console.log(error);
});

