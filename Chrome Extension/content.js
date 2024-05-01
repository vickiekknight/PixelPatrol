// Function to detect images on the current page
function detectImagesOnPage() {
    // Get all the image elements on the page
    const images = document.querySelectorAll("img");
  
    // Extract the source URLs of the images
    return Array.from(images).map(img => img.src);
  }
  
  // Send the detected image URLs to the background script
  chrome.runtime.sendMessage({
    action: "detectImages",
    imageUrls: detectImagesOnPage()
  });
  