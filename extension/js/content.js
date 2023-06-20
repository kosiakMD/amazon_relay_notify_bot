this.console.log = console.log.bind(this, '____Content\n\t');

console.log('content.js');

let timer = null;

const config = {
  status: false,
};

const getRefreshBtn = (newUIStatus) => newUIStatus
  ? $('#utility-bar button')[0]
  : $('#filter-summary-panel button')[1];

const refresh = (newUIStatus) => {
  console.log('refresh newUIStatus', newUIStatus);
  const $reloadBtn = getRefreshBtn(newUIStatus);
  $reloadBtn.click();
};

const start = () => {
  console.group('start');
  if (timer) {
    console.log('timer is already running. Clean it');
    clearTimeout(timer);
  }
  storage.get([intervalField, workStatusField, newUIField], (result) => {
    console.group('storage.get')
    console.log('result', result);
    const interval = result[intervalField] || defaultTimer;
    console.log('interval', interval);
    const workStatus = result[workStatusField];
    console.log('workStatus', workStatus);
    const newUIStatus = result[newUIField];
    console.log('newUIStatus', newUIStatus);

    if (workStatus) {
      // showStatus(0);
      refresh(newUIStatus);
      console.log('start new timer', interval);
      timer = setTimeout(start, Number(interval) * 1000);
    }
    console.groupEnd();
  });
  console.groupEnd();
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

/**
 * code in inject.js
 * added "web_accessible_resources": ["injected.js"] to manifest.json
 */
chrome.runtime.sendMessage({
  type: MessageTypeEnum.getTabId,
  // payload: XMLHttpRequest,
}, function (response) {
  console.log('response', response);
  const currentTabId = response.tabId;

  console.log('Current tab id:', currentTabId);
});


class WorkHelper {

  /** store works as Map by id */
  static newWorks = new Map();

  static getNewWorks(works) {
    console.log('getNewWorks');
    if (!this.oldWorks?.size) {
      this.oldWorks = new Map(works.map(work => [work.id, work]));
      return [];
    }

    const newWorks = works.filter(work => !this.oldWorks.has(work.id));
    (async () => {
      this.oldWorks = new Map(works.map(work => [work.id, work]));
    })();
    return newWorks;
  }

  static getElevatedPriceWorks(works) {
    console.log('getElevatedPriceWorks');
    const elevatedPriceWorks = works.filter(work => {
      const oldWork = this.oldWorks.get(work.id);
      if (oldWork) {
        return oldWork.payout.value < work.payout.value;
      }
      return false;
    });
    console.log('elevatedPriceWorks', elevatedPriceWorks);
    return elevatedPriceWorks;
  }
}

/** store works as Map by id */
// let oldWorks = new Map();

/** input works array
 * if no oldWorks, then just store and return empty result
 * return works array of input works not exist in oldWorks Map
 * and clean existing oldWorks by new input works as Map by id
 * */
// const getNewWorks = (works) => {
//   if (!oldWorks.size) {
//     oldWorks = new Map(works.map(work => [work.id, work]));
//     return [];
//   }
//
//   const newWorks = works.filter(work => !oldWorks.has(work.id));
//   (async () => {
//     oldWorks = new Map(works.map(work => [work.id, work]));
//   })();
//   return newWorks;
// };


/** Listeners */

// listener to messages from background.js or popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.group('Event Listener from background.js or popup.js');
  console.log('request', request);
  if (request.type === MessageTypeEnum.testStatus) {
    const type = MessageTypeEnum.testStatus;
    sendInjectConfig(type, request.payload);
  }
  if (request.type === MessageTypeEnum.newUIStatus) {
    const type = MessageTypeEnum.newUIStatus;
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
  console.groupEnd();
});

function sendToBackground(type, works, location) {
  return chrome.runtime.sendMessage({
    type: MessageTypeEnum.newWorks,
    newWorks: works,
    location: location,
  });
}

function sendNewWorks(works, location) {
  console.log('sendNewWorks');
  return sendToBackground(MessageTypeEnum.newWorks, works, location);
}

function sendElevatedPriceWorks(works, location) {
  console.log('sendElevatedPriceWorks');
  return sendToBackground(MessageTypeEnum.elevatedPriceWorks, works, location);
}

// listener to messages
window.addEventListener('message', async function (event) {
  // console.log('event', event);
  // filter event messages by extension id
  if (event.source === window && event.data.ex === chrome.runtime.id) {
    console.group('Event Listener from extension, id =', chrome.runtime.id);
    // Handle the message here
    console.log('My message', event.data.data);

    const location = await getNewUIStatus()
      ? $('[mdn-input-box]').eq(0).find('input').val()
      : $('[mdn-select-value]').eq(1).text();

    if (event.data.type === MessageTypeEnum.search) {
      const works = event.data.data.workOpportunities;
      // handle new Works
      const newWorks = WorkHelper.getNewWorks(works);
      console.log('newWorks', newWorks);
      const testMode = await getTestStatus();
      if (newWorks.length) {
        await sendNewWorks(newWorks, location);
      } else if (testMode) {
        await sendNewWorks(works.slice(0, 1), location);
      }
      // handle elevated price Works
      const elevatedPriceWorks = WorkHelper.getElevatedPriceWorks(works);
      console.log('elevatedPriceWorks', elevatedPriceWorks);
      if (elevatedPriceWorks.length) {
        await sendElevatedPriceWorks(elevatedPriceWorks, location);
      } else if (testMode) {
        await sendElevatedPriceWorks(works.slice(0, 1), location);
      }
    }
    console.groupEnd();
  }
  return true;
}, false);

// document.addEventListener('DOMContentLoaded', start);
$(start);
