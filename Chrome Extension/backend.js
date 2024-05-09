document.addEventListener('DOMContentLoaded', function() {
  const imageBox = document.getElementById('imageBox');
  
  const imageInput = document.getElementById('imageInput');

  // Allow dropping files
  imageBox.addEventListener('dragover', dragOverHandler);
  imageBox.addEventListener('drop', dropHandler);

  // Handle file selection
  imageInput.addEventListener('change', handleFileSelect);

  // Drag over handler
  function dragOverHandler(e) {
    e.preventDefault();
  }

  // Drop handler
  function dropHandler(e) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFiles(files);
  }

  // Handle file selection
  function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
  }

  // Handle files
  function handleFiles(files) {
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.src = e.target.result;
        imageBox.innerHTML = '';
        imageBox.appendChild(img);
        // Call your AI detection function here
        detectAI(img);
      };
      reader.readAsDataURL(file);
    }
  }

  function sendImageToServer(imageData) {
    fetch('http://localhost:5000/detect', {
      method: 'POST',
      body: imageData,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    })
      .then(response => response.json())
      .then(data => {
        console.log('Detection result:', data.is_deepfake);
        updateUIWithResult(data.is_deepfake);
      })
      .catch(error => console.error('Error:', error));
  }

  function detectAI(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
    // Call the sendImageToServer function with the image data
    sendImageToServer(imageData);
  }

  function updateUIWithResult(isDeepfake) {
    const resultText = document.getElementById('resultText');
    if (isDeepfake) {
      resultText.textContent = 'This image is likely a deepfake.';
    } else {
      resultText.textContent = 'This image is likely not a deepfake.';
    }
  }
});