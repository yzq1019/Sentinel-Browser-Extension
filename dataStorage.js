// Create a new file named dataStorage.js and add the following JavaScript code to it.

// Remove generateAndStoreKeyPair and all key pair/signature logic

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {

  // Get the form and the save button
  const multiRatingForm = document.querySelector('.multi-rating');
  const saveButton = document.querySelector('button[type="submit"][form="multi-rating"]');

  // Add an event listener for the form submission (triggered by the save button)
  if (saveButton) { // Ensure the button exists
    saveButton.addEventListener('click', function(event) {
      // Prevent the default form submission
      event.preventDefault();

      console.log('SAVE button clicked. Collecting data...');

      // Get current URL
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const currentUrl = tabs[0].url;
        console.log('Current URL:', currentUrl);

        // Get rating data from score bars
        const ratings = {};
        document.querySelectorAll('.score-bar-container').forEach(bar => {
          const type = bar?.dataset?.name;
          const input = bar?.querySelector?.('input[type="hidden"]');
          if (type && input && typeof input.value !== 'undefined') {
            ratings[type] = parseInt(input.value, 10);
          } else {
            console.warn('Invalid score-bar-container or missing input:', bar);
          }
        });
        console.log('Collected Ratings:', ratings);

        // Get other data from input fields
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        const commentInput = document.getElementById('comment');
        const username = usernameInput ? usernameInput.value : '';
        const email = emailInput ? emailInput.value : '';
        const comment = commentInput ? commentInput.value : '';
        const now = new Date();
        const time = now.toISOString().slice(0, 19);

        // Construct the JSON object based on the template
        let ratingData = {
          URL: currentUrl,
          Username: username,
          Ratings: ratings,
          Comment: comment,
          Time: time,
          Email: email,
        };

        console.log('Constructed JSON data:', ratingData);

        // Get existing ratings for this URL or initialize an empty array
        chrome.storage.local.get([currentUrl], function(result) {
          const websiteRatings = result[currentUrl] || [];
          websiteRatings.push(ratingData);
          console.log('Attempting to save data with key:', currentUrl, 'and value:', websiteRatings);
          chrome.storage.local.set({[currentUrl]: websiteRatings}, function() {
            console.log('Rating data saved successfully for URL:', currentUrl);
            const successMessageDiv = document.getElementById('success-message');
            if (successMessageDiv) {
              successMessageDiv.textContent = 'Submitted successfully';
              successMessageDiv.style.display = 'block';
              setTimeout(() => {
                successMessageDiv.style.display = 'none';
              }, 3000);
            }
            alert('Ratings Saved！');
            chrome.storage.local.get(currentUrl, function(retrievedData) {
              console.log('Verification: Retrieved data for key:', currentUrl, retrievedData);
            });
          });
        });
      });
    });
  }
});

// Helper function to convert ArrayBuffer to Base64 (Simplified)
// Note: For robust Base64 encoding, consider a dedicated library.
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
} 