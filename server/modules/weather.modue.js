import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPEN_WEATHER_API_KEY;
const lang = 'uk';

export async function getForecastAtTime(time, latitude, longitude) {
  // Set the time in Unix timestamp in seconds
  const currentTime = Math.floor(new Date().getTime() / 1000);
  const specificTime = Math.floor(new Date(time).getTime() / 1000);
  // console.log('specificTime', specificTime);

  const secondsInHour = 3600;
  const hoursDifference = Math.abs(specificTime - currentTime) / secondsInHour;
  // console.log('hoursDifference', hoursDifference);
  const secondsInDay = secondsInHour * 24;
  // console.log('secondsInDay', secondsInDay);
  const daysDifference = Math.abs(specificTime - currentTime) / secondsInDay;
  // console.log('daysDifference', daysDifference);
  const days = 8;

  let url = '';
  let closest = null;
  let data = null;

  if (hoursDifference <= 48) {
    // If the specific time is within the next 2 days, use the hourly forecast.
    url = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,daily&appid=${apiKey}&units=metric&lang=${lang}`;
    data = await fetch(url);
    const jsonData = await data.json();
    // console.log('jsonData', jsonData);
    const hourlyData = jsonData.hourly;
    const closestSet = hourlyData.filter(hour => {
      // console.log('hour', hour.dt);
      // // console.log('Math.abs(hour.dt - specificTime) <= 1800', Math.abs(hour.dt - specificTime) <= 1800);
      // console.log('Math.abs(hour.dt - specificTime)', Math.abs(hour.dt - specificTime));
      // if (Math.abs(hour.dt - specificTime) <= 1800) {
        // console.log('hour', hour.dt, specificTime);
      // }
      return Math.abs(hour.dt - specificTime) <= 1800;
    }).sort();
    closest = closestSet[0];
  } else if (daysDifference <= days) {
    // If the specific time is more than 2 days but less than 16 days ahead, use the daily forecast.
    url = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly&appid=${apiKey}&units=metric&lang=${lang}`;
    data = await fetch(url);
    const jsonData = await data.json();
    // console.log('jsonData', jsonData);
    const dailyData = jsonData.daily;
    // console.log('length', dailyData.length);
    const closestSet = dailyData.filter(day => {
      // console.log('day.dt', day.dt);
      // console.log('specificTime', specificTime);
      // console.log('day.dt - specificTime', day.dt - specificTime);
      // console.log('Math.abs(day.dt - specificTime)', Math.abs(day.dt - specificTime));
      // console.log('day.dt - specificTime <= secondsInDay', Math.abs(day.dt - specificTime) <= secondsInDay);
      return Math.abs(day.dt - specificTime) <= secondsInDay;
    }).sort();
    // console.log('closestSet', closestSet);
    closest = closestSet[0];
  } else {
    // If the specific time is more than 16 days ahead, return a message stating that the time is too far in the future.
    return `The specified time is too far in the future. Please specify a time less than ${days} days from now.`;
  }

  if (closest) {
    const date = new Date(time);
    const options = {
      timeZone: 'Europe/Warsaw',
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      weekday: 'short',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    };
    let msg = '';
    msg += `Погода: ${date.toLocaleString('uk-UA', options)}\n`;
    msg += `${closest.weather[0].description}, ${closest.temp.day || closest.temp}°C\n`;
    msg += `відчувається як ${closest.feels_like.day || closest.feels_like}°C\n`;
    msg += `вологість ${closest.humidity}%, вітер ${closest.wind_speed} m/s`;
    return msg;
  } else {
    return 'No data available for the specific time';
  }
}

/**
 * @param {string | number} latitude
 * @param {string | number} longitude
 * @param {number} [everyHours=3]
 * @return {Promise<string|undefined>}
 */
export async function getForecast(latitude, longitude, everyHours = 3) {
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=current,minutely,daily&appid=${apiKey}&units=metric&lang=${lang}`;
  const response = await fetch(url);
  const data = await response.json();

  // console.log('getForecast data', data);

  if (data && data.hourly) {
    const currentTime = Math.floor(Date.now() / 1000); // Get current Unix timestamp in seconds
    // const oneDayAhead = currentTime + (24 * 60 * 60); // Unix timestamp for 24 hours from now
    // filter by each 3 hours
    const filteredData = data.hourly.slice(0, 24).filter((entry, index) => {
      return index % everyHours === 0;
    });
    // console.log('filteredData', filteredData);
    let message = `Timezone: ${data.timezone}\n`;
    filteredData.forEach(entry => {
      // console.log('entry', entry);
      // Convert Unix timestamp to a Date object
      const date = new Date(entry.dt * 1000);
      // console.log('date', date);
      // Format the date to a readable string
      const hours = date.getHours();
      // console.log('hours', hours);
      const minutes = '0' + date.getMinutes();
      // console.log('minutes', minutes);
      const formattedTime = hours + ':' + minutes.substr(-2);
      // console.log('formattedTime', formattedTime);
      // console.log('entry.weather', entry.weather);
      message += `*${formattedTime}* ${entry.temp}°C\n${entry.weather[0].description}, ${entry.wind_speed}m/s, ${entry.humidity}%\n`;
      // return {
      //   time: hour.dt,
      //   temp: hour.temp,
      //   weather: hour.weather[0].description,
      //   wind: hour.wind_speed,
      // };
    });
    // console.log('message', message);
    return message;
  } else {
    throw new Error('Could not get forecast data.');
  }
}

// get current weather
/**
 * @param {string | number} latitude
 * @param {string | number} longitude
 * @return {Promise<string|undefined>}
 */
export async function getWeather(latitude, longitude) {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=${lang}`);
  const data = await response.json();

  // console.log('getWeather data', data);

  if (data && data.main) {
    let msg = `Погода: ${data.weather[0].description}, ${data.main.temp}°C\n`;
    msg += `відчувається як ${data.main.feels_like}°C\n`;
    msg += `вологість ${data.main.humidity}%\n`;
    msg += `вітер ${data.wind.speed} m/s`;
    return msg;
  } else {
    throw new Error('Could not get weather data.');
  }
}

const callbackQuery = {
  id: '417919729308445428',
  from: {
    id: 97304519,
    is_bot: false,
    first_name: 'Антон',
    username: 'KosiakMD',
    language_code: 'uk',
    is_premium: true,
  },
  message: {
    message_id: 24264,
    from: {
      id: 6094248667,
      is_bot: true,
      first_name: 'relay',
      username: 'Amazon_Relay_Bot',
    },
    chat: {
      id: -900942200,
      title: 'AmazonRelay TEST',
      type: 'group',
      all_members_are_administrators: true,
    },
    date: 1687305148,
    text: '[TEST]\n' +
      '🏁 CDG8 TAVERNY, FR\n' +
      '⬅️ 21/06/2023, 05:00\n' +
      '📍 DIF5 OSNY, FR\n' +
      '➡️ 21/06/2023, 07:45\n' +
      '💰 175,99 EUR - 12,26 EUR/km\n' +
      '🚚 14,36 km\n' +
      'Location',
    entities: [[Object], [Object], [Object], [Object]],
    reply_markup: { inline_keyboard: [Array] },
  },
  chat_instance: '-1908544964133071254',
  data: '{"location":{"latitude":49.0540599,"longitude":2.0463599}}',
};
