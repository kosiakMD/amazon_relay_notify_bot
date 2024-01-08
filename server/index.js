import { startServer } from './server.js';
import { weatherBot } from './bots/weather/weatherBot.js';
import { callbackQuery, onLocationCallback } from './bots/weather/on/index.js';
import { onEnum } from './enum.js';
import { handleCommand } from './commands.js';
import { relayBot } from './bots/relay/relayBot.js';


// for Heroku - it stops script if port is not bound
startServer();

/**
 * @template T
 * @callback ListenerHandler
 * @param {T} listener
 * @param {string} event
 * // @return {(data: t) => Promise<void>}
 * @return {T}
 * */
/** @type ListenerHandler */
const listenerHandler = (listener, event) => {
  return async (data) => {
    try {
      return await listener(data);
    } catch (e) {
      await weatherBot.sendMessage(data.chat.id || data.message.chat.id, `Bot error on ${event} handler`);
    }
  };
};
const relayListenerHandler = (listener, event) => {
  return async (data) => {
    // console.log('relayListenerHandler data', data);
    const bot2Username = 'Amazon_Relay_Test_Bot';
    try {
      return await listener(data);
    } catch (e) {
      // console.log('error code', e.code);
      // console.log('error message', e.message);
      console.log('error json', e.toJSON());
      if (e.message === 'ETELEGRAM: 400 Bad Request: chat not found'
        || e.message === 'ETELEGRAM: 403 Forbidden: bot was kicked from the group chat'
        || e.message === 'ETELEGRAM: 403 Forbidden: bot is not a member of the supergroup chat'
        || e.message === 'ETELEGRAM: 403 Forbidden: bot was blocked by the user'
        || e.message === 'ETELEGRAM: 403 Forbidden: bot is not a member of the channel chat'
        || e.message === 'ETELEGRAM: 403 Forbidden: bot was kicked from the supergroup chat'
    ) {
        const weatherBotName = (await weatherBot.getMe()).username;
        console.log(`Bot ${weatherBotName} is not a member of the group chat`);
        // You can use the `switch_inline_query` field of the InlineKeyboardButton
        // to send an inline query to bot2 when the button is pressed.
        // You'll need to handle this query in bot2 code
        const opts = {
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [
                {
                  text: `Add @${weatherBotName}`,
                  url: `https://t.me/${weatherBotName}`,
                },
              ],
            ],
          }),
        };
        await relayBot.sendMessage(data.chat?.id || data.message.chat.id, `Please add @${weatherBotName} to this group for weather updates.`, opts);
      } else {
        await relayBot.sendMessage(data.chat?.id || data.message.chat.id, `Bot error on ${event} handler`);
      }
    }
  };
};

const onCallbackQuery = listenerHandler(callbackQuery, onEnum.callback_query);
const onRelayCallbackQuery = relayListenerHandler(callbackQuery, onEnum.callback_query);

weatherBot.on(onEnum.callback_query, onCallbackQuery);
relayBot.on(onEnum.callback_query, onRelayCallbackQuery);

// Listen for any messages and log them
weatherBot.on('message', async (msg) => {
  console.log('on(message)', 'msg', msg);
  // console.log('on(message)', 'msg.chat', msg.chat);
  const botId = (await weatherBot.getMe()).id;

  // handle callback_data CallbackQuery
  // and handle as others
  // if (msg.callback_query) {
  //   console.log('msg.callback_query', msg.callback_query);
  //   await handleCommand('weather', msg.callback_query.data);
  // }

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
      await handleCommand(command, msg.chat, msg.from);
    }
  }
});

// Log any errors
weatherBot.on('polling_error', (error) => {
  console.log(error.message);
});

const onLocation = listenerHandler(onLocationCallback, onEnum.location);

weatherBot.on(onEnum.location, onLocation);

process.on('SIGINT', async () => {
  console.log('Shutting down bot...');
  try {
    await relayBot.stopPolling();
    console.log('Bot has stopped polling');
    process.exit(0);
  } catch (e) {
    console.log('Error while shutting down bot');
    console.error(e);
    process.exit(1);
  }
});
