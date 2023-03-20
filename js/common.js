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

const StatusEnum = {
  SUCCESS: 'SUCCESS',
  FAIL: 'FAIL',
};

const ConfigEnum = {
  on: 'on',
  off: 'off',
};

const MessageTypeEnum = {
  workStatus: 'workStatus',
  testStatus: 'testStatus',
  parse: 'parse',
  config: 'config',
  search: 'search',
  newWorks: 'newWorks',
  getInjectData: 'getInjectData',
  getTabId: 'getTabId',
};

const getWorkStatus = () => {
  return new Promise((resolve) => {
    storage.get([workStatusField], (result) => {
      const workStatus = result[workStatusField];
      console.log('getWorkStatus', workStatus);
      resolve(workStatus);
    });
  });
};
const getTestStatus = () => {
  return new Promise((resolve) => {
    storage.get([testStatusField], (result) => {
      const testStatus = result[testStatusField];
      console.log('getTestStatus', testStatus);
      resolve(testStatus);
    });
  });
};

function success(...fields) {
  console.log(`fields: ${fields.join(', ')} - saved`);
}

const saveInterval = (v) => storage.set(
  {
    [intervalField]: typeof v !== 'undefined'
      ? v : document.getElementById(intervalField).value,
  },
  () => {
    success(intervalField);
  },
);

const saveWorkStatus = (v) => storage.set(
  {
    [workStatusField]: typeof v !== 'undefined'
      ? v : document.getElementById(workStatusField).checked,
  },
  () => {
    success(workStatusField);
  },
);

const saveTestStatus = (v) => storage.set(
  {
    [testStatusField]: typeof v !== 'undefined'
      ? v : document.getElementById(testStatusField).checked,
  },
  () => {
    success(testStatusField);
  },
);

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
  const successes = [];
  const errors = [];

  if (arr.length === 0) {
    return { successes, errors };
  }

  const slicedArray = [];
  for (let i = 0; i < arr.length; i += limit) {
    slicedArray.push(arr.slice(i, i + limit));
  }
  console.log('slicedArray', slicedArray);
  const handleResult = (result) => {
    if (result.status === 'fulfilled') {
      successes.push(result.value);
      if (log) {
        console.log('Success:', result.value);
      }
    } else {
      errors.push(result.reason);
      if (log) {
        console.error(result.reason);
      }
    }
  };

  const executeAsync = async (f) => {
    try {
      const result = await (typeof f === 'function' ? f() : f);
      // console.log('result', result);
      return { status: 'fulfilled', value: result };
    } catch (error) {
      return { status: 'rejected', reason: error };
    }
  };

  for (let i = 0; i < slicedArray.length; i++) {
    console.log('slicedArray[i]', slicedArray[i]);
    if (!slicedArray[i]) return;
    Promise.all(
      slicedArray[i].map(async (promise) => {
        return handleResult(await executeAsync(promise));
      }),
    ).then(() => {
      console.log('Promise.all finished:', i);
    });


    if (i < slicedArray.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

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
console.log('{ successes, errors }', { successes, errors })
  return { successes, errors };
}
