// xMatic - Popup Script

document.addEventListener('DOMContentLoaded', function() {
    // Initialize popup functionality
    initializePopup();
});

function initializePopup() {
    // Get DOM elements
    const extensionToggle = document.getElementById('extensionToggle');
    const extensionStatus = document.getElementById('extensionStatus');

    if (!extensionToggle || !extensionStatus) {
        console.error('xMatic: Required elements not found');
        return;
    }

    // Set up extension toggle functionality
    setupExtensionToggle(extensionToggle, extensionStatus);

    // Load current configuration
    loadConfiguration();
    
    // Check current tab and update status
    checkCurrentTab();
    
    // Listen for tab updates to refresh status
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        if (changeInfo.status === 'complete' && tab.active) {
            checkCurrentTab();
        }
    });
}

function setupExtensionToggle(toggle, status) {
    // Set up toggle change event
    toggle.addEventListener('change', function(e) {
        const isEnabled = e.target.checked;
        
        // Update status display
        updateExtensionStatus(isEnabled);
        
        // Save to storage with error handling
        chrome.storage.sync.set({ extensionEnabled: isEnabled }, function() {
            if (chrome.runtime.lastError) {
                console.error('xMatic: Failed to save extension state:', chrome.runtime.lastError);
                // Try to save to local storage as fallback
                chrome.storage.local.set({ extensionEnabled: isEnabled });
            }
        });
        
        // Only try to send message if we're on a Twitter page
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs[0] && (tabs[0].url.includes('twitter.com') || tabs[0].url.includes('x.com'))) {
                // Send message to content script with error handling
                chrome.tabs.sendMessage(tabs[0].id, { 
                    action: 'toggleExtension', 
                    enabled: isEnabled 
                }).catch(function(error) {
                    // Content script not available, this is normal on non-Twitter pages
                    console.log('xMatic: Content script not available on this page');
                });
            } else {
                console.log('xMatic: Not on Twitter page, skipping content script message');
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





function loadConfiguration() {
    chrome.storage.sync.get([
        'extensionEnabled'
    ], function(result) {
        // Set extension toggle state
        const extensionToggle = document.getElementById('extensionToggle');
        if (extensionToggle) {
            const isEnabled = result.extensionEnabled !== false;
            extensionToggle.checked = isEnabled;
            updateExtensionStatus(isEnabled);
        }
        
        // Handle storage errors gracefully
        if (chrome.runtime.lastError) {
            console.log('xMatic: Sync storage error, trying local storage:', chrome.runtime.lastError);
            // Try local storage as fallback
            chrome.storage.local.get(['extensionEnabled'], function(localResult) {
                if (extensionToggle) {
                    const isEnabled = localResult.extensionEnabled !== false;
                    extensionToggle.checked = isEnabled;
                    updateExtensionStatus(isEnabled);
                }
            });
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

function checkCurrentTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0]) {
            const isTwitterPage = tabs[0].url.includes('twitter.com') || tabs[0].url.includes('x.com');
            const extensionToggle = document.getElementById('extensionToggle');
            
            if (extensionToggle) {
                if (!isTwitterPage) {
                    // Disable toggle on non-Twitter pages
                    extensionToggle.disabled = true;
                    extensionToggle.title = 'xMatic only works on Twitter/X pages';
                    
                    // Update status to show it's not available
                    const status = document.getElementById('extensionStatus');
                    if (status) {
                        status.innerHTML = '<span class="status-indicator disabled">🔴 Not available on this page (Twitter/X only)</span>';
                    }
                } else {
                    // Re-enable toggle on Twitter pages
                    extensionToggle.disabled = false;
                    extensionToggle.title = '';
                    
                    // Reload configuration to show correct status
                    loadConfiguration();
                }
            }
        }
    });
}

