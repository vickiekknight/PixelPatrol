chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageHTML') {
    console.log("Content script running on page: ", document.location.href);
    sendResponse({ pageHTML: document.documentElement.outerHTML });
  }
});



