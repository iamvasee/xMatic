// xMatic - Popup Script

document.addEventListener('DOMContentLoaded', function() {
    // Initialize popup functionality
    initializePopup();
});

function initializePopup() {
    // Check if extension context is valid
    if (!chrome || !chrome.runtime || !chrome.runtime.id) {
        console.error('xMatic: Extension context is invalid');
        showExtensionError('Extension context is invalid. Please reload the extension.');
        return;
    }

    // Popup is now just for displaying instructions
    console.log('xMatic: Popup initialized - showing usage instructions');
}

function showExtensionError(message) {
    console.error('xMatic:', message);
}

