/**
 * @typedef {{
 *   id: number,
 *   first_name: string,
 *   last_name: string,
 *   username: string,
 *   language_code: string,
 * }} User
 * @property {number} id
 * @property {string} first_name
 * @property {string} [last_name]
 * @property {string} [username]
 * @property {string} [language_code]
 */

/**
 * @typedef {{
 *   id: number,
 *   type: string,
 *   title: string,
 *   username: string,
 *   first_name: string,
 *   last_name: string,
 * }} Chat
 * @property {number} id
 * @property {string} type
 * @property {string} [title]
 * @property {string} [username]
 * @property {string} [first_name]
 * @property {string} [last_name]
 */

/**
 * @typedef {{
 *    message_id: number,
 *    from: User,
 *    chat: Chat,
 *    date: number,
 *    [key]: string,
 * }} BotMessage
 * @property {number} message_id
 * @property {User} from
 * @property {Chat} chat
 * @property {number} date
 * @property {string} [text]
 */

/**
 * @typedef {{
 *   longitude: number,
 *   latitude: number,
 * }} Location
 * @property {number} longitude - The longitude of the location
 * @property {number} latitude - The latitude of the location
 */

/**
 * @typedef {BotMessage & { location: Location }} LocationMessage
 * @extends BotMessage
 * @property {Location} location - Location data, if any
 */

/**
 * @typedef {{
 *    id: string,
 *    from: User,
 *    message: BotMessage & {
 *       text: string,
 *       reply_markup: {
 *          inline_keyboard: [any],
 *       },
 *    },
 *    chat_instance: string,
 * }}  CallbackQueryData
 */


/**
 * Callback for callback_query events.
 *
 * @callback OnCallbackQueryCallback
 * @param {CallbackQueryData} queryData - Telegram Message object that contains information about the incoming message.
 * @returns {Promise<void>}
 */
