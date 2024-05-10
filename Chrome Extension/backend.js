chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'detectAI') {
    const imageData = request.imageData;
    sendImageToServer(imageData);
  }
});

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
      // Send the result back to the content script
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'updateResult', isDeepfake: data.is_deepfake });
      });
    })
    .catch(error => console.error('Error:', error));
}