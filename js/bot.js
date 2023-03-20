console.log('bot.js');

const bot_id = '6094248667:AAGEhf8xut4pzdKIMgMAamz4SzsJ9ZdQ910';
const telegram_bot = `bot${bot_id}`;
const chat_id = '-697279153';
const test_chat_id = '-900942200';

const postData = async (url = '', data, options) => {
  // Default options are marked with *
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json', 'cache-control': 'no-cache',
      },
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data), // body data type must match "Content-Type" header
      ...options,
    });
    // console.log(response);
    const result = await response.json();
    // console.log(result);
    // check for error response
    if (!response.ok) {
      const error = (result && result.description) || response.status;
      const err = new Error(error);
      console.error(err);
      throw result;
    }
    return result; // parses JSON response into native JavaScript objects
  } catch (e) {
    // console.log(e);
    console.error(e);
    throw e;
  }
};

function sendMsg(data = '_', chatId, testMode = false, geo) {
  const url = 'https://api.telegram.org/' + telegram_bot + '/sendMessage';
  const botData = {
    ...data,
    chat_id: testMode ? test_chat_id : chatId,
    disable_web_page_preview: true,
    parse_mode: 'Markdown',
    disable_notification: testMode,
    // 'user_id: '',
    // disable_web_page_preview: false,
    // "parse_mode" : "MarkdownV2"
    // "parse_mode" : "HTML",
    // latitude: data.latitude,
    // longitude: data.longitude,

  };
  console.log(botData);
  // return
  return postData(url, botData);
}


function log(data = '_', testMode, geo) {
  return sendMsg(data, chat_id, testMode, geo);
}

const bot = {
  sendMsg,
  log,
};
