console.log('bot.js');

// # original relay bot
const prod_bot = '6094248667:AAGEhf8xut4pzdKIMgMAamz4SzsJ9ZdQ910';
// # Test relay bot
const test_bot = '6056341149:AAGxOP260405RqdR27pLx4yscj1wPTDTXec';
const telegram_bot = `bot${prod_bot}`;

const BartaMalyjChat = '-697279153'; // 697279153 697279153
const BartaChat = '-1002070356376'; // '-4018989927'; //
const Others1 = '-956188278';
const Others2 = '-1001975833181';
// const MyTestChat1 = '-900942200';
const MyTestChat2 = '-1001887870285';

const chat_id = BartaChat;
const test_chat_id = MyTestChat2; // TEST
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
  logger.log(id, 'chat_id', await getTestStatus() ? test_chat_id : chat_id);
  const url = 'https://api.telegram.org/' + telegram_bot + '/sendMessage';
  logger.log(id, 'url', url);
  const botData = {
    ...data,
    chat_id: await getTestStatus() ? test_chat_id : chat_id,
    disable_web_page_preview: true,
    // parse_mode: 'Markdown',
    // disable_notification: await getTestStatus(),
    // 'user_id: '',
    // disable_web_page_preview: false,
    // "parse_mode" : "MarkdownV2"
    "parse_mode" : "HTML",
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
  createPromisedLog: async (data, geo) => sendMsg(data, geo)
};
