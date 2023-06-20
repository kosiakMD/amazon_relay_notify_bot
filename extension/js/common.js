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

const saveInterval = createSaveStorageField(intervalField);

const saveWorkStatus = createSaveStorageField(workStatusField);

const saveTestStatus = createSaveStorageField(testStatusField);

const saveNewUIStatus = createSaveStorageField(newUIField);

const saveDarkThemeStatus = createSaveStorageField(darkThemeField);

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
