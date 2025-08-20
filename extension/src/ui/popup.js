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
    try {
        chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
            if (changeInfo.status === 'complete' && tab.active) {
                checkCurrentTab();
            }
        });
    } catch (error) {
        console.error('xMatic: Could not add tab update listener:', error);
    }
}

function showExtensionError(message) {
    const status = document.getElementById('extensionStatus');
    if (status) {
        status.innerHTML = `<span class="status-indicator disabled">🔴 ${message}</span>`;
    }
    
    const toggle = document.getElementById('extensionToggle');
    if (toggle) {
        toggle.disabled = true;
        toggle.title = message;
    }
}

function setupExtensionToggle(toggle, status) {
    // Set up toggle change event
    toggle.addEventListener('change', function(e) {
        const isEnabled = e.target.checked;
        
        // Update status display immediately for better UX
        updateExtensionStatus(isEnabled);
        
        // Save to storage with better error handling
        try {
            chrome.storage.sync.set({ extensionEnabled: isEnabled }, function() {
                if (chrome.runtime.lastError) {
                    console.log('xMatic: Sync storage error, trying local storage:', chrome.runtime.lastError);
                    // Try to save to local storage as fallback
                    chrome.storage.local.set({ extensionEnabled: isEnabled }, function() {
                        if (chrome.runtime.lastError) {
                            console.error('xMatic: Both storage methods failed:', chrome.runtime.lastError);
                        } else {
                            console.log('xMatic: Saved to local storage successfully');
                        }
                    });
                } else {
                    console.log('xMatic: Saved to sync storage successfully');
                }
            });
        } catch (error) {
            console.error('xMatic: Storage access error:', error);
            // Try local storage as fallback
            try {
                chrome.storage.local.set({ extensionEnabled: isEnabled });
                console.log('xMatic: Saved to local storage as fallback');
            } catch (localError) {
                console.error('xMatic: Local storage also failed:', localError);
            }
        }
        
        // Only try to send message if we're on a Twitter page and extension context is valid
        try {
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                if (tabs && tabs[0] && (tabs[0].url.includes('twitter.com') || tabs[0].url.includes('x.com'))) {
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
        } catch (error) {
            console.log('xMatic: Could not send message to content script:', error);
        }
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
    try {
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
                try {
                    chrome.storage.local.get(['extensionEnabled'], function(localResult) {
                        if (extensionToggle) {
                            const isEnabled = localResult.extensionEnabled !== false;
                            extensionToggle.checked = isEnabled;
                            updateExtensionStatus(isEnabled);
                        }
                    });
                } catch (localError) {
                    console.error('xMatic: Local storage also failed:', localError);
                    // Set default state if both storage methods fail
                    if (extensionToggle) {
                        extensionToggle.checked = true;
                        updateExtensionStatus(true);
                    }
                }
            }
        });
    } catch (error) {
        console.error('xMatic: Storage access error in loadConfiguration:', error);
        // Set default state if storage access fails
        const extensionToggle = document.getElementById('extensionToggle');
        if (extensionToggle) {
            extensionToggle.checked = true;
            updateExtensionStatus(true);
        }
    }
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
    try {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs && tabs[0]) {
                const isTwitterPage = tabs[0].url && (tabs[0].url.includes('twitter.com') || tabs[0].url.includes('x.com'));
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
            } else {
                console.log('xMatic: No active tab found');
            }
        });
    } catch (error) {
        console.error('xMatic: Error checking current tab:', error);
        // Set default state if tab checking fails
        const extensionToggle = document.getElementById('extensionToggle');
        if (extensionToggle) {
            extensionToggle.disabled = false;
            extensionToggle.title = '';
        }
    }
}

