import { weatherBot } from './bots/weather/weatherBot.js';
import { chatSessions } from './session.js';
import { contextEnum } from './enum.js';

const requestLocation = (chatId) => weatherBot.sendMessage(chatId, 'Please share your location', {
  reply_markup: {
    // inline_keyboard: [[
    keyboard: [[
      {
        text: 'Share Location',
        request_location: true,
      },
      {
        text: 'Cancel',
        // callback_data: 'cancel',
      },
    ]],
    one_time_keyboard: true,
    resize_keyboard: true,
  },
});

export async function handleCommand(command, chat, from) {
  const chatId = chat.id;
  const chatType = chat.type;

  switch (command) {
    case 'start': {
      const groupCommands = [[{ text: 'Chat id', callback_data: 'chatid' },
        { text: 'User id', callback_data: 'userid' }]];
      const privateCommands = [groupCommands, [{
        text: 'Weather',
        callback_data: 'weather',
      }, { text: 'Forecast', callback_data: 'forecast' }]];
      const opts = {
        reply_markup: JSON.stringify({
          inline_keyboard: chatType === 'private' ? privateCommands : groupCommands,
          // keyboard: [
          //   [{text: 'forecast'}, {text: 'weather'}],
          //   [{text: 'chatid'}, {text: 'userid'}],
          // ],
          // resize_keyboard: true,
        }),
      };

      await weatherBot.sendMessage(chatId, 'Commands', opts);
      break;
    }
    case 'chatid':
      await weatherBot.sendMessage(chatId, `Current chat ID is: ${chatId}`);
      break;
    case 'userid':
      // send back telegram user id who sent message
      await weatherBot.sendMessage(chatId, `Your ID is: ${from.id}`);
      break;
    case 'forecast': {
      if (chatType !== 'private') {
        await weatherBot.sendMessage(chatId, 'Forecast is available only in private chat.');
        break;
      }
      // Set the context for this chat to 'forecast'
      chatSessions[chatId] = { context: contextEnum.forecast };
      await requestLocation(chatId);
      break;
    }
    case 'weather': {
      if (chatType !== 'private') {
        await weatherBot.sendMessage(chatId, 'Forecast is available only in private chat.');
        break;
      }
      // Set the context for this chat to 'weather'
      chatSessions[chatId] = { context: contextEnum.weather };
      await requestLocation(chatId);
      break;
    }

    default:
      await weatherBot.sendMessage(chatId, 'Unknown command.');
  }
}

// start - get Menu of features
// chatid - get this chat ID
// userid - get your ID
// forecast - get Forecast for you location
// weather - get Weather for you location
