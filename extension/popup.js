document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('configForm');
  const saveButton = document.getElementById('saveConfig');
  const modelSelect = document.getElementById('modelSelect');
  const styleSelect = document.getElementById('styleSelect');
  const customStyleInput = document.getElementById('customStyle');
  const modelCostDisplay = document.getElementById('modelCost');
  
  // API Provider elements
  const providerOptions = document.querySelectorAll('.provider-option');
  const openaiSection = document.getElementById('openaiSection');
  const grokSection = document.getElementById('grokSection');
  const openaiModels = document.getElementById('openaiModels');
  const grokModels = document.getElementById('grokModels');
  
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

  // Model cost information for both providers
  const modelCosts = {
    // OpenAI Models
    'gpt-4': '~$0.03 per response',
    'gpt-4-turbo': '~$0.01 per response', 
    'gpt-3.5-turbo': '~$0.002 per response',
    // Grok Models
    'grok-beta': '~$0.02 per response',
    'grok-beta-128k': '~$0.04 per response',
    'grok-beta-32k': '~$0.02 per response'
  };
  
  // Load saved configuration
  try {
    const config = await chrome.storage.sync.get([
      'openaiKey', 
      'grokKey', 
      'selectedProvider', 
      'style', 
      'selectedStyleType', 
      'selectedModel'
    ]);
    
    // Set API provider
    if (config.selectedProvider) {
      setActiveProvider(config.selectedProvider);
    } else {
      setActiveProvider('openai'); // Default to OpenAI
    }
    
    // Set API keys
    if (config.openaiKey) {
      document.getElementById('openaiKey').value = config.openaiKey;
    }
    if (config.grokKey) {
      document.getElementById('grokKey').value = config.grokKey;
    }
    
    // Set model
    if (config.selectedModel) {
      modelSelect.value = config.selectedModel;
    } else {
      modelSelect.value = 'gpt-4'; // Default to GPT-4
    }
    updateModelCost();
    
    // Set style
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
  
  // Handle API provider switching
  providerOptions.forEach(option => {
    option.addEventListener('click', () => {
      const provider = option.getAttribute('data-provider');
      setActiveProvider(provider);
    });
  });
  
  function setActiveProvider(provider) {
    // Update provider buttons
    providerOptions.forEach(opt => {
      opt.classList.remove('active');
      if (opt.getAttribute('data-provider') === provider) {
        opt.classList.add('active');
      }
    });
    
    // Show/hide sections
    if (provider === 'openai') {
      openaiSection.style.display = 'block';
      grokSection.style.display = 'none';
      openaiModels.style.display = 'block';
      grokModels.style.display = 'none';
    } else {
      openaiSection.style.display = 'none';
      grokSection.style.display = 'block';
      openaiModels.style.display = 'none';
      grokModels.style.display = 'block';
    }
    
    // Update model selection to first available model for selected provider
    if (provider === 'openai') {
      modelSelect.value = 'gpt-4';
    } else {
      modelSelect.value = 'grok-beta';
    }
    updateModelCost();
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
  
  // Handle OpenAI test connection
  document.getElementById('testOpenAIConnection').addEventListener('click', () => testOpenAIConnection());
  
  async function testOpenAIConnection() {
    const apiKey = document.getElementById('openaiKey').value.trim();
    
    if (!apiKey) {
      showConnectionStatus('openaiConnectionStatus', 'Please enter an OpenAI API key first', 'error');
      return;
    }
    
    if (!apiKey.startsWith('sk-')) {
      showConnectionStatus('openaiConnectionStatus', 'Invalid OpenAI API key format', 'error');
      return;
    }
    
    setTestButtonLoading('testOpenAIConnection', true);
    
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        showConnectionStatus('openaiConnectionStatus', '✅ OpenAI Connection Established', 'success');
      } else {
        const error = await response.json();
        showConnectionStatus('openaiConnectionStatus', `❌ Connection Failed: ${error.error?.message || 'Invalid API key'}`, 'error');
      }
    } catch (error) {
      showConnectionStatus('openaiConnectionStatus', '❌ Connection Failed: Network error', 'error');
    } finally {
      setTestButtonLoading('testOpenAIConnection', false);
    }
  }
  
  // Handle Grok test connection
  document.getElementById('testGrokConnection').addEventListener('click', () => testGrokConnection());
  
  async function testGrokConnection() {
    const apiKey = document.getElementById('grokKey').value.trim();
    
    if (!apiKey) {
      showConnectionStatus('grokConnectionStatus', 'Please enter a Grok API key first', 'error');
      return;
    }
    
    if (!apiKey.startsWith('xai-')) {
      showConnectionStatus('grokConnectionStatus', 'Invalid Grok API key format', 'error');
      return;
    }
    
    setTestButtonLoading('testGrokConnection', true);
    
    try {
      const response = await fetch('https://api.x.ai/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        showConnectionStatus('grokConnectionStatus', '✅ Grok Connection Established', 'success');
      } else {
        const error = await response.json();
        showConnectionStatus('grokConnectionStatus', `❌ Connection Failed: ${error.error?.message || 'Invalid API key'}`, 'error');
      }
    } catch (error) {
      showConnectionStatus('grokConnectionStatus', '❌ Connection Failed: Network error', 'error');
    } finally {
      setTestButtonLoading('testGrokConnection', false);
    }
  }
  
  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const selectedProvider = document.querySelector('.provider-option.active').getAttribute('data-provider');
    const openaiKey = document.getElementById('openaiKey').value.trim();
    const grokKey = document.getElementById('grokKey').value.trim();
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
    
    // Validation based on selected provider
    if (selectedProvider === 'openai') {
      if (!openaiKey) {
        setFieldError('openaiKeyGroup', 'OpenAI API key is required');
        showStatus('Please provide your OpenAI API key', 'error');
        return;
      }
      
      if (!openaiKey.startsWith('sk-')) {
        setFieldError('openaiKeyGroup', 'Invalid OpenAI API key format');
        showStatus('Please enter a valid OpenAI API key', 'error');
        return;
      }
    } else {
      if (!grokKey) {
        setFieldError('grokKeyGroup', 'Grok API key is required');
        showStatus('Please provide your Grok API key', 'error');
        return;
      }
      
      if (!grokKey.startsWith('xai-')) {
        setFieldError('grokKeyGroup', 'Invalid Grok API key format');
        showStatus('Please enter a valid Grok API key', 'error');
        return;
      }
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
        selectedProvider,
        openaiKey,
        grokKey,
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

function showConnectionStatus(statusId, message, type) {
  const status = document.getElementById(statusId);
  status.textContent = message;
  status.className = `connection-status ${type} show`;
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    status.classList.remove('show');
  }, 5000);
}

function setTestButtonLoading(buttonId, loading) {
  const button = document.getElementById(buttonId);
  
  if (loading) {
    button.disabled = true;
    button.classList.add('loading');
  } else {
    button.disabled = false;
    button.classList.remove('loading');
  }
}