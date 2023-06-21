const TelegramBot = require('node-telegram-bot-api');

require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;

// Create a new bot instance
const bot = new TelegramBot(token, {polling: true});

function handleCommand(command, msg) {
  switch (command) {
    case 'chatid':
      bot.sendMessage(msg.chat.id, `Current chat ID is: ${msg.chat.id}`);
      break;
    case 'userid':
      // send back telegram user id who sent message
      bot.sendMessage(msg.chat.id, `Your ID is: ${msg.from.id}`);
      break;
    //
    default:
      bot.sendMessage(msg.chat.id, 'Unknown command.');
  }
}

// Listen for any messages and log them
bot.on('message', async (msg) => {
  console.log('msg.chat', msg.chat);
  const botId = (await bot.getMe()).id;

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
      handleCommand(command, msg);
    }
  }
});

// Log any errors
bot.on('polling_error', (error) => {
  console.log(error);
});

