document.addEventListener('DOMContentLoaded', () => {
  const detectButton = document.getElementById('detectButton');
  const imageBox = document.getElementById('imageBox');
  const resultText = document.getElementById('resultText');
  let selectedImageUrl = null;

  function parseHTML(html, isPost) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const imageUrls = [];
    let order = 0;

    const postImageClassList = [
      'x5yr21d', 'xu96u03', 'x10l6tqk', 'x13vifvy', 'x87ps6o', 'xh8yej3'
    ];

    function isPostImage(img) {
      const classList = Array.from(img.classList);
      return postImageClassList.every(className => classList.includes(className));
    }

    if (isPost) {
      const images = doc.querySelectorAll('article img');
      images.forEach(img => {
        if (img && isPostImage(img)) {
          imageUrls.push({
            src: img.src,
            order: order++,
          });
        }
      });
    } else {
      const images = doc.querySelectorAll('div._aagu img');
      images.forEach(img => {
        if (img && isPostImage(img)) {
          imageUrls.push({
            src: img.src,
            order: order++,
          });
        }
      });
    }

    return imageUrls.filter(image => image.src);
  }

  function fetchCurrentTabHTML() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getPageHTML' }, (response) => {
        if (response && response.pageHTML) {
          const isPost = tabs[0].url.includes('/p/');
          const imageUrls = parseHTML(response.pageHTML, isPost);
          if (imageUrls.length > 0) {
            loadImages(imageUrls);
          } else {
            imageBox.innerHTML = '<p>No images found on this page.</p>';
          }
        } else {
          imageBox.innerHTML = '<p>Failed to fetch HTML content.</p>';
        }
      });
    });
  }

  function loadImages(imageUrls) {
    const loadedImages = [];
    imageUrls.forEach(({ src, order }) => {
      const img = new Image();
      img.src = src;
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        loadedImages.push({ src, order });
        if (loadedImages.length === imageUrls.length) {
          displayImages(loadedImages);
        }
      };
      img.onerror = () => {
        if (loadedImages.length === imageUrls.length) {
          displayImages(loadedImages);
        }
      };
    });
  }

  function displayImages(loadedImages) {
    imageBox.innerHTML = '';
    loadedImages.sort((a, b) => a.order - b.order);
    loadedImages.forEach(({ src, order }) => {
      const img = document.createElement('img');
      img.src = src;
      img.crossOrigin = 'anonymous';
      img.className = 'thumbnail';
      img.dataset.order = order;
      img.onclick = () => selectImage(src);
      imageBox.appendChild(img);
    });
  }

  function selectImage(url) {
    selectedImageUrl = url;
    const selectedImageBox = document.getElementById('selectedImageBox');
    selectedImageBox.innerHTML = `<img src="${url}" class="thumbnail" crossorigin="anonymous"><p>Selected Image</p>`;
  }

  detectButton.addEventListener('click', () => {
    if (selectedImageUrl) {
      fetch(`http://127.0.0.1:8000/proxy?url=${encodeURIComponent(selectedImageUrl)}`)
        .then(res => res.blob())
        .then(blob => {
          const formData = new FormData();
          formData.append('file', blob, 'image.jpg');

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
        })
        .catch(error => {
          console.error('Error fetching image:', error);
          resultText.textContent = 'An error occurred while fetching the image. Please try again.';
        });
    } else {
      alert('Please select an image first.');
    }
  });

  fetchCurrentTabHTML();

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
      fetchCurrentTabHTML();
    }
  });

  chrome.tabs.onActivated.addListener((activeInfo) => {
    fetchCurrentTabHTML();
  });
});