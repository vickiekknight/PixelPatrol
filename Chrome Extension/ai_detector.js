import * as tf from '@tensorflow/tfjs';

const aiModelPath = 'path/to/ai/model.json';
const deepfakeModelPath = 'path/to/deepfake/model.json';

async function loadModel(modelPath) {
  try {
    const model = await tf.loadLayersModel(modelPath);
    console.log(`${modelPath} loaded successfully.`);
    return model;
  } catch (error) {
    console.error(`Error loading ${modelPath}: ${error}`);
    throw error;
  }
}

async function detectAIImage(imageData, aiModel) {
  const tensor = tf.browser.fromPixels(imageData);
  const prediction = await aiModel.predict(tensor);
  tensor.dispose();
  return prediction.dataSync()[0] > 0.5;
}

async function detectDeepfake(imageData, deepfakeModel) {
  const tensor = tf.browser.fromPixels(imageData);
  const prediction = await deepfakeModel.predict(tensor);
  tensor.dispose();
  return prediction.dataSync()[0] > 0.5;
}

export { loadModel, detectAIImage, detectDeepfake };