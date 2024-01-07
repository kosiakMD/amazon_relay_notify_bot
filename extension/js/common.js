console.log('common.js');

const AppName = 'ARBot';

console.log('____Starting', AppName);

const workUrl = 'https://relay.amazon.de/loadboard/search';

const sync = false;

const storage = sync ? chrome.storage.sync : chrome.storage.local;

const defaultTimer = 10;

const intervalField = 'interval';
const workStatusField = 'workStatus';
const testStatusField = 'testStatus';
const newUIField = 'newUIStatus';
const darkThemeField = 'darkThemeStatus';

const StatusEnum = {
  SUCCESS: 'SUCCESS',
  FAIL: 'FAIL',
};

const ConfigEnum = {
  on: 'on',
  off: 'off',
};

class CustomLogger {
  constructor() {
    this.stack = {};
    this.parentMap = {};
  }

  openGroup(id, parentId = null) {
    const key = `${id}`;
    if (!this.stack[key]) {
      this.stack[key] = [];
    }
    if (parentId) {
      this.parentMap[id] = parentId;
    }
  }

  log(id, ...args) {
    this._log('log', id, ...args);
  }

  warn(id, ...args) {
    this._log('warn', id, ...args);
  }

  error(id, ...args) {
    this._log('error', id, ...args);
  }

  debug(id, ...args) {
    this._log('debug', id, ...args);
  }

  closeGroup(id) {
    const key = `${id}`;
    const group = this.stack[key];
    if (group) {
      console.groupCollapsed(`[${id}]`);
      group.forEach((log) => console[log.method](...log.args));
      console.groupEnd();
      delete this.stack[key];
    }
    const parentId = this.parentMap[id];
    if (parentId) {
      const childKeys = Object.keys(this.stack).filter((key) => this.parentMap[key] === parentId);
      childKeys.forEach((childKey) => {
        const childId = childKey;
        this.closeGroup(childId);
      });
      delete this.parentMap[id];
    }
  }

  _log(method, id, ...args) {
    console[method](`[${id}]`, ...args);
    const key = id;
    if (this.stack[key]) {
      this.stack[key].push({ method, args });
    }
  }
}

const logger = new CustomLogger();

const MessageTypeEnum = {
  workStatus: 'workStatus',
  testStatus: 'testStatus',
  newUIStatus: 'newUIStatus',
  darkThemeField: 'darkThemeField',
  parse: 'parse',
  config: 'config',
  search: 'search',
  newWorks: 'newWorks',
  elevatedPriceWorks: 'elevatedPriceWorks',
  getInjectData: 'getInjectData',
  getTabId: 'getTabId',
};

/** @type {() => Promise<boolean>} */
const getWorkStatus = () => {
  console.group('getWorkStatus');
  return new Promise((resolve) => {
    try {
      storage.get([workStatusField], (result) => {
        const workStatus = result[workStatusField];
        console.log('workStatus', workStatus);
        resolve(workStatus);
      });
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      console.groupEnd();
    }
  });
};

/** @type {() => Promise<boolean>} */
const getTestStatus = () => {
  console.group('getTestStatus');
  return new Promise((resolve) => {
    try {
      storage.get([testStatusField], (result) => {
        const testStatus = result[testStatusField];
        console.log('testStatus', testStatus);
        resolve(testStatus);
      });
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      console.groupEnd();
    }
  });
};
/** @type {() => Promise<boolean>} */
const getNewUIStatus = () => {
  console.group('getNewUIStatus');
  return new Promise((resolve) => {
    try {
      storage.get([newUIField], (result) => {
        const newUIStatus = result[newUIField];
        console.log('newUIStatus', newUIStatus);
        resolve(newUIStatus);
      });
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      console.groupEnd();
    }
  });
};
/** @type {() => Promise<boolean>} */
const getDarkThemeStatus = () => {
  console.group('getDarkThemeStatus');
  return new Promise((resolve) => {
    try {
      storage.get([darkThemeField], (result) => {
        const darkThemeStatus = result[darkThemeField];
        console.log('darkThemeStatus', darkThemeStatus);
        resolve(darkThemeStatus);
      });
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      console.groupEnd();
    }
  });
};

function success(...fields) {
  console.log(`fields: ${fields.join(', ')} - saved`);
}

function setValueById(id, value) {
  $element = document.getElementById(id);
  if ($element) {
    if ($element.type === 'checkbox') {
      $element.checked = value;
    } else {
      $element.value = value;
    }
  } else {
    console.error(`Element with id ${id} not found`);
  }
}
function getValueById(id) {
  $element = document.getElementById(id);
  if ($element) {
    if ($element.type === 'checkbox') {
      return $element.checked;
    } else {
      return $element.value;
    }
  } else {
    console.error(`Element with id ${id} not found`);
  }
}

const saveFieldValue = (field, v) => {
  const value = typeof v !== 'undefined' ? v : getValueById(field);
  storage.set(
    { [field]: value, },
    () => {
      success(field);
    },
  )
};

const createSaveStorageField = (field) => (value) => saveFieldValue(field, value);

function reloadPages() {
  chrome.tabs.query({ url: workUrl }, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.reload(tab.id);
    });
  });
}

const setInterval = createSaveStorageField(intervalField);

const setWorkStatus = createSaveStorageField(workStatusField);

const setTestStatus = createSaveStorageField(testStatusField);

const setNewUIStatus = createSaveStorageField(newUIField);

const setDarkThemeStatus = createSaveStorageField(darkThemeField);

const asyncQueue = async (asyncArr, limit) => {
  let q = 0;
  const success = [];
  const errors = [];

  function handleResult(result) {
    success.push(result);
    if (result.status === 'rejected') {
      errors.push(result.reason);
    }
    const f = asyncArr[q++];
    if (!f) return;
    return handleAsync(f);
  }

  function handleAsync(asyncCode) {
    let promise = asyncCode;
    if (typeof asyncCode === 'function') {
      promise = asyncCode(q++);
    }
    return promise.then(handleResult).catch(handleResult);
  }

  await Promise.allSettled(asyncArr.slice(0, limit).map(
    (f) => handleAsync(f),
  ));
  return { success, errors };
};

/**
 * Formats the given date and time into 'dd.mm.yy h:m' (24-hour) format.
 * @param {string} dateTime - The date and time to format.
 * @param {boolean} withSeconds - Whether to include seconds in the time.
 * @param {boolean} convertToCET - Whether to convert the date and time to Central European Time (Poland).
 * @returns {string} - The formatted date and time.
 */
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

async function queuePerSecond(arr, limit, log = false) {
  const id = 'queuePerSecond - ' + Math.random().toString(36).substring(7);
  logger.openGroup(id);
  logger.log(id, 'queuePerSecond', arr);
  const successes = [];
  const errors = [];

  if (arr.length === 0) {
    return { successes, errors };
  }

  const slicedArray = [];
  for (let i = 0; i < arr.length; i += limit) {
    slicedArray.push(arr.slice(i, i + limit));
  }
  logger.log(id, 'slicedArray', slicedArray);
  const handleResult = (result) => {
    const subId = 'handleResult - ' + Math.random().toString(36).substring(7);
    logger.openGroup(subId, id);
    logger.log(subId, 'handleResult') ;
    if (result.status === 'fulfilled') {
      successes.push(result.value);
      if (log) {
        logger.log(subId, 'Success:', result.value);
      }
    } else {
      errors.push(result.reason);
      if (log) {
        logger.error(subId, result.reason);
      }
    }
    logger.closeGroup(subId, id);
  };

  const executeAsync = async (f) => {
    const subId = 'executeAsync - ' + Math.random().toString(36).substr(2, 9);
    logger.openGroup(subId, id);
    logger.log(subId, `executeAsync`, typeof f, f);
    try {
      const result = await (typeof f === 'function' ? f() : f);
      // console.log('result', result);
      logger.log(subId, 'fulfilled', result);
      return { status: 'fulfilled', value: result };
    } catch (error) {
      logger.warn(subId, 'rejected', error);
      return { status: 'rejected', reason: error };
    } finally {
      logger.closeGroup(subId, id);
    }
  };

  const subId = 'for slicedArray - ' + Math.random().toString(36).substring(7);
  logger.openGroup(subId, id);
  for (let i = 0; i < slicedArray.length; i++) {
    logger.log(subId, 'slicedArray[i]', slicedArray[i]);
    if (!slicedArray[i]) return;
    Promise.all(
      slicedArray[i].map(async (promise) => {
        return handleResult(await executeAsync(promise));
      }),
    ).then(() => {
      logger.log(subId, 'Promise.all finished:', i);
    });

    if (i < slicedArray.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  logger.closeGroup(subId, id);

  // const processNext = async (index) => {
  //   console.log('index', index);
  //   if (index >= arr.length) return;
  //
  //   const f = arr[index];
  //   const result = await executeAsync(f);
  //   handleResult(result);
  //
  //   console.log('arr.length', arr.length, index + 1);
  //   if (index + 1 < arr.length) {
  //     const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 1000));
  //     await timeoutPromise;
  //     console.log('timeoutPromise', index + 1);
  //     return processNext(index + limit);
  //   }
  // };
  //
  // const initialBatch = arr.slice(0, limit);
  // await Promise.all(initialBatch.map((f, i) => processNext(i)));
  logger.log(id, '{ successes, errors }', { successes, errors })
  logger.closeGroup(id);
  return { successes, errors };
}

function serialize(array) {
  return array.join(';');
}
function deserialize(string) {
  return string.split(';');
}

class TaskQueue {
  constructor() {
    this.queue = [];       // Holds tasks waiting to be processed
    this.isProcessing = false;  // Indicates if a task is currently being processed
  }

  // Add a new task to the queue
  enqueue(task) {
    console.log('____________ADD TASK_____________');
    this.queue.push(task);
    this.runNextTask(); // Try to run the next task
  }

  // Try to run the next task in the queue
  runNextTask() {
    if (!this.isProcessing && this.queue.length > 0) {
      console.log('_________START PROCESSING_________', new Date().toTimeString(), this.queue.length);
      this.isProcessing = true;  // Mark as processing
      const task = this.queue.shift();  // Get the next task from the queue
      this.executeWithRetry(task, 3, 1000) // Execute the task with retry logic
          .then(() => {
            this.isProcessing = false; // Mark as not processing
            this.runNextTask(); // Check for and run the next task
          })
          .catch(error => {
            console.error("Error executing task: ", error);
            this.isProcessing = false;
            this.runNextTask(); // Even if there's an error, try to run the next task
          });
    }
  }

  // Execute a task with a given number of retries
  async executeWithRetry(task, retries, delay) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        if (typeof task === 'function') {
          await task(getDateTime(new Date(), true)); // Execute the task (works for both promises and async functions)
        } else {
          await task; // Execute the task (works for both promises and async functions)
        }
        await this.delay(1000); // Wait for 1 second before returning
        return; // If successful, exit the function
      } catch (error) {
        console.error(`Attempt ${attempt} failed: ${error}`);
        if (attempt < retries) {
          await this.delay(delay * attempt); // Exponential backoff
        }
      }
    }
    throw new Error('All attempts failed.'); // If all retries fail, throw an error
  }

  // Utility function to create a delay
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const queue = new TaskQueue();

const euCountries = {
  AT: '🇦🇹', // Austria
  BE: '🇧🇪', // Belgium
  BG: '🇧🇬', // Bulgaria
  HR: '🇭🇷', // Croatia
  CY: '🇨🇾', // Cyprus
  CZ: '🇨🇿', // Czech Republic
  DK: '🇩🇰', // Denmark
  EE: '🇪🇪', // Estonia
  FI: '🇫🇮', // Finland
  FR: '🇫🇷', // France
  DE: '🇩🇪', // Germany
  GR: '🇬🇷', // Greece
  HU: '🇭🇺', // Hungary
  IE: '🇮🇪', // Ireland
  IT: '🇮🇹', // Italy
  LV: '🇱🇻', // Latvia
  LT: '🇱🇹', // Lithuania
  LU: '🇱🇺', // Luxembourg
  MT: '🇲🇹', // Malta
  NL: '🇳🇱', // Netherlands
  PL: '🇵🇱', // Poland
  PT: '🇵🇹', // Portugal
  RO: '🇷🇴', // Romania
  SK: '🇸🇰', // Slovakia
  SI: '🇸🇮', // Slovenia
  ES: '🇪🇸', // Spain
  SE: '🇸🇪', // Sweden
};
