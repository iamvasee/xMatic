document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('configForm');
  const saveButton = document.getElementById('saveConfig');
  
  // Load saved configuration
  try {
    const config = await chrome.storage.sync.get(['openaiKey', 'style']);
    
    if (config.openaiKey) {
      document.getElementById('openaiKey').value = config.openaiKey;
    }
    if (config.style) {
      document.getElementById('style').value = config.style;
    }
  } catch (error) {
    showStatus('Failed to load configuration', 'error');
  }
  
  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const openaiKey = document.getElementById('openaiKey').value.trim();
    const style = document.getElementById('style').value.trim();
    
    // Clear previous error states
    clearErrors();
    
    // Validation
    if (!openaiKey) {
      setFieldError('apiKeyGroup', 'OpenAI API key is required');
      showStatus('Please provide your OpenAI API key', 'error');
      return;
    }
    
    if (!openaiKey.startsWith('sk-')) {
      setFieldError('apiKeyGroup', 'Invalid API key format');
      showStatus('Please enter a valid OpenAI API key', 'error');
      return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
      await chrome.storage.sync.set({
        openaiKey,
        style: style || 'Be conversational and helpful. Add genuine value to discussions while keeping responses under 280 characters.'
      });
      
      showStatus('Configuration saved successfully', 'success');
      
    } catch (error) {
      showStatus('Failed to save configuration', 'error');
    } finally {
      setLoadingState(false);
    }
  });
});

function setLoadingState(loading) {
  const button = document.getElementById('saveConfig');
  
  if (loading) {
    button.disabled = true;
    button.classList.add('loading');
  } else {
    button.disabled = false;
    button.classList.remove('loading');
  }
}

function setFieldError(groupId, message) {
  const group = document.getElementById(groupId);
  group.classList.add('error');
  
  // Remove error state after 3 seconds
  setTimeout(() => {
    group.classList.remove('error');
  }, 3000);
}

function clearErrors() {
  const errorGroups = document.querySelectorAll('.form-group.error');
  errorGroups.forEach(group => {
    group.classList.remove('error');
  });
}

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type} show`;
  
  // Auto-hide after 4 seconds
  setTimeout(() => {
    status.classList.remove('show');
    setTimeout(() => {
      status.textContent = '';
      status.className = 'status';
    }, 300);
  }, 4000);
}