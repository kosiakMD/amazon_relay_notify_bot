// import {
//   intervalField,
//   MessageTypeEnum,
//   storage,
//   workStatusField,
// } from './common.js';
// import { bot } from './bot.js';

// importScripts('common.js', 'bot.js');
this.console.log = console.log.bind(this, '____Popup\n\t');

console.log('popup.js');

$(document).ready(function () {
  console.log('jQuery is working!');
});

function formField(name) {
  return `${AppName}_${name}`;
}

const storeFields = [
  intervalField,
  workStatusField,
  testStatusField,
  newUIField,
  darkThemeField
];

const saveAll = async () => {
  console.group('saveAll');
  const values = storeFields.map((field) => {
    const value = getValueById(field);
    console.log(field, value);
    return [field, value];
  });

  await storage.set(
    Object.fromEntries(values),
    () => {
      success(intervalField, workStatusField, testStatusField, newUIField, darkThemeField);
    },
  );

  // let tabs = [];
  // chrome.tabs.query({ url: 'https://row1.vfsglobal.com/GlobalAppointment/Home/SelectVAC' }, (args) => {
  //   console.log(args);
  //   tabs = args;
  // });
  // tabs.map(
  //   tab => chrome.tabs.sendMessage(tab.id, {
  //       type: MessageTypeEnum.workStatus,
  //     },
  //   ),
  // );
  console.groupEnd();
};

const sendToAllTabs = async (message) => {
  try {
    const tabs = await chrome.tabs.query({ url: workUrl });
    if (chrome.runtime.lastError) {
      console.log('sendToAllTabs', chrome.runtime.lastError.message);
      return;
    }
    console.log('tabs', tabs);
    await Promise.all(tabs.map((tab) => chrome.tabs.sendMessage(tab.id, message)));
  } catch (e) {
    console.error('sendToAllTabs', e);
    throw e;
  }
};

// $(() => {
window.onload = () => {
  // Listeners
  const $workStatus = document.getElementById(workStatusField);
  const $testStatus = document.getElementById(testStatusField);
  const $interval = document.getElementById(intervalField);
  const $newUi = document.getElementById(newUIField);
  const $darkTheme = document.getElementById(darkThemeField);
  const $saveBtn = document.getElementById('saveBtn');
  const $playBtn = document.getElementById('playBtn');

  $workStatus.addEventListener('change', async (event) => {
    console.group(workStatusField, 'changed');
    const value = event.target.checked;
    const status = value; // ? ConfigEnum.on : ConfigEnum.off;

    console.log(workStatusField, status);
    setWorkStatus(value);

    try {
      await sendToAllTabs({
        type: MessageTypeEnum.workStatus,
        ex: chrome.runtime.id,
        payload: status,
      });
    } catch (e) {
      console.error('workStatusField', e);
    }
    console.groupEnd();
  });
  $testStatus.addEventListener('change', async (event) => {
    console.group(testStatusField, 'changed');
    const value = event.target.checked;
    const status = value; // ? ConfigEnum.on : ConfigEnum.off;

    console.log(testStatusField, status);
    setTestStatus(value);

    try {
      await sendToAllTabs({
        type: MessageTypeEnum.testStatus,
        ex: chrome.runtime.id,
        payload: status,
      });
    } catch (e) {
      console.error('testStatusField', e);
    }
    console.groupEnd();
  });
  $newUi.addEventListener('change', async (event) => {
    console.group(newUIField, 'changed');
    const value = event.target.checked;
    const status = value; // ? ConfigEnum.on : ConfigEnum.off;

    console.log(newUIField, status);
    setNewUIStatus(value);

    // try {
    //   await sendToAllTabs({
    //     type: MessageTypeEnum.newUIStatus,
    //     ex: chrome.runtime.id,
    //     payload: status,
    //   });
    // } catch (e) {
    //   console.error('newUIField', e);
    // }
    console.groupEnd();
  });
  $darkTheme.addEventListener('change', async (event) => {
    console.group(darkThemeField, 'changed');
    const value = event.target.checked;
    const status = value; // ? ConfigEnum.on : ConfigEnum.off;

    console.log(darkThemeField, status);
    setDarkThemeStatus(value);
    switchTheme(value);

    // try {
    //   await sendToAllTabs({
    //     type: MessageTypeEnum.darkThemeField,
    //     ex: chrome.runtime.id,
    //     payload: status,
    //   });
    // } catch (e) {
    //   console.error('darkThemeField', e);
    // }
    console.groupEnd();
  });

  $interval.addEventListener('change', (event) => {
    const minValue = Number(event.target.min);
    let value = Number(event.target.value);

    if (value < minValue) {
      value = minValue;
      event.target.value = minValue;
    }

    console.log(intervalField, value);
    setInterval(value);
  });

  const $saveBtn2 = $('#saveBtn');
  console.log('$saveBtn2', $saveBtn2);
  $saveBtn.addEventListener('click', async (e) => {
    console.group('Save all Fields');
    e.preventDefault();
    await saveAll();
    console.groupEnd();
  });
  $playBtn.addEventListener('click', async (e) => {
    console.group('toggle play');
    e.preventDefault();
    // await sendToAllTabs({
    //   type: MessageTypeEnum.play,
    //   ex: chrome.runtime.id,
    // });
    $workStatus.checked = !$workStatus.checked;
    $workStatus.dispatchEvent(new Event('change'));
    console.groupEnd();
  });

  // const setInterval = () => storage.set(
  //   { [intervalField]: document.getElementById(intervalField).value },
  //   () => {
  //     success(intervalField);
  //   },
  // );
  // const setWorkStatus = () => storage.set(
  //   { [workStatusField]: document.getElementById(workStatusField).checked },
  //   () => {
  //     success(workStatusField);
  //   },
  // );

  // const changeSaveButton = (value, enable) => {
  //   $btn.text(value);
  //   $btn.prop('disabled', !enable);
  // };

  console.log('submit form id', document.getElementById('form'));
  document.getElementById('form').addEventListener('submit', (e, a1, a2) => {
    console.group('Submit form');
    e.preventDefault();
    console.log(e, a1, a2);
    console.log('.serialize()', $('#form').serialize(), $('#form').serializeArray());
    console.groupEnd();
  });

  // document.getElementById('testBot').addEventListener('click', async () => {
  //   const msg = document.getElementById('testMsg').value;
  //   console.log('test bot');
  //   const result = await bot.sendMsg(`${msg}`, '-697279153');
  //   console.log(result);
  // });

  // RENDER
  storage.get(storeFields, (result) => {
    console.group('storage.get & render');
    console.log(result);

    storeFields.forEach((field) => {
      const value = result[field];
      if (value) {
        console.log(field, value);
        setValueById(field, value);
        renderInterceptor(field, value);
      } else {
        saveFieldValue(field);
      }
    });
    console.groupEnd();
  });
};

const darkThemeClass = 'dark-theme';

function switchTheme(dark) {
  if (dark) {
    document.body.classList.add(darkThemeClass);
  } else {
    document.body.classList.remove(darkThemeClass);
  }
}

function renderInterceptor(field, value) {
  if (field === darkThemeField) {
    switchTheme(value);
  }
}

// document.addEventListener('blur', (event) => {
//   // Prevent the default behavior, which is to close the popup
//   event.preventDefault();
// }, true);
//
// let popupWindowId; // Store the ID of the popup window
//
// // Add an event listener for tab activation
// chrome.tabs.onActivated.addListener((activeInfo) => {
//   console.log('tabs.onActivated');
//   // Get the current window
//   chrome.windows.getCurrent({ populate: true }, (currentWindow) => {
//     // Check if the popup window is active
//     if (currentWindow.id === popupWindowId) {
//       // Refocus the popup window
//       chrome.windows.update(popupWindowId, { focused: true });
//     }
//   });
// });
//
// // Open the popup and store its window ID
// chrome.browserAction.onClicked.addListener(() => {
//   console.log('browserAction.onClicked');
//   chrome.windows.create({
//     type: 'popup',
//     url: 'popup.html',
//     width: 220,
//     height: 400,
//   }, (window) => {
//     popupWindowId = window.id;
//   });
// });
// // })();
// var popupWindow = window.open(
//   chrome.extension.getURL("../popup.html"),
//   "exampleName",
//   "width=400,height=400"
// );
// window.close();
