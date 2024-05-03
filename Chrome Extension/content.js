function dragOverHandler(event) {
  event.preventDefault(); // Prevent default behavior
}

function dropHandler(event) {
  event.preventDefault(); // Prevent default behavior
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    const imageInput = document.getElementById('imageInput');
    imageInput.files = files; // Update the file input element with the dropped file
    fileSelected(event);
  }
}

async function getImageData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const tensor = tf.browser.fromPixels(imageData, 3);
        resolve(tensor);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function detectImagesOnPage() {
  const images = Array.from(document.querySelectorAll('img'));
  return images.map((img) => img.src);
}

document.addEventListener('DOMContentLoaded', () => {
  const imageInput = document.getElementById('imageInput');
  const detectButton = document.getElementById('detectButton');
  const imageBox = document.getElementById('imageBox');

  detectButton.addEventListener('click', async () => {
    const file = imageInput.files[0];
    if (file) {
      const imageData = await getImageData(file);
      chrome.runtime.sendMessage({ action: 'detectImage', imageData });
    }
  });

  // Add event listeners for drag-and-drop events
  imageBox.addEventListener('dragover', dragOverHandler);
  imageBox.addEventListener('drop', dropHandler);
});

// newgit submodule deinit -f -- 'Chrome Extension/temp-model/Deepfake-Detection' && git rm -f 'Chrome Extension/temp-model/Deepfake-Detection'git submodule deinit -f -- 'Chrome Extension/temp-model/Deepfake-Detection' && git rm -f 'Chrome Extension/temp-model/Deepfake-Detection'git submodule deinit -f -- 'Chrome Extension/temp-model/Deepfake-Detection' && git rm -f 'Chrome Extension/temp-model/Deepfake-Detection'git submodule deinit -f -- 'Chrome Extension/temp-model/Deepfake-Detection' && git rm -f 'Chrome Extension/temp-model/Deepfake-Detection'git submodule deinit -f -- 'Chrome Extension/temp-model/Deepfake-Detection' && git rm -f 'Chrome Extension/temp-model/Deepfake-Detection'
// Load the model
async function loadModel() {
  const modelUrl = chrome.runtime.getURL('./temp-model/Deepfake-Detection/');
  const model = await tf.loadLayersModel(modelUrl);
  return model;
}

// Use the model to detect an image
async function detectImage(imageData) {
  const model = await loadModel();
  const tensor = tf.browser.fromPixels(imageData, 3);
  const predictions = model.predict(tensor);
  // Analyze the predictions to determine the classification
  // ...
}

document.getElementById('detectButton').addEventListener('click', async () => {
  const file = imageInput.files[0];
  if (file) {
    const imageData = await getImageData(file);
    detectImage(imageData);
  }
});