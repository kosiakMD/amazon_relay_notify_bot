/**
 * Callback for location events.
 *
 * @callback onLocationCallback
 * @param {LocationMessage} msg - Telegram Message object that contains information about the incoming message.
 * @returns {Promise<void>}
 */

import { weatherBot } from '../weatherBot.js';
import { getForecast, getWeather } from '../../../modules/weather.modue.js';
import { chatSessions } from '../../../session.js';
import { contextEnum, onEnum } from '../../../enum.js';

const logContext = `bot.on(${onEnum.location})`;

/** @type {onLocationCallback} */
const onLocationCallback = async (msg) => {
  console.log('onLocationCallback msg', msg);
  const chatId = msg.chat.id;

  if (!chatId) {
    console.warn(logContext, 'No chat id on');
    return;
  }

  const message_id = msg.chat.message_id;
  const options = message_id ? { reply_to_message_id: message_id } : undefined;

  const context = chatSessions[chatId]?.context;
  if (!context) {
    const error = `No context for "${onEnum.location}"`;
    console.warn(logContext, error + ' from chat ${chatId}');
    await weatherBot.sendMessage(chatId, error, options);
    return;
  }

  switch (context) {
    case contextEnum.forecast: {
      const latitude = msg.location.latitude;
      const longitude = msg.location.longitude;

      let weather = await getForecast(latitude, longitude, 2);
      try {
        await weatherBot.sendMessage(chatId, weather, options);
        chatSessions[chatId] = {};
      } catch (e) {
        console.error(e);
        await weatherBot.sendMessage(chatId, 'Sorry, I couldn\'t fetch the weather for your location.');
      } finally {
        chatSessions[chatId] = {};
      }
      break;
    }
    case contextEnum.weather: {
      const latitude = msg.location.latitude;
      const longitude = msg.location.longitude;
      try {
      // Now you have the user's location (latitude and longitude), you can use it to fetch the weather.
      const weather = await getWeather(latitude, longitude);
        await weatherBot.sendMessage(chatId, weather);
        // Once we've responded, clear the context for this chat
        chatSessions[chatId] = {};
      } catch(error) {
        console.error(error.message);
        await weatherBot.sendMessage(chatId, 'Sorry, I couldn\'t fetch the weather for your location.');
        // If there was an error, also clear the context
        chatSessions[chatId] = {};
      }
      break;
    }
    default: {
      await weatherBot.sendMessage(chatId, 'Unknown command.', options);
      break;
    }
  }
};

onLocationCallback.context = onEnum.location;

export { onLocationCallback };
