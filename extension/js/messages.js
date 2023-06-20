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
/** @type (work: Work) => String */
const createMapUrl = (work) => {
  const { latitude: lat, longitude: lon } = work.endLocation;
  // return `[Google Map](https://www.google.com/maps/place/${lat},${lon}/@<${lat}>,<${lon}>,10z)`;
  // return `<a href="https://www.google.com/maps/place/${lat},${lon}/@<${lat}>,<${lon}>,10z">Google Map</a>`;
  // return `<a target="_self" href="https://www.google.com/maps/place/${lat},${lon}">Google Map</a>`;
  // return `[Google Map](https://www.google.com/maps/place/${lat},${lon})`;
  return `[Location](https://www.google.com/maps/search/?api=1&query=${lat},${lon})`;
  // return `[Google Map](https://www.google.com/maps/@${lat},${lon},13z)`;
};
/** @type (Location) => string */
const getPoint = (location) => {
  const city = location.city.replace(`${location.postalCode}, `, '');
  return `*${location.stopCode}* ${city}, ${location.country}`;
};
/** @type (string) => string */
const getDate = (dateTime) => {
  return new Date(dateTime).toLocaleString().slice(0, -3);
};
/** @type (number) => string */
const normNumber = (float) => {
  return float.toFixed(2).replace(/\./g, ',');
};

/** @type {(work: Work, type?: string) => Promise<string>} */
const createWorkMsg = async (work, type = 'new') => {
  let msg = await getTestStatus() ? '\\[TEST\]\n' : '';
  if (type === 'price') {
    msg += '🔺💰 *Price increase*\n';
  }
  msg += `🏁 ${getPoint(work.startLocation)}\n`;
  msg += `⬅️ ${getDate(work.firstPickupTime)}\n`;
  msg += `📍 ${getPoint(work.endLocation)}\n`;
  msg += `➡️ ${getDate(work.lastDeliveryTime)}\n`;
  msg += `💰 *${normNumber(work.payout.value)}* ${work.payout.unit}`;
  msg += ` - ${normNumber(work.payout.value / work.totalDistance.value)} ${work.payout.unit}/${work.totalDistance.unit}\n`;
  msg += `🚚 ${normNumber(work.totalDistance.value)} ${work.totalDistance.unit}\n`;
  msg += createMapUrl(work);
  return msg;
};
