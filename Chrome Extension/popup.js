let detectAI = document.getElementById('detectAI');

detectAI.addEventListener("click", async () => {
    //alert('This extension detects AI-generated images on Instagram');
    // Get current active tab on Chrome Window
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    // Execute script to parse images on page
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: scrapeImagesFromPage,
    });
})

// Function to scrape images
function scrapeImagesFromPage() {
    alert('Detect AI');
}