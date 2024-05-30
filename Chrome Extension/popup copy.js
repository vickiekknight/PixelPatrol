document.addEventListener('DOMContentLoaded', () => {
  const detectButton = document.getElementById('detectButton');
  const imageBox = document.getElementById('imageBox');
  const resultText = document.getElementById('resultText');
  let selectedImageUrl = null;

  // Function to parse HTML and extract image URLs
  function parseHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const images = doc.querySelectorAll('img');
    const imageUrls = Array.from(images).map(img => img.src);

    // Filter images based on URL patterns to exclude logos and icons
    const filteredImageUrls = imageUrls.filter(url => !url.includes('logo') && !url.includes('icon') && !url.includes('sprite') && url.includes('instagram'));

    return filteredImageUrls;
  }

  // Fetch HTML content from current tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'getPageHTML' }, (response) => {
      if (response && response.pageHTML) {
        const imageUrls = parseHTML(response.pageHTML);
        if (imageUrls.length > 0) {
          displayImages(imageUrls);
        } else {
          imageBox.innerHTML = '<p>No images found on this page.</p>';
        }
      } else {
        imageBox.innerHTML = '<p>Failed to fetch HTML content.</p>';
      }
    });
  });

  // Function to display fetched images
  function displayImages(imageUrls) {
    imageBox.innerHTML = '';
    imageUrls.forEach(url => {
      const img = document.createElement('img');
      img.src = url;
      img.className = 'thumbnail';
      img.onload = () => { // Ensure we only display images that are actually loaded
        if (img.naturalWidth > 100 && img.naturalHeight > 100) {
          img.onclick = () => selectImage(url);
          imageBox.appendChild(img);
        }
      };
    });
  }

  // Function to select an image
  function selectImage(url) {
    selectedImageUrl = url;
    const selectedImageBox = document.getElementById('selectedImageBox');
    selectedImageBox.innerHTML = `<img src="${url}" class="thumbnail"><p>Selected Image</p>`;
  }

  // Detect AI button click handler
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
});
