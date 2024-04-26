document.addEventListener("DOMContentLoaded", function() {
    // "Detect AI" and "Scan Image" button elements
    let detectAIButton = document.getElementById('detectAI');
    let scanImageButton = document.getElementById('scanImage');
  
    // Add click event listeners to the buttons
    detectAIButton.addEventListener("click", async () => {
      // Scan image and detect AI functionality
      await scanImageAndDetectAI();
    });
  
    scanImageButton.addEventListener("click", () => {
      // No functionality yet for the "Scan Image" button
      // Planning to implement crop/select feature
    });
  
    async function scanImageAndDetectAI() {
      // Get the current active tab
      let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
      // Execute a script to detect images on the current page
      const images = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: detectImagesOnPage
      });
  
      // Display the detected images in extension's UI
      displayImageList(images);
  
      // Perform AI detection on the selected image
      await performAIDetection();
    }
  
    function detectImagesOnPage() {
      // Get all the image elements on the page
      const images = document.querySelectorAll("img");
  
      // Extract the source URLs of the images
      return Array.from(images).map(img => img.src);
    }
  
    function displayImageList(imageUrls) {
      // Create a list of images in your extension's UI
      // and allow the user to select a portion to search with Google Lens
      const imageList = document.getElementById("imageList");
      imageList.innerHTML = "";
  
      for (const url of imageUrls) {
        const img = document.createElement("img");
        img.src = url;
        img.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          searchImageOnGoogleLens(url);
        });
        img.addEventListener("mousedown", onImageMouseDown);
        imageList.appendChild(img);
      }
    }
  
    function onImageMouseDown(e) {
      let startX = e.clientX - e.target.offsetLeft;
      let startY = e.clientY - e.target.offsetTop;
  
      e.target.addEventListener("mousemove", onImageMouseMove);
      e.target.addEventListener("mouseup", onImageMouseUp);
  
      function onImageMouseMove(e) {
        // Update the selection box as the user drags
        let width = e.clientX - e.target.offsetLeft - startX;
        let height = e.clientY - e.target.offsetTop - startY;
        e.target.style.border = "1px solid blue";
        e.target.style.width = width + "px";
        e.target.style.height = height + "px";
      }
  
      function onImageMouseUp() {
        // Capture the user's selected area coordinates
        let x1 = startX;
        let y1 = startY;
        let x2 = e.clientX - e.target.offsetLeft;
        let y2 = e.clientY - e.target.offsetTop;
  
        // Perform the desired actions on the cropped area
        performActionOnCroppedArea(e.target.src, x1, y1, x2 - x1, y2 - y1);
  
        // Reset the selection box
        e.target.style.border = "none";
        e.target.style.width = "auto";
        e.target.style.height = "auto";
  
        e.target.removeEventListener("mousemove", onImageMouseMove);
        e.target.removeEventListener("mouseup", onImageMouseUp);
      }
    }
  
    async function performAIDetection() {
      // Capture the user's selected image
      const selectedImage = document.querySelector("#imageList img.selected");
      if (selectedImage) {
        const imageUrl = selectedImage.src;
        let croppedImageData = await getCroppedImageData(imageUrl, 0, 0, selectedImage.width, selectedImage.height);
        let aiDetectionResult = await detectAIInImage(croppedImageData);
        displayAIDetectionResult(aiDetectionResult);
        visualizeAIGeneratedContent(croppedImageData, aiDetectionResult);
      }
    }
  
    function getCroppedImageData(imageUrl, x1, y1, width, height) {
      // Implement logic to crop the image and return the image data
      // Can use the HTML5 canvas API or a library like canvas-to-blob
      // to perform the cropping and return the cropped image data
    }
  
    function detectAIInImage(imageData) {
      // Implement AI detection logic
      // Return the AI detection result
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(new Array(100 * 100).fill(0.8));
        }, 1000);
      });
    }
  
    function visualizeAIGeneratedContent(imageData, aiDetectionResult) {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
  
      // Load the cropped image onto the canvas
      const img = new Image();
      img.src = imageData;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
  
        // Overlay the AI detection results on the canvas
        for (let y = 0; y < img.height; y++) {
          for (let x = 0; x < img.width; x++) {
            let likelihood = aiDetectionResult[y * img.width + x];
            if (likelihood > 0.5) {
              ctx.fillStyle = `rgba(255, 0, 0, ${likelihood})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        }
  
        // Display the canvas in your extension's UI
        const aiContentContainer = document.getElementById('aiContentContainer');
        aiContentContainer.innerHTML = '';
        aiContentContainer.appendChild(canvas);
      };
    }
  
    function displayAIDetectionResult(result) {
      // Display AI detection result in extension's UI
      console.log("AI detection result:", result);
    }
  
    function searchImageOnGoogleLens(imageUrl) {
      // (existing searchImageOnGoogleLens function)
    }
  });