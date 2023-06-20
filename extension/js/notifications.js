
const creationCallback = () => {
  console.log('creationCallback', id);
  // chrome.notifications.clear(id, () => {
  //   console.log('Notification cleared');
  // });
};

const notifyLocal = async () => {
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
    chrome.notifications.create(id, options, creationCallback);
  } catch (e) {
    return console.error(e);
  }
};

const notifyBot = async () => {
  // try {
  return bot.log({ text: msg });
  // } catch (e) {
  //   return console.error(e);
  // }
};

const notifyNewWorks = async () => {
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
}
