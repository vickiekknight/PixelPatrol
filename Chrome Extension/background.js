chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getImages") {
    chrome.tabs.executeScript(
      {
        code: `
          (function() {
            const url = window.location.href;
            let images = [];
            
            // Check if we are on a specific post
            if (url.match(/\\/p\\/[^\\/]+\\/?/)) {
              images = Array.from(document.querySelectorAll('article div img')).map(img => img.src);
            } else {
              // We are on a profile page
              images = Array.from(document.querySelectorAll('div._aagu img')).map(img => img.src);
            }

            chrome.runtime.sendMessage({ action: 'sendImages', images: images });
          })();
        `,
      },
      () => sendResponse({ status: "executed" })
    );

    // Keep the message channel open for sendResponse
    return true;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sendImages") {
    const imagesContainer = document.getElementById("imagesContainer");
    imagesContainer.innerHTML = ""; // Clear existing images

    request.images.forEach((imageSrc) => {
      const imgElement = document.createElement("img");
      imgElement.src = imageSrc;
      imgElement.style.width = "100px"; // Set desired width
      imagesContainer.appendChild(imgElement);
    });
  }
});