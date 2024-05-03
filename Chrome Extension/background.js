import { loadModel, detectAIImage, detectDeepfake } from './ai_detector.js';

let aiModel;
let deepfakeModel;

async function loadModels() {
  try {
    aiModel = await loadModel('path/to/ai/model.json');
    deepfakeModel = await loadModel('path/to/deepfake/model.json');
  } catch (error) {
    console.error('Error loading models:', error);
  }
}

loadModels();

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'detectImage') {
    if (aiModel && deepfakeModel) {
      const imageData = request.imageData;
      const isAI = await detectAIImage(imageData, aiModel);
      const isDeepfake = await detectDeepfake(imageData, deepfakeModel);
      sendResponse({ isAI, isDeepfake });
    } else {
      sendResponse({ error: 'Models are not yet loaded.' });
    }
  }
  return true;
});