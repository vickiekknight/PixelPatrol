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
