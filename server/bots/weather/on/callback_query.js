import { deserialize } from '../../../utils.js';
import {
  getForecast,
  getForecastAtTime,
  getWeather,
} from '../../../modules/weather.modue.js';
import { weatherBot } from '../weatherBot.js';
import { handleCommand } from '../../../commands.js';
import { chatSessions } from '../../../session.js';

const logContext = 'bot.on(callback_query)';

/** @type OnCallbackQueryCallback */
export const callbackQuery = async (queryData) => {
  console.log(logContext, queryData);
  const { message: msg, message: { chat: { id: chatId }, message_id }, data: rawData } = queryData;
  console.log('msg', msg);

  if (!chatId) {
    console.warn(logContext, 'No chat id on');
    return;
  }

  // if message_id response to message
  const options = message_id ? { reply_to_message_id: message_id } : undefined;

  try {
    const data = deserialize(rawData);
    const [command, ...meta] = data;
    console.log('command', command);
    console.log('meta', meta);

    switch (command.toLowerCase()) {
      case 'cancel': {
        chatSessions[chatId] = {};
        break;
      }
      case 'chatid': {
        await handleCommand('chatid', msg.chat, queryData.from);
        break;
      }
      case 'userid': {
        await handleCommand('userid', msg.chat, queryData.from);
        break;
      }
      case 'weather': {
        const [lat, long] = meta;
        if (!lat || !long) {
          // throw new Error(`Wrong/Empty params: [${meta.join(', ')}]`);
          await handleCommand(command, msg.chat, queryData.from);
        } else {
          let weather = await getWeather(lat, long);
          await weatherBot.sendMessage(chatId, weather, options);
        }
        break;
      }
      case 'forecast': {
        await handleCommand(command, msg.chat, queryData.from);
        break;
      }
      case 'forecastAt': {
        const [time, lat, long] = meta;
        if (!time || !lat || !long) {
          throw new Error(`Wrong/Empty params: [${meta.join(', ')}]`);
          // await handleCommand(command, msg);
        }
        const forecast = await getForecastAtTime(time, lat, long);
        await weatherBot.sendMessage(chatId, forecast, options);
        break;
      }
      case 'forecast24': {
        const [lat, long] = meta;
        if (!lat || !long) {
          throw new Error(`Wrong/Empty params: [${meta.join(', ')}]`);
          // await handleCommand(command, msg);
        }
        const forecast = await getForecast(lat, long);
        await weatherBot.sendMessage(chatId, forecast, options);
        break;
      }
      default: {
        await weatherBot.sendMessage(chatId, 'Unknown command.', options);
        break;
      }
    }
  } catch (error) {
    console.error('callback_query error', error);
    // console.error('handleCallbackQuery error', error.code, error.message);
    await weatherBot.sendMessage(chatId, 'Error: ' + error.message, options);
  }

};
