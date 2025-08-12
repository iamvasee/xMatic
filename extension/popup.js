document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('configForm');
  const saveButton = document.getElementById('saveConfig');
  const testButton = document.getElementById('testConnection');
  const modelSelect = document.getElementById('modelSelect');
  const styleSelect = document.getElementById('styleSelect');
  const customStyleInput = document.getElementById('customStyle');
  const modelCostDisplay = document.getElementById('modelCost');
  
  // Predefined styles
  const styles = {
    professional: "Write professional, insightful responses that add value to business discussions. Use industry terminology appropriately and maintain a formal tone. Keep responses under 280 characters.",
    casual: "Be conversational and friendly. Use a warm, approachable tone that feels natural and engaging. Add personality while staying helpful. Keep responses under 280 characters.",
    sarcastic: "Be witty and sarcastic, but not mean-spirited. Use clever humor and playful jabs. Make responses memorable and entertaining while still adding value. Keep responses under 280 characters.",
    unhinged: "Be bold, chaotic, and unpredictable! Use wild analogies, unexpected comparisons, and energetic language. Stand out with creative, attention-grabbing responses. Keep responses under 280 characters.",
    technical: "Provide technical insights and detailed explanations. Use precise terminology and offer actionable advice for developers and tech professionals. Keep responses under 280 characters.",
    creative: "Be imaginative and memorable. Use creative metaphors, ask thought-provoking questions, and make responses that spark curiosity and engagement. Keep responses under 280 characters.",
    supportive: "Be encouraging and empathetic. Offer genuine support, positive reinforcement, and helpful advice. Create a welcoming, uplifting tone in all responses. Keep responses under 280 characters."
  };

  // Model cost information
  const modelCosts = {
    'gpt-4': '~$0.03 per response',
    'gpt-4-turbo': '~$0.01 per response', 
    'gpt-3.5-turbo': '~$0.002 per response'
  };
  
  // Load saved configuration
  try {
    const config = await chrome.storage.sync.get(['openaiKey', 'style', 'selectedStyleType', 'selectedModel']);
    
    if (config.openaiKey) {
      document.getElementById('openaiKey').value = config.openaiKey;
    }
    
    if (config.selectedModel) {
      modelSelect.value = config.selectedModel;
    } else {
      modelSelect.value = 'gpt-4'; // Default to GPT-4
    }
    updateModelCost();
    
    if (config.selectedStyleType) {
      styleSelect.value = config.selectedStyleType;
      if (config.selectedStyleType === 'custom') {
        customStyleInput.style.display = 'block';
        customStyleInput.value = config.style || '';
      }
    }
  } catch (error) {
    showStatus('Failed to load configuration', 'error');
  }
  
  // Handle model selection
  modelSelect.addEventListener('change', updateModelCost);
  
  function updateModelCost() {
    const selectedModel = modelSelect.value;
    modelCostDisplay.textContent = modelCosts[selectedModel] || '~$0.01 per response';
  }
  
  // Handle style selection
  styleSelect.addEventListener('change', (e) => {
    const selectedStyle = e.target.value;
    
    if (selectedStyle === 'custom') {
      customStyleInput.style.display = 'block';
      customStyleInput.focus();
    } else {
      customStyleInput.style.display = 'none';
    }
  });
  
  // Handle test connection
  testButton.addEventListener('click', testConnection);
  
  async function testConnection() {
    const apiKey = document.getElementById('openaiKey').value.trim();
    
    if (!apiKey) {
      showConnectionStatus('Please enter an API key first', 'error');
      return;
    }
    
    if (!apiKey.startsWith('sk-')) {
      showConnectionStatus('Invalid API key format', 'error');
      return;
    }
    
    setTestButtonLoading(true);
    
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        showConnectionStatus('✅ OpenAI Connection Established', 'success');
      } else {
        const error = await response.json();
        showConnectionStatus(`❌ Connection Failed: ${error.error?.message || 'Invalid API key'}`, 'error');
      }
    } catch (error) {
      showConnectionStatus('❌ Connection Failed: Network error', 'error');
    } finally {
      setTestButtonLoading(false);
    }
  }
  
  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const openaiKey = document.getElementById('openaiKey').value.trim();
    const selectedModel = modelSelect.value;
    const selectedStyleType = styleSelect.value;
    let style = '';
    
    // Get style based on selection
    if (selectedStyleType === 'custom') {
      style = customStyleInput.value.trim();
    } else if (selectedStyleType && styles[selectedStyleType]) {
      style = styles[selectedStyleType];
    }
    
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
    
    if (!selectedStyleType) {
      setFieldError('styleGroup', 'Please select a response style');
      showStatus('Please select a response style', 'error');
      return;
    }
    
    if (selectedStyleType === 'custom' && !style) {
      setFieldError('styleGroup', 'Please enter your custom style');
      showStatus('Please enter your custom response style', 'error');
      return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
      await chrome.storage.sync.set({
        openaiKey,
        selectedModel,
        style: style || 'Be conversational and helpful. Add genuine value to discussions while keeping responses under 280 characters.',
        selectedStyleType
      });
      
      showStatus('Configuration saved successfully! 🎉', 'success');
      
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

function showConnectionStatus(message, type) {
  const status = document.getElementById('connectionStatus');
  status.textContent = message;
  status.className = `connection-status ${type} show`;
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    status.classList.remove('show');
  }, 5000);
}

function setTestButtonLoading(loading) {
  const button = document.getElementById('testConnection');
  
  if (loading) {
    button.disabled = true;
    button.classList.add('loading');
  } else {
    button.disabled = false;
    button.classList.remove('loading');
  }
}