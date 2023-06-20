// import { MessageTypeEnum, StatusEnum } from './common.js';
// import { bot } from './bot.js';

// importScripts('./common.js', './bot.js', './inject.js');
importScripts('./common.js', './bot.js', './messages.js');

this.console.log = console.log.bind(this, '____BG\n\t');

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

chrome.runtime.onSuspend.addListener(function () {
  console.log('Unloading.');
  chrome.browserAction.setBadgeText({ text: '!!!!!!!' });
  chrome.action.setBadgeText({ text: '!!!!!!!' });
});

// Inject a script directly into the page DOM
// chrome.tabs.executeScript({
//   code: 'alert("Hello, world!");'
// });
// chrome.runtime.onInstalled.addListener(() => {
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // console.group('Message Listener')
  switch (request.type) {
    case MessageTypeEnum.newWorks: {
      (async () => {
        const gid = 'newWorks - ' + Math.random().toString(36).substr(2, 9);
        logger.openGroup(gid);
        logger.log(gid, 'message type', request.type, request);
        const location = request.location;
        const newWorks = request.newWorks;
        const count = newWorks.length;
        const time = new Date().toLocaleTimeString();
        let msg = `${time} | New *${count}* works at: *${location}*`;
        const testStatus = await getTestStatus();
        if (testStatus) {
          msg = `\\[TEST\] ${msg}`;
        }

        // bot = new Bot(request.payload);
        // bot.start();
        const notifyLocal = async () => {
          console.group('notifyLocal');
          try {
            const id = chrome.runtime.id;
            const options = {
              type: 'basic',
              title: testStatus ? `[TEST] New Works: ${count}` : `New Works: ${count}`,
              message: msg,
              iconUrl: '../icons/icon128.png',
              // imageUrl: 'icons/icon128.png',
            };
            // const id = request.center = 0;
            const notify = await new Promise((resolve, reject) => {
              try {
                chrome.notifications.create(id, options, (notId) => {
                  console.log('creationCallback, notId', notId, 'extension', id);
                  resolve(notId);
                });
              } catch (e) {
                reject(e);
              }
            });
            console.log('notify', notify);
          } catch (e) {
            return console.error(e);
          } finally {
            console.groupEnd();
          }
        };
        const notifySummary = async () => {
          logger.log(gid, 'notifySummary');
          return bot.log({ text: msg });
        };
        const notifyAll = newWorks.map(async (work) => {
          logger.log(gid, 'notifyAll');
          const msg = await createWorkMsg(work, 'new');
          // logger.log(gid, 'notify each', msg);
          const { latitude, longitude } = work.endLocation;
          const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

          return bot.log({
            text: msg,
            // latitude,
            // longitude,
            reply_markup: {
            // need set Navigate button in Telegram message form my bot and open map in new window by click
              inline_keyboard: [[
                {
                  text: 'Navigate1',
                  // callback_data: `navigate:${latitude},${longitude}`,
                  url: mapUrl,
                }, {
                  text: 'Navigate2',
                  // callback_data: `navigate:${latitude},${longitude}`,
                  url: `navigate:${latitude},${longitude}`,
                }, {
                  text: 'Open Map1',
                  callback_data: `geo:<${latitude}>,<${longitude}>?q=<${latitude}>,<${longitude}>`,
                }, {
                  text: 'Open Map2',
                  url: `geo:<${latitude}>,<${longitude}>?q=<${latitude}>,<${longitude}>`,
                }
              ]],
            },
          });
        });
        const logResults = (results, error = false) => {
          logger.log(gid, 'logResults');
          const log = error ? logger.error : logger.log;
          results.length && results.forEach(x => log(gid, x));
        };

        try {
          const r = await Promise.all([
            // notifyLocal(),
            // [notifySummary, ...notifyAll].map(f => handleAsync(f)),
            queuePerSecond([notifySummary, ...notifyAll], 10, true)
              .then((results) => {
                const subGid = 'queuePerSecond done - ' + Math.random().toString(36).substr(2, 9);
                logger.openGroup(subGid, gid);
                logger.log(subGid, 'queuePerSecond done', results);
                const { successes, errors } = results;
                logResults(success);
                logResults(errors, true);
                logger.closeGroup(subGid);
              }).catch((e) => {
                console.error('queuePerSecond', e);
                throw e;
              }),
          ]);
          logger.log(gid, 'notifyAll done', r);
        } catch (e) {
          return logger.error(gid, e);
        } finally {
          logger.closeGroup(gid);
        }
      })();
      break;
    }
    case MessageTypeEnum.getInjectData: {
      (async () => {
        console.log('message type', request.type, request);
        const url = chrome.runtime.getURL(request.payload);
        const [testStatus, workStatus, newUIStatus] =
          await Promise.all(
            [getTestStatus(), getWorkStatus(), getNewUIStatus()]
          );
        const response = { url, workStatus, testStatus, newUIStatus };
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
