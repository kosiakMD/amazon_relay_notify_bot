// import { MessageTypeEnum, StatusEnum } from './common.js';
// import { bot } from './bot.js';

// importScripts('./common.js', './bot.js', './inject.js');
importScripts('./common.js', './bot.js');

this.console.log = console.log.bind(this, '____BG');

if ('serviceWorker' in navigator) {
  console.log('serviceWorker in navigator');
  navigator.serviceWorker.register('./background.js', {
    persistent: true,
    module: 'module',
  });
}

console.log('____Background ARB');

console.log('MessageTypeEnum', MessageTypeEnum);

const limitPerSecond = 2;

// async function transformRequestBody(firstData) {
//   // Convert the Blob to a JSON object
//   const json = await firstData.text();
//   const obj = JSON.parse(json);
//
//   // Modify the JSON object
//   obj.newProperty = 'new value';
//
//   // Convert the JSON object back to a Blob
//   const newText = JSON.stringify(obj);
//   const newBlob = new Blob([newText], { type: 'application/json' });
//
//   return newBlob;
// }

// const searchListener = async (details) => {
//   // console.log('details', details);
//   console.log('url', details.url);
//   console.log('details', details);
//
//   const requestBody = details.requestBody;
//   if (requestBody && requestBody.raw) {
//     console.log('requestBody', details.requestBody);
//     // const newBody = await transformRequestBody(details.requestBody.raw[0]);
//     var decoder = new TextDecoder('utf-8');
//
//     function ab2str(buf) {
//       return decoder.decode(new Uint8Array(buf));
//     }
//
//     console.log('jsonBody', JSON.parse(ab2str(details.requestBody.raw[0].bytes)));
//   }
// };

// const searchUrl = 'https://relay.amazon.de/api/loadboard/search';
// const matches = { urls: ['https://relay.amazon.de/api/loadboard/search'] };
// const filter = { urls: ['*://relay.amazon.de/*'] };

// chrome.devtools.network.onRequestFinished.addListener(request => {
//   request.getContent((body) => {
//     if (request.request && request.request.url) {
//       if (request.request.url.includes('facebook.com')) {
//
//         //continue with custom code
//         var bodyObj = JSON.parse(body);//etc.
//       }
//     }
//   });
// });

// chrome.webRequest.onBeforeRequest.addListener(
//   searchListener,
//   filter,
//   ['requestBody'],
// );

// chrome.webRequest.onResponseStarted.addListener(
//   searchListener,
//   filter,
//   ['responseHeaders', 'extraHeaders'],
// );
//
// chrome.webRequest.onCompleted.addListener(
//   searchListener,
//   // { urls: ['*://relay.amazon.de/api/loadboard/search'] },
//   // { urls: ['<all_urls>'] },
//   filter,
//   ['responseHeaders'],
// );

// chrome.devtools.network.onRequestFinished.addListener(function(request) {
//   if (request.request.url === searchUrl) {
//     request.getContent(function(content, encoding) {
//       console.log('content', content);
//     });
//   }
// });

// console.log(chrome.webRequest.onResponseStarted);
// console.log(chrome.webRequest.onCompleted);

// function getCurrentTab() {/* ... */
// }

// let tab = getCurrentTab();
// console.log('tab', tab);

// alert('File test alert');

// self.addEventListener('fetch', function (event) {
//   console.log('fetch event', event);
//   event.respondWith(
//     fetch(event.request).then(function (response) {
//       // Clone the response object so we can access it twice
//       const responseClone = response.clone();
//
//       // Read the response body as text
//       return response.text().then(function (responseText) {
//         // Do something with the responseText here
//         console.log('responseText', responseText);
//
//         // Return the original response
//         return responseClone;
//       });
//     }),
//   );
// });

// addEventListener('fetch', event => {
//   console.log('fetch', event.request);
// });

// chrome.runtime.onInstalled.addListener(() => {
//   chrome.webRequest.onBeforeRequest.addListener(
//     (details) => {
//       console.log('onBeforeRequest', details);
//       return { cancel: false };
//     },
//     { urls: ['<all_urls>'] },
//     ['requestBody']
//   );
//
//   chrome.webRequest.onHeadersReceived.addListener(
//     (details) => {
//       console.log('onHeadersReceived', details);
//       return { responseHeaders: details.responseHeaders };
//     },
//     { urls: ['<all_urls>'] },
//     ['responseHeaders', 'blocking']
//   );
// });

// add event listener for fetch
// chrome.runtime.onInstalled.addListener(() => {
//   chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
//     console.log('message', message);
//     if (message.type === 'FETCH') {
//       try {
//         const response = await fetch(message.url);
//         const data = await response.text();
//         sendResponse({ success: true, data });
//       } catch (err) {
//         sendResponse({ success: false, error: err.message });
//       }
//     }
//   });
// });

// chrome.browserAction.onClicked.addListener(function (tab) {
//   // Check if the active tab has a specific URL
//   chrome.tabs.query({
//     active: true,
//     currentWindow: true,
//   }, async function (tabs) {
//     if (tabs[0].url.includes('https://relay.amazon.*')) {
//       // Open the extension popup
//       await chrome.browserAction.setPopup({ popup: 'popup.html' });
//     } else {
//       // Do not open the popup
//       await chrome.browserAction.setPopup({ popup: '' });
//     }
//   });
// });

chrome.runtime.onSuspend.addListener(function () {
  console.log('Unloading.');
  chrome.browserAction.setBadgeText({ text: '!!!!!!!' });
  chrome.action.setBadgeText({ text: '!!!!!!!' });
});

// chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
//   console.log('___onMessage parse', request, sender);
// // MediaQueryList.addListener(function (request, sender, sendResponse) {
//   if (request.type !== MessageTypeEnum.parse) return;
//   console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension');
//
//   sendResponse({ farewell: 'goodbye' });
//
//   if (request.workStatus === StatusEnum.SUCCESS) {
//     await bot.log(request.date);
//     const creationCallback = (id) => {
//       console.log('creationCallback', id);
//       chrome.notifications.clear(id);
//     };
//     const options = {
//       type: 'basic',
//       title: 'New slot is available',
//       message: request.workStatus,
//       iconUrl: 'icons/icon128.png',
//       imageUrl: 'icons/icon128.png',
//     };
//     const id = request.center = 0;
//     const notify = chrome.notifications.create(id, options, creationCallback);
//     console.log('notify', notify);
//
//   } else {
//     await bot.log('No data is available');
//   }
// });

// https://api.telegram.org/bot$%7BtelegramBotToken%7D/sendMessage?chat_id=${chatId}&text=Check%20out%20this%20location!&parse_mode=HTML&disable_web_page_preview=true&latitude=${latitude}&longitude=${longitude}
// https://api.telegram.org/bot$%7BtelegramBotToken%7D/sendMessage?chat_id=${chatId}&text=Check%20out%20this%20location!&parse_mode=HTML&disable_web_page_preview=true&latitude=42.430903&longitude=14.194901
// latitude longitude
// latitude // 42.430903
// longitude // 14.194901
// https://www.google.pl/maps/@<lat>,<lon>,<zoom>z
// https://www.google.com/maps/place/42.430903,14.194901/@<42.430903>,<14.194901>,10z
const createMapUrl = (work) => {
  const { latitude: lat, longitude: lon } = work.endLocation;
  // return `[Google Map](https://www.google.com/maps/place/${lat},${lon}/@<${lat}>,<${lon}>,10z)`;
  // return `<a href="https://www.google.com/maps/place/${lat},${lon}/@<${lat}>,<${lon}>,10z">Google Map</a>`;
  // return `<a target="_self" href="https://www.google.com/maps/place/${lat},${lon}">Google Map</a>`;
  // return `[Google Map](https://www.google.com/maps/place/${lat},${lon})`;
  return `[Location](https://www.google.com/maps/search/?api=1&query=${lat},${lon})`;
  // return `[Google Map](https://www.google.com/maps/@${lat},${lon},13z)`;
};

const getPoint = (location) => {
  const city = location.city.replace(`${location.postalCode}, `, '');
  return `*${location.stopCode}* ${city}, ${location.country}`;
};
const getDate = (dateTime) => {
  return new Date(dateTime).toLocaleString().slice(0, -3);
};
const normNumber = (float) => {
  return float.toFixed(2).replace(/\./g, ',');
};
// 🏁
// 🔚
// firstPickupTime
// endLocation .label + .city .state .country
// startLocation
// lastDeliveryTime
// payout .unit .value
// totalDistance .unit .value
const createMessage = (work, testMode) => {
  let msg = testMode ? '\\[TEST\]\n' : '';
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

// Inject a script directly into the page DOM
// chrome.tabs.executeScript({
//   code: 'alert("Hello, world!");'
// });
// chrome.runtime.onInstalled.addListener(() => {
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.type) {
    case MessageTypeEnum.newWorks: {
      (async () => {
        console.log('message type', request.type, request);
        const location = request.location;
        const newWorks = request.newWorks;
        const count = newWorks.length;
        let msg = `New *${count}* works at: *${location}*`;
        const testStatus = await getTestStatus();
        if (testStatus) {
          msg = `\\[TEST\] ${msg}`;
        }

        // bot = new Bot(request.payload);
        // bot.start();
        const notifyLocal = async () => {
          try {
            const id = chrome.runtime.id;
            const creationCallback = () => {
              console.log('creationCallback', id);
              // chrome.notifications.clear(id, () => {
              //   console.log('Notification cleared');
              // });
            };
            const options = {
              type: 'basic',
              title: testStatus ? `[TEST] New Works: ${count}` : `New Works: ${count}`,
              message: msg,
              iconUrl: '../icons/icon128.png',
              // imageUrl: 'icons/icon128.png',
            };
            // const id = request.center = 0;
            const notify = chrome.notifications.create(id, options, creationCallback);
            console.log('notify', notify);
          } catch (e) {
            return console.error(e);
          }
        };
        const notifyBot = async () => {
          // try {
            return bot.log({ text: msg }, testStatus);
          // } catch (e) {
          //   return console.error(e);
          // }
        };
        const notifyAll = newWorks.map((work) => {
          const msg = createMessage(work, testStatus);
          console.log('notify each', msg);
          const { latitude, longitude } = work.endLocation;
          return async () => bot.log({
            text: msg,
            // latitude,
            // longitude,
            reply_markup: {
              inline_keyboard: [[{
                text: 'Navigate',
                callback_data: `navigate:${latitude},${longitude}`,
              }]],
            },
          }, testStatus);
        });
        const logResults = (results, error = false) => {
          const log = error ? console.error : console.log;
          results.length && results.forEach(r => log(r));
        }

        try {
          await Promise.all([
            notifyLocal(),
            queuePerSecond([notifyBot, ...notifyAll], limitPerSecond,  true)
              .then((results) => {
                console.log('queuePerSecond done', results);
                const { successes, errors } = results;
                // logResults(success);
                logResults(errors, true);
              }).catch((e) => {
                console.error('queuePerSecond', e);
                throw e;
            }),
          ]).then((r) => {
            console.log('notifyAll done', r);
          }).catch((e) => {
            console.error(e);
          });
        } catch (e) {
          return console.error(e);
        }
      })();
      break;
    }
    case MessageTypeEnum.getInjectData: {
      (async () => {
        console.log('message type', request.type, request);
        const url = chrome.runtime.getURL(request.payload);
        const [testStatus, workStatus] = await Promise.all([getTestStatus(), getWorkStatus()]);
        const response = { url, workStatus, testStatus };
        console.log('response', MessageTypeEnum.getInjectData, response);
        return response;
      })().then(sendResponse);
      break;
    }
    case MessageTypeEnum.getTabId: {
      console.log('message type', request.type, request);
      chrome.tabs.query({
        active: true,
        currentWindow: true,
      }, function (tabs) {
        const currentTabId = tabs[0].id;
        console.log('response currentTabId', currentTabId);
        sendResponse({ tabId: currentTabId });

        // setTimeout(() => {
        //   chrome.scripting.executeScript({
        //     target: { tabId: currentTabId },
        //     func: () => {
        //       // alert("Hello, world!");
        //       // inject(request.payload);
        //     },
        //     // code: 'alert("Hello, world!");'
        //     // files: ['injected'],
        //   }).then((...args) => {
        //     console.log('script is injected', args);
        //   });
        // }, 0);
      });
      break;
    }
  }
  // console.log('return true', request.type);
  return true;
});
// });
