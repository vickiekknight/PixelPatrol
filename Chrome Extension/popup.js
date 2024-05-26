document.addEventListener('DOMContentLoaded', () => {
  const detectButton = document.getElementById('detectButton');
  const imageInput = document.getElementById('imageInput');
  const imageBox = document.getElementById('imageBox');
  const resultText = document.getElementById('resultText');
  let selectedFile = null;

  // Drag and drop handlers
  function dropHandler(event) {
    event.preventDefault();
    if (event.dataTransfer.items) {
      if (event.dataTransfer.items[0].kind === 'file') {
        selectedFile = event.dataTransfer.items[0].getAsFile();
        imageInput.files = event.dataTransfer.files;
      }
    } else {
      selectedFile = event.dataTransfer.files[0];
    }
    updateImageBox(selectedFile);
  }

  function dragOverHandler(event) {
    event.preventDefault();
  }

  function updateImageBox(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imageBox.innerHTML = `<img src="${e.target.result}" alt="Selected Image" class="preview-image">`;
    };
    reader.readAsDataURL(file);
  }

  // File input change handler
  imageInput.addEventListener('change', (event) => {
    selectedFile = event.target.files[0];
    updateImageBox(selectedFile);
  });

  // Detect AI button click handler
  detectButton.addEventListener('click', () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          resultText.textContent = `Error: ${data.error}`;
        } else {
          resultText.innerHTML = `Prediction: ${data.predicted_class} <br> Confidence: ${(data.confidence * 100).toFixed(2)}%`;
        }
      })
      .catch(error => {
        console.error('Error:', error);
        resultText.textContent = 'An error occurred. Please try again.';
      });
    } else {
      alert('Please select an image first.');
    }
  });

  // Event listeners for drag and drop
  imageBox.addEventListener('drop', dropHandler);
  imageBox.addEventListener('dragover', dragOverHandler);
  
  // Click event for the image box to trigger file input
  imageBox.addEventListener('click', () => {
    imageInput.click();
  });
});

