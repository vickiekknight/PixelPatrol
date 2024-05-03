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
          imageBox.innerHTML = '';
          imageBox.appendChild(img);
          // Call your AI detection function here
          detectAI(img);
        };
  
        reader.readAsDataURL(file);
      }
    }
  
    // AI detection function (replace with your actual implementation)
    function detectAI(img) {
      // Perform AI detection on the image
      // Update the resultText with the detection result
      resultText.textContent = 'This is a placeholder result.';
    }
  });