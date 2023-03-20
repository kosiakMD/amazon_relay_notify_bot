this.console.log = console.log.bind(this, '____Content');

console.log('content.js');

let timer = null;

const config = {
  status: false,
};

const getRefreshBtn = () => $('#filter-summary-panel button')[1];

const refresh = () => {
  console.log('refresh');
  const $reload = getRefreshBtn();
  $reload.click();
};

const start = () => {
  if (timer) {
    console.log('timer is already running. Clean it');
    clearTimeout(timer);
  }
  storage.get([intervalField, workStatusField], (result) => {
    console.log('___', result);
    const interval = result[intervalField] || defaultTimer;
    console.log('start interval', interval);
    const workStatus = result[workStatusField];
    console.log('start workStatus', workStatus);

    if (workStatus) {
      // showStatus(0);
      refresh();
      console.log('start new timer', interval);
      timer = setTimeout(start, Number(interval) * 1000);
    }
  });
};

const stop = () => {
  console.log('clear timer');
  clearTimeout(timer);
};

const sendToInject = (message) => {
  window.postMessage(message);
};

const sendInjectConfig = (type, payload) => {
  sendToInject({
    type: type,
    ex: chrome.runtime.id,
    payload,
  });
};

// listener for messages from background.js or popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('request', request);
  if (request.type === MessageTypeEnum.testStatus) {
    const type = MessageTypeEnum.testStatus;
    sendInjectConfig(type, request.payload);
  }
  if (request.type === MessageTypeEnum.workStatus) {
    const workStatus = request.payload;
    console.log('postMessage workStatus', request.payload);

    config.workStatus = workStatus;

    if (workStatus/* === ConfigEnum.on*/) {
      start();
    } else if (workStatus/* === ConfigEnum.off*/) {
      stop();
    }

    sendInjectConfig(workStatus);
  }

});

/**
 * code in inject.js
 * added "web_accessible_resources": ["injected.js"] to manifest.json
 */
chrome.runtime.sendMessage({
  type: MessageTypeEnum.getTabId,
  // payload: XMLHttpRequest,
}, function (response) {
  console.log('\n\tresponse', response);
  const currentTabId = response.tabId;

  console.log('Current tab id:', currentTabId);
});

/** store works as Map by id */
let oldWorks = new Map();

/** input works array
 * if no oldWorks, then just store and return empty result
 * return works array of input works not exist in oldWorks Map
 * and clean existing oldWorks by new input works as Map by id
 * */
const getNewWorks = (works) => {
  if (!oldWorks.size) {
    oldWorks = new Map(works.map(work => [work.id, work]));
    return [];
  }

  const newWorks = works.filter(work => !oldWorks.has(work.id));
  (async () => {
    oldWorks = new Map(works.map(work => [work.id, work]));
  })();
  return newWorks;
};

// listener to message from injected.js
window.addEventListener('message', async function (event) {
  // console.log('\n\tevent', event);
  if (event.source === window && event.data.ex === chrome.runtime.id) {
    // Handle the message here
    console.log('\n\tMy message', event.data.data);
    if (event.data.type === MessageTypeEnum.search) {
      const works = event.data.data.workOpportunities;
      const newWorks = getNewWorks(works);
      console.log('\n\tnewWorks', newWorks);
      if (newWorks.length) {
        const location = $('[mdn-select-value]').eq(1).text();
        chrome.runtime.sendMessage({
          type: MessageTypeEnum.newWorks,
          newWorks: newWorks,
          location: location,
        });
      } else {
        // TEST
        const testStatus = await getTestStatus();
        if (testStatus) {
          const location = $('[mdn-select-value]').eq(1).text();
          chrome.runtime.sendMessage({
            type: MessageTypeEnum.newWorks,
            newWorks: works.slice(0, 2),
            location: location,
          });
        }
      }
    }
  }
}, false);

// document.addEventListener('DOMContentLoaded', start);
$(start);
