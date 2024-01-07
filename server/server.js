import http from 'http';
import fs from 'fs';
import ical from 'ical-generator';

const port = process.env.PORT || 3000;  // Use the port that Heroku provides or fall back to 3000

const getDateTime = (dateTime, withSeconds = false, convertToCET) => {
  let date = new Date(dateTime);
  // Convert to Central European Time (Poland)
  if (convertToCET) {
    date = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' }));
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() returns 0-11
  const year = date.getFullYear().toString().slice(-2);

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${day}.${month}.${year} ${hours}:${minutes}${withSeconds ? `:${seconds}` : ''}`;
};

export const startServer = () => {
  const server = http.createServer(function (req, res) {

    // fs.readFile('index.html', function (err, data) {
    //   if (err) {
    //     res.writeHead(404);
    //     res.end(JSON.stringify(err));
    //     return;
    //   }
    //   res.writeHead(200);
    //   res.end(data);
    // });
  });

  server.on('listening', function () {
    console.log(`ok, server is running at http://127.0.0.1:${port}`);
  });

  server.on('request', function (req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // Check if the request is for generating an .ics file
    if (url.pathname === '/generate-ics') {
      const startTime = url.searchParams.get('startTime');
      console.log('startTime', startTime);
      const endTime = url.searchParams.get('endTime');
      console.log('endTime', endTime);
      const startCity = url.searchParams.get('startCity');
      console.log('startCity', startCity);
      const startPostal = url.searchParams.get('startPostal');
      console.log('startPostal', startPostal);
      const startCountry = url.searchParams.get('startCountry');
      console.log('startCountry', startCountry);
      const endCity = url.searchParams.get('endCity');
      console.log('endCity', endCity);
      const endPostal = url.searchParams.get('endPostal');
      console.log('endPostal', endPostal);
      const endCountry = url.searchParams.get('endCountry');
      console.log('endCountry', endCountry);
      const lat = url.searchParams.get('lat');  // Latitude parameter
      console.log('lat', lat);
      const lon = url.searchParams.get('lon');  // Longitude parameter
      console.log('lon', lon);

      if (startTime && endTime) {
        const startDate = new Date(startTime);
        const endDate = new Date(endTime);

        const calendar = ical({
          domain: 'amazon-relay-bot-9cd969281a98.herokuapp.com', name: 'Amazon Calendar'
        });
        const startLocation = `${startCity.replace(`${startPostal}, `, '')}, ${startCountry}`;
        const endLocation = `${endCity.replace(`${endPostal}, `, '')}, ${endCountry}`;
        const startDateTime = getDateTime(startDate, true, true);
        const endDateTime = getDateTime(endDate, true, true);
        calendar.createEvent({
          start: new Date(startDate).toLocaleString('en-US', { timeZone: 'Europe/Warsaw' }),
          end: new Date(endDate).toLocaleString('en-US', { timeZone: 'Europe/Warsaw' }),
          summary: `${startLocation} - ${endLocation}`,
          description:
              `📍 ${startLocation}`+ `   🚚 ${startDateTime}\n`+
              `🏁 ${endLocation}`+ `   ➡️ ${endDateTime}\n`+
              `🗺️ Location: https://www.google.com/maps/search/?api=1&query=${lat},${lon}`,
          location: `${startCity}, ${startCountry}`,
        });

        // Add geo-location if latitude and longitude are provided
        // if (lat && lon) {
        //   event.geo({lat: parseFloat(lat), lon: parseFloat(lon)});
        // }

        res.writeHead(200, {'Content-Type': 'text/calendar'});
        res.end(calendar.toString());
        return;
      } else {
        res.writeHead(400);
        res.end('Missing start or end date parameters');
        return;
      }
    }
    fs.readFile('index.html', function (err, data) {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      res.writeHead(200);
      res.end(data);
    });
  });

  server.listen(port);
}

