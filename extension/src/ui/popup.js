// xMatic - Popup Script

document.addEventListener('DOMContentLoaded', function() {
    // Initialize popup functionality
    initializePopup();
});

function initializePopup() {
    // Get DOM elements
    const extensionToggle = document.getElementById('extensionToggle');
    const extensionStatus = document.getElementById('extensionStatus');
    const providerButtons = document.querySelectorAll('[data-provider]');
  const modelSelect = document.getElementById('modelSelect');
  const styleSelect = document.getElementById('styleSelect');
    const saveButton = document.getElementById('saveButton');
    const resetButton = document.getElementById('resetButton');

    if (!extensionToggle || !extensionStatus) {
        console.error('xMatic: Required elements not found');
        return;
    }

    // Set up extension toggle functionality
    setupExtensionToggle(extensionToggle, extensionStatus);

    // Set up provider selection
    setupProviderSelection(providerButtons, modelSelect);

    // Set up form submission
    setupFormSubmission(saveButton, resetButton);

    // Load current configuration
    loadConfiguration();
}

function setupExtensionToggle(toggle, status) {
    // Set up toggle change event
    toggle.addEventListener('change', function(e) {
        const isEnabled = e.target.checked;
        
        // Update status display
        status.textContent = isEnabled ? 'Enabled' : 'Disabled';
        status.className = isEnabled ? 'status-enabled' : 'status-disabled';
        
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

function setupProviderSelection(providerButtons, modelSelect) {
    providerButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            const selectedProvider = event.target.getAttribute('data-provider');
            
            // Update active state
            providerButtons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            // Update model options based on provider
            updateModelOptions(selectedProvider, modelSelect);
            
            // Save selection
            chrome.storage.sync.set({ selectedProvider: selectedProvider });
        });
    });
}

function updateModelOptions(provider, modelSelect) {
    // Clear existing options
    modelSelect.innerHTML = '';
    
    let models = [];
    
    if (provider === 'openai') {
        models = [
            { value: 'gpt-4', label: 'GPT-4 (Most Capable)' },
            { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (Fast & Capable)' },
            { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Fast & Efficient)' }
        ];
    } else if (provider === 'grok') {
        models = [
            { value: 'grok-beta', label: 'Grok Beta (Latest)' },
            { value: 'grok-1', label: 'Grok-1 (Stable)' }
        ];
    }
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a model...';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    modelSelect.appendChild(defaultOption);
    
    // Add model options
    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.value;
        option.textContent = model.label;
        modelSelect.appendChild(option);
    });
}

function setupFormSubmission(saveButton, resetButton) {
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            saveConfiguration();
        });
    }
    
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            resetConfiguration();
        });
    }
}

function saveConfiguration() {
    const formData = new FormData(document.getElementById('configForm'));
    const selectedProvider = formData.get('provider');
    const selectedModel = formData.get('model');
    const selectedStyleType = formData.get('styleType');
    const extensionEnabled = document.getElementById('extensionToggle').checked;
    
    const config = {
        selectedProvider,
        selectedModel,
        selectedStyleType,
        extensionEnabled
    };
    
    // Save to storage
    chrome.storage.sync.set(config, function() {
        if (chrome.runtime.lastError) {
            console.error('xMatic: Error saving configuration:', chrome.runtime.lastError);
            alert('Error saving configuration. Please try again.');
        } else {
            // Show success message
            showNotification('Configuration saved successfully!', 'success');
            
            // Send message to content script
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { 
                        action: 'configUpdated', 
                        config: config 
                    });
                }
            });
        }
    });
}

function resetConfiguration() {
    if (confirm('Are you sure you want to reset all configuration to defaults?')) {
        const defaultConfig = {
            selectedProvider: 'openai',
            selectedModel: 'gpt-4',
            selectedStyleType: 'conversational and helpful',
            extensionEnabled: true
        };
        
        chrome.storage.sync.set(defaultConfig, function() {
            if (chrome.runtime.lastError) {
                console.error('xMatic: Error resetting configuration:', chrome.runtime.lastError);
                alert('Error resetting configuration. Please try again.');
  } else {
                // Reload popup to reflect changes
                window.location.reload();
            }
        });
    }
}

function loadConfiguration() {
    chrome.storage.sync.get([
        'extensionEnabled',
        'selectedProvider',
        'selectedModel',
        'selectedStyleType'
    ], function(result) {
        // Set extension toggle state
        const extensionToggle = document.getElementById('extensionToggle');
        if (extensionToggle) {
            extensionToggle.checked = result.extensionEnabled !== false;
            updateExtensionStatus(result.extensionEnabled !== false);
        }
        
        // Set provider selection
        if (result.selectedProvider) {
            const providerButton = document.querySelector(`[data-provider="${result.selectedProvider}"]`);
            if (providerButton) {
                providerButton.click(); // This will trigger the click event and update models
            }
        }
        
        // Set model selection
        if (result.selectedModel && result.selectedProvider) {
            const modelSelect = document.getElementById('modelSelect');
            if (modelSelect) {
                // Wait for models to be populated
  setTimeout(() => {
                    modelSelect.value = result.selectedModel;
                }, 100);
            }
        }
        
        // Set style selection
        if (result.selectedStyleType) {
            const styleSelect = document.getElementById('styleSelect');
            if (styleSelect) {
                styleSelect.value = result.selectedStyleType;
            }
        }
    });
}

function updateExtensionStatus(isEnabled) {
    const status = document.getElementById('extensionStatus');
    if (status) {
        status.textContent = isEnabled ? 'Enabled' : 'Disabled';
        status.className = isEnabled ? 'status-enabled' : 'status-disabled';
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