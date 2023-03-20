console.log('____Background ARB');

// Register the service worker
// navigator.serviceWorker.register('js/background.js', {
//   persistent: true,
//   module: 'module',
// });
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('js/background.js', {
    persistent: true,
    module: 'module',
  });
}
