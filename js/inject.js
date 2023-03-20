// this.console.log = console.log.bind(this, '____Inject');
/**
 * code in inject.js
 * added "web_accessible_resources": ["injected.js"] to manifest.json
 */
const s = document.createElement('script');

console.log('\n\tchrome.runtime.id', chrome.runtime.id);

// s.src = chrome.extension.getInjectData('js/injected.js');
chrome.runtime.sendMessage({
  type: MessageTypeEnum.getInjectData,
  payload: 'js/injected.js',
}, function (response) {
  console.log('\n\tresponse', MessageTypeEnum.getInjectData, response);
  s.id = 'injected';
  s.src = response.url;
  s.dataset.ex = chrome.runtime.id;
  s.dataset.workStatus = response.workStatus;
  s.dataset.testStatus = response.testStatus;
});

s.onload = function () {
  this.remove();
};

(document.head || document.documentElement).appendChild(s);
