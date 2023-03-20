// import {
//   intervalField,
//   MessageTypeEnum,
//   storage,
//   workStatusField,
// } from './common.js';
// import { bot } from './bot.js';

// importScripts('common.js', 'bot.js');
this.console.log = console.log.bind(this, '____Popup');

console.log('popup.js');

$(document).ready(function () {
  console.log('jQuery is working!');
});

function formField(name) {
  return `${AppName}_${name}`;
}


const saveAll = () => {
  const interval = document.getElementById(intervalField).value;
  console.log('interval', interval);
  const workStatus = document.getElementById(workStatusField).checked;
  console.log('workStatus', workStatus);
  const testStatus = document.getElementById(testStatusField).checked;
  console.log('testStatus', testStatus);

  storage.set(
    {
      [intervalField]: interval,
      [workStatusField]: workStatus,
      [testStatusField]: testStatus,
    },
    () => {
      success(intervalField, workStatusField, testStatusField);
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

};

const sendToAllTabs = (message) => {
  chrome.tabs.query({ url: workUrl }, function (tabs) {
    tabs.forEach(function (tab) {
      chrome.tabs.sendMessage(tab.id, message);
    });
  });
};

// $(() => {
window.onload = () => {
  const $workStatus = document.getElementById(workStatusField);
  const $testStatus = document.getElementById(testStatusField);
  const $interval = document.getElementById(intervalField);

  $workStatus.addEventListener('change', (event) => {
    const value = event.target.checked;
    const status = value; // ? ConfigEnum.on : ConfigEnum.off;

    console.log(workStatusField, status, value);
    saveWorkStatus(value);

    sendToAllTabs({
      type: MessageTypeEnum.workStatus,
      ex: chrome.runtime.id,
      payload: status,
    });
  });
  $testStatus.addEventListener('change', (event) => {
    const value = event.target.checked;
    const status = value; // ? ConfigEnum.on : ConfigEnum.off;

    console.log(testStatusField, status, value);
    saveTestStatus(value);

    sendToAllTabs({
      type: MessageTypeEnum.testStatus,
      ex: chrome.runtime.id,
      payload: status,
    });
  });

  $interval.addEventListener('change', (event) => {
    const minValue = Number(event.target.min);
    let value = Number(event.target.value);

    if (value < minValue) {
      value = minValue;
      event.target.value = minValue;
    }

    console.log(intervalField, value);
    saveInterval(value);
  });

  // const saveInterval = () => storage.set(
  //   { [intervalField]: document.getElementById(intervalField).value },
  //   () => {
  //     success(intervalField);
  //   },
  // );
  // const saveWorkStatus = () => storage.set(
  //   { [workStatusField]: document.getElementById(workStatusField).checked },
  //   () => {
  //     success(workStatusField);
  //   },
  // );

  const $btn = $('#setIntervalBtn');
  console.log($btn);

  storage.get([intervalField, workStatusField, testStatusField], (result) => {
    console.log(result);
    const interval = result[intervalField];
    const workStatus = result[workStatusField];
    const testStatus = result[testStatusField];

    if (interval) {
      console.log(intervalField, interval);
      document.getElementById(intervalField).value = interval;
    } else {
      saveInterval();
    }
    if (workStatus !== undefined) {
      console.log(workStatusField, workStatus);
      document.getElementById(workStatusField).checked = workStatus;
    } else {
      saveWorkStatus();
    }
    if (testStatus !== undefined) {
      console.log(testStatusField, testStatus);
      document.getElementById(testStatusField).checked = testStatus;
    } else {
      saveTestStatus();
    }
  });

  // const changeSaveButton = (value, enable) => {
  //   $btn.text(value);
  //   $btn.prop('disabled', !enable);
  // };

  document.getElementById('setIntervalBtn').addEventListener('click', (e) => {
    e.preventDefault();
    saveAll();
  });

  console.log('submit form id', document.getElementById('form'));
  document.getElementById('form').addEventListener('submit', (e, a1, a2) => {
    console.log('submiting');
    e.preventDefault();
    console.log(e, a1, a2);
    console.log('.serialize()', $('#form').serialize(), $('#form').serializeArray());
  });

  // document.getElementById('testBot').addEventListener('click', async () => {
  //   const msg = document.getElementById('testMsg').value;
  //   console.log('test bot');
  //   const result = await bot.sendMsg(`${msg}`, '-697279153');
  //   console.log(result);
  // });
};


// })();
