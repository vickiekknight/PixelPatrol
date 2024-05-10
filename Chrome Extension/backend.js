chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'detectAI') {
    const imageData = request.imageData;
    sendImageToServer(imageData);
  }
});

function sendImageToServer(imageData) {
  const blob = dataURLtoBlob(imageData);
  const formData = new FormData();
  formData.append('file', blob);

  fetch('http://localhost:5000/detect', {
    method: 'POST',
    body: formData,
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('HTTP Error ' + response.status);
      }
      return response.json();
    })
    .then(result => {
      // Process the response as needed
      console.log('Detection result:', result.is_deepfake);

      // Send the result back to the content script
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'updateResult', isDeepfake: result.is_deepfake });
      });
    })
    .catch(error => console.error('Error:', error));
}

function dataURLtoBlob(dataURL) {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}