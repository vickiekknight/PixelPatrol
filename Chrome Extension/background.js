import { detectAIImage, detectDeepfake } from './ai_detector.js';

chrome.browserAction.onClicked.addListener(function(tab) {
  // Execute a content script on the current tab to detect images
  chrome.tabs.executeScript({
    file: "content.js"
  });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "detectImage") {
    const imageData = request.imageData;
    const detectionResults = {
      isAIGenerated: await detectAIImage(imageData),
      isDeepfake: await detectDeepfake(imageData)
    };
    sendResponse({ results: detectionResults });
  }
});
