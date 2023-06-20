console.log('bot.js');

const BartaChat = '-697279153';
const MyTestChat = '-900942200';

const bot_id = '6094248667:AAGEhf8xut4pzdKIMgMAamz4SzsJ9ZdQ910';
const telegram_bot = `bot${bot_id}`;
const chat_id = BartaChat; // Barta
// const chat_id = '-1001975833181'; // Others
// const chat_3_id = '-956188278'; // Others
const test_chat_id = MyTestChat; // TEST
// const test_chat_id = '-1001975833181';
// const test_chat_id = '1232761014';

/**
 * @define {
 *
 * } Response
 */

/** @type {() => Promise<any>} */
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

/**
 * @typedef {{
 *   text: string;
 *   reply_markup?: {
 *     inline_keyboard: {
 *       text: string;
 *       callback_data: string;
 *     }[][];
 *   }
 * }} Message
 * */

/**
 * @typedef {(data: Message, geo?: any) => Promise<Response>} SendMsg
 */
async function sendMsg(data, geo) {
  const id = 'sendMsg - ' + Math.random().toString(36).substr(2, 9);
  logger.openGroup(id);
  logger.log(id, 'sendMsg');
  const url = 'https://api.telegram.org/' + telegram_bot + '/sendMessage';
  logger.log(id, 'url', url);
  const botData = {
    ...data,
    chat_id: await getTestStatus() ? test_chat_id : chat_id,
    disable_web_page_preview: true,
    parse_mode: 'Markdown',
    disable_notification: await getTestStatus(),
    // 'user_id: '',
    // disable_web_page_preview: false,
    // "parse_mode" : "MarkdownV2"
    // "parse_mode" : "HTML",
    // latitude: data.latitude,
    // longitude: data.longitude,
  };
  logger.log(id, 'botData', botData);
  logger.closeGroup(id);
  // return
  return postData(url, botData);
}

const bot = {
  // sendMsg,
  log: sendMsg,
};
