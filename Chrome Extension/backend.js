window.addEventListener('DOMContentLoaded', function() {
  const imageBox = document.getElementById('imageBox');
  const imageInput = document.getElementById('imageInput');
  const resultText = document.getElementById('resultText');

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

        // Create a container for the image and the remove button
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('image-container');

        // Create the image element
        img.classList.add('image-preview');
        imageContainer.appendChild(img);

        // Create the remove button
        const removeButton = document.createElement('button');
        removeButton.classList.add('remove-btn');
        removeButton.textContent = 'X';
        removeButton.addEventListener('click', () => {
          imageContainer.remove();
          // Call your AI detection function here with null to clear the result
          detectAI(null);
          // Show the "Drag and drop an image here or click to select" text
          imageBox.innerHTML = '<p>Drag and drop an image here or click to select</p>';
        });
        imageContainer.appendChild(removeButton);

        // Clear the image box and add the new container
        imageBox.innerHTML = '';
        imageBox.appendChild(imageContainer);

        // Call your AI detection function here
        detectAI(img);
      };

      reader.readAsDataURL(file);
    } else {
      // Show the "Drag and drop an image here or click to select" text
      imageBox.innerHTML = '<p>Drag and drop an image here or click to select</p>';
    }
  }

  // AI detection function (replace with your actual implementation)
  function detectAI(img) {
    // Perform AI detection on the image
    // Update the resultText with the detection result
    if (img) {
      resultText.textContent = 'This is a placeholder result.';
    } else {
      resultText.textContent = '';
    }
  }
});