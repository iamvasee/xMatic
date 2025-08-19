// xMatic - Popup Script

document.addEventListener('DOMContentLoaded', function() {
    // Initialize popup functionality
    initializePopup();
});

function initializePopup() {
    // Get DOM elements
    const extensionToggle = document.getElementById('extensionToggle');
    const extensionStatus = document.getElementById('extensionStatus');
    const saveButton = document.getElementById('saveConfig');

    if (!extensionToggle || !extensionStatus) {
        console.error('xMatic: Required elements not found');
        return;
    }

    // Set up extension toggle functionality
    setupExtensionToggle(extensionToggle, extensionStatus);

    // Set up form submission
    setupFormSubmission(saveButton);

    // Load current configuration
    loadConfiguration();
}

function setupExtensionToggle(toggle, status) {
    // Set up toggle change event
    toggle.addEventListener('change', function(e) {
        const isEnabled = e.target.checked;
        
        // Update status display
        updateExtensionStatus(isEnabled);
        
        // Save to storage
        chrome.storage.sync.set({ extensionEnabled: isEnabled });
        
        // Send message to content script
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { 
                    action: 'toggleExtension', 
                    enabled: isEnabled 
                });
            }
        });
    });

    // Set up toggle click event for better UX
    toggle.addEventListener('click', function(e) {
        // Prevent default to handle manually
        e.preventDefault();
        
        // Toggle the checked state
        const newState = !e.target.checked;
        e.target.checked = newState;
        
        // Trigger change event
        const changeEvent = new Event('change');
        e.target.dispatchEvent(changeEvent);
    });

    // Set up toggle mousedown for visual feedback
    toggle.addEventListener('mousedown', function(e) {
        e.target.style.transform = 'scale(0.95)';
    });

    toggle.addEventListener('mouseup', function() {
        this.style.transform = 'scale(1)';
    });

    toggle.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
}

function setupFormSubmission(saveButton) {
    if (saveButton) {
        saveButton.addEventListener('click', function(e) {
            e.preventDefault();
            saveExtensionSettings();
        });
    }
}

function saveExtensionSettings() {
    const extensionEnabled = document.getElementById('extensionToggle').checked;
    
    const config = {
        extensionEnabled: extensionEnabled
    };
    
    // Save to storage
    chrome.storage.sync.set(config, function() {
        if (chrome.runtime.lastError) {
            console.error('xMatic: Error saving extension settings:', chrome.runtime.lastError);
            showNotification('Error saving settings. Please try again.', 'error');
        } else {
            // Show success message
            showNotification('Extension settings saved successfully!', 'success');
            
            // Send message to content script
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { 
                        action: 'extensionSettingsUpdated', 
                        config: config 
                    });
                }
            });
        }
    });
}

function loadConfiguration() {
    chrome.storage.sync.get([
        'extensionEnabled'
    ], function(result) {
        // Set extension toggle state
        const extensionToggle = document.getElementById('extensionToggle');
        if (extensionToggle) {
            extensionToggle.checked = result.extensionEnabled !== false;
            updateExtensionStatus(result.extensionEnabled !== false);
        }
    });
}

function updateExtensionStatus(isEnabled) {
    const status = document.getElementById('extensionStatus');
    if (status) {
        if (isEnabled) {
            status.innerHTML = '<span class="status-indicator enabled">🟢 Extension is currently active</span>';
            status.className = 'extension-status';
        } else {
            status.innerHTML = '<span class="status-indicator disabled">🔴 Extension is currently disabled</span>';
            status.className = 'extension-status';
        }
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to popup
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}