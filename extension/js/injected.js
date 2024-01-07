// alert("Hello, world!");

/*(function(xhr = XMLHttpRequest) {
 console.log('xhr', new XMLHttpRequest().send);
 // function inject(xhr) {

 var XHR = xhr.prototype;

 var open = XHR.open;
 var send = XHR.send;
 var setRequestHeader = XHR.setRequestHeader;

 XHR.open = function(method, url) {
 this._method = method;
 this._url = url;
 this._requestHeaders = {};
 this._startTime = (new Date()).toISOString();

 console.log('\n\topen')
 return open.apply(this, arguments);
 };

 XHR.setRequestHeader = function(header, value) {
 console.log('\n\tsetRequestHeader')
 this._requestHeaders[header] = value;
 return setRequestHeader.apply(this, arguments);
 };

 XHR.send = function(postData) {
 console.log('\n\tsend')

 this.addEventListener('load', function() {
 var endTime = (new Date()).toISOString();
 console.log('\n\tresponse', this.response);
 console.log('\n\tresponseType', this.responseType);

 var myUrl = this._url ? this._url.toLowerCase() : this._url;
 if(myUrl) {

 if (postData) {
 if (typeof postData === 'string') {
 try {
 // here you get the REQUEST HEADERS, in JSON format, so you can also use JSON.parse
 this._requestHeaders = postData;
 } catch(err) {
 console.log('\n\tRequest Header JSON decode failed, transfer_encoding field could be base64');
 console.log('\n\terr', err);
 }
 } else if (typeof postData === 'object' || typeof postData === 'array' || typeof postData === 'number' || typeof postData === 'boolean') {
 // do something if you need
 console.log('\n\t POST not string')
 }
 }

 // here you get the RESPONSE HEADERS
 var responseHeaders = this.getAllResponseHeaders();

 if ( this.responseType != 'blob' && this.responseText) {
 // responseText is string or null
 try {

 // here you get RESPONSE TEXT (BODY), in JSON format, so you can use JSON.parse
 var arr = this.responseText;

 // printing url, request headers, response headers, response body, to console

 console.log('\n\tthis._url', this._url);
 console.log('\n\tJSON.parse(this._requestHeaders)', JSON.parse(this._requestHeaders));
 console.log('\n\tresponseHeaders', responseHeaders);
 console.log('\n\tJSON.parse(arr)', JSON.parse(arr));

 } catch(err) {
 console.log("Error in responseType try catch");
 console.log(err);
 }
 }

 }
 });

 return send.apply(this, arguments);
 };
 console.log('xhr2', new XMLHttpRequest().send);
 })(XMLHttpRequest);*/

// var _r;

// console.log('extensionId', extensionId);

const workUrl = 'https://relay.amazon.de/api/loadboard/search';

// const interceptUrls = [workUrl];
// (/api\/loadboard\/search/).test(_r.url)

const TEST = true;

(function (_f = fetch) {
  this.console.log = console.log.bind(this, '____Injected\n\t');
  const selfScript = document.getElementById('injected');
  const extensionId = selfScript.dataset.ex;
  const workStatus = selfScript.dataset.workStatus;
  const testStatus = selfScript.dataset.testStatus;
  const newUIStatus = selfScript.dataset.newUIStatus;
  // self[extensionId] = {
  //   test: false,
  // };
  const _fetch = _f;
  const config = {
    workStatus: workStatus,
    testStatus: testStatus,
    newUIStatus: newUIStatus,
    extensionId: extensionId,
  };
  console.log('config', config);

  window.addEventListener('message', function (event) {
    // console.log('\n\tevent', event);
    // filter out messages not sent from this extension
    if (event.source === window && event.data.ex === extensionId) {
      console.group('Event Listener at injected.js', extensionId)
      if (event.data.type === 'workStatus') {
        console.log('injected event workStatus', event.data);
        config.workStatus = event.data.payload;
      }
      if (event.data.type === 'testStatus') {
        console.log('injected event testStatus', event.data);
        config.testStatus = event.data.payload;
      }
      if (event.data.type === 'newUIStatus') {
        console.log('injected event newUIStatus', event.data);
        config.newUIStatus = event.data.payload;
      }
    }
    console.groupEnd();
  }, false);

  /**
   * @typedef {{
   *    response: {
   *      workOpportunities: Work[],
   *    },
   *    requestBody: {
   *      originCity: {
   *        displayValue: string,
   *      },
   *    }
   * }} DATA
   * */
  /**
   * @typedef {{
   *    type:MessageTypeEnum,
   *    data:DATA,
   *    ex:string,
   *  }} SearchMessage
   * */
  /**
   * @param {Response} response
   * @param {RequestInit} request
   * */
  const handler = async (response, request) => {
    if (!config.workStatus && !config.testStatus) return response;
    // _r = response;
    // console.log('\t\nfetch response', response);
    // if (interceptUrls.includes(response.url)) {
    if (response.url === workUrl) {
      const _r = response.clone();
      if (response.ok) {
        const data = {
          response: await _r.json(),
          requestBody: JSON.parse(request.body),
        };
        console.log('fetch ok', data);
        try {
          window.postMessage({ type: 'search', data: data, ex: extensionId });
        } catch (err) {
          console.error('chrome.runtime.sendMessage error', err);
        }
      } else {
        console.error('fetch error', await _r.error());
      }
    }
    return response;
  };

  fetch = function (resource, options) {
    console.log('fetch request', resource, options);
    return _fetch.apply(this, [resource, options]).then((response) => handler(response, options));
  };
})(fetch);
