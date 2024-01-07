/**
 * @typedef {{
 *  unit: string,
 *  value: number,
 * }} Asset
 */
/**
 * @typedef {{
 *   label: string,
 *   city: string,
 *   state: string,
 *   country: string,
 *   postalCode: string,
 *   stopCode: string,
 *   latitude: string,
 *   longitude: string,
 * }} Location
 * */
/**
 * @typedef {{
 *   id: string,
 *   firstPickupTime: string,
 *   endLocation: Location,
 *   startLocation: Location,
 *   lastDeliveryTime: string,
 *   payout: Asset,
 *   totalDistance: Asset,
 * }} Work
 * */

// https://api.telegram.org/bot$%7BtelegramBotToken%7D/sendMessage?chat_id=${chatId}&text=Check%20out%20this%20location!&parse_mode=HTML&disable_web_page_preview=true&latitude=${latitude}&longitude=${longitude}
// https://api.telegram.org/bot$%7BtelegramBotToken%7D/sendMessage?chat_id=${chatId}&text=Check%20out%20this%20location!&parse_mode=HTML&disable_web_page_preview=true&latitude=42.430903&longitude=14.194901
// latitude longitude
// latitude // 42.430903
// longitude // 14.194901
// https://www.google.pl/maps/@<lat>,<lon>,<zoom>z
// https://www.google.com/maps/place/42.430903,14.194901/@<42.430903>,<14.194901>,10z
/** @type {(work: Work) => string} */
const createMapUrl = (work) => {
  const { latitude: lat, longitude: lon } = work.endLocation;
  // return `[Google Map](https://www.google.com/maps/place/${lat},${lon}/@<${lat}>,<${lon}>,10z)`;
  // return `<a href="https://www.google.com/maps/place/${lat},${lon}/@<${lat}>,<${lon}>,10z">Google Map</a>`;
  // return `<a target="_self" href="https://www.google.com/maps/place/${lat},${lon}">Google Map</a>`;
  // return `[Google Map](https://www.google.com/maps/place/${lat},${lon})`;
  return `<a href="https://www.google.com/maps/search/?api=1&query=${lat},${lon}">🗺️ Location</a>`;
  // return `[Google Map](https://www.google.com/maps/@${lat},${lon},13z)`;
};
/** @param {Location} location - The location to format.
 * @returns {string} - The formatted location.*/
const getPoint = (location) => {
  const city = location.city.replace(`${location.postalCode}, `, '');
  return `<b>${location.stopCode}</b> ${city} ${euCountries[location.country.toUpperCase()]}`;
};

/** @type {(float: number) => string} */
const normNumber = (float) => {
  return float.toFixed(2).replace(/\./g, ',');
};

/** @type {(work: Work, timemark: string, location: string, type?: string) => Promise<string>} */
const createWorkMsg = async (work, timemark, location, type = 'new') => {
  let msg = await getTestStatus() ? '\[TEST\]\n' : '';
  if (type === 'price') {
    msg += '🔺💰 <b><u>Price increase</u></b>\n';
  }
  msg += `📍 ${getPoint(work.startLocation)}\n`;
  msg += `🚚 \t\t\t\t<code>${getDateTime(work.firstPickupTime, false, true)}</code>\n`;
  msg += `🏁 ${getPoint(work.endLocation)}\n`;
  msg += `➡️ \t\t\t\t<code>${getDateTime(work.lastDeliveryTime, false, true)}</code>\n`;
  msg += `💰 <b>${normNumber(work.payout.value)}</b> ${work.payout.unit}`;
  msg += ` - ${normNumber(work.payout.value / work.totalDistance.value)} ${work.payout.unit}/${work.totalDistance.unit}\n`;
  msg += `🛣 ${normNumber(work.totalDistance.value)} ${work.totalDistance.unit}\n`;
  msg += `<blockquote>🔎 ${location}\n`;
  msg += `⏰ Message sent: ${timemark}</blockquote>\n`;
  msg += createMapUrl(work);
  return msg;
};
