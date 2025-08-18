document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('configForm');
  const saveButton = document.getElementById('saveConfig');
  const modelSelect = document.getElementById('modelSelect');
  const styleSelect = document.getElementById('styleSelect');
  const customStyleInput = document.getElementById('customStyleInput');
  const modelCostDisplay = document.getElementById('modelCost');
  
  // Extension toggle element
  const extensionToggle = document.getElementById('extensionToggle');
  const extensionStatus = document.getElementById('extensionStatus');
  
  // API Provider elements
  const providerOptions = document.querySelectorAll('.provider-option');
  const openaiSection = document.getElementById('openaiSection');
  const grokSection = document.getElementById('grokSection');
  const openaiModels = document.getElementById('openaiModels');
  const grokModels = document.getElementById('grokModels');
  
  // Response styles with comprehensive instructions
  const styles = {
    'professional': `Be professional, formal, and business-like in all responses. Use proper language, maintain a respectful tone, and demonstrate expertise. Structure responses clearly with logical flow. Avoid slang, casual language, or overly informal expressions. When appropriate, use industry terminology and professional frameworks. Always maintain credibility and authority while remaining approachable. Focus on providing value, actionable insights, and professional guidance. Keep responses concise but comprehensive, ensuring they meet professional standards and expectations.`,
    
    'casual': `Be casual, friendly, and approachable in your responses. Use conversational language that feels natural and engaging, as if talking to a friend. Show personality and warmth while maintaining helpfulness. Use contractions, friendly expressions, and relatable examples. Avoid overly formal or technical language unless necessary. Make responses feel human and relatable, using humor when appropriate. Be encouraging and supportive, creating a comfortable atmosphere for discussion. Keep the tone light but informative, making complex topics accessible and enjoyable.`,
    
    'humorous': `Be witty, humorous, and entertaining in your responses while maintaining value and relevance. Use clever jokes, puns, and light-hearted commentary when appropriate. Inject humor naturally without forcing it, ensuring it enhances rather than distracts from the message. Use creative analogies, unexpected comparisons, and playful language that makes responses memorable. Balance humor with helpfulness - be funny but also genuinely useful. Avoid offensive or inappropriate humor, keeping it clever and inclusive. Make responses engaging and shareable, using wit to make complex topics more approachable and enjoyable.`,
    
    'analytical': `Be analytical, detailed, and thorough in your responses. Break down complex topics into understandable components, providing comprehensive insights and deep analysis. Use logical reasoning, evidence-based approaches, and systematic thinking. Present information in structured formats when helpful, using bullet points, numbered lists, or clear sections. Ask probing questions to understand the full context before providing analysis. Offer multiple perspectives and consider various angles of the topic. Be precise with terminology and explanations, ensuring clarity and accuracy. Provide actionable insights and practical recommendations based on your analysis.`,
    
    'concise': `Be concise, direct, and to the point in all responses. Avoid unnecessary words, filler language, or overly verbose explanations. Focus on essential information and key takeaways. Use clear, simple language that gets straight to the heart of the matter. Structure responses efficiently with clear headings or bullet points when helpful. Prioritize the most important information first, using the inverted pyramid style. Be efficient with words while maintaining clarity and completeness. Respect the reader's time by delivering maximum value in minimum words.`,
    
    'empathetic': `Be empathetic, supportive, and understanding in your responses. Show genuine care and emotional intelligence in all interactions. Acknowledge feelings and emotions expressed by the user, validating their experiences. Use supportive language that creates a safe, welcoming environment. Offer encouragement and positive reinforcement when appropriate. Be patient and understanding, especially with complex or sensitive topics. Show compassion while maintaining helpfulness and providing practical guidance. Create an atmosphere of trust and emotional safety where users feel heard and supported.`,
    
    'creative': `Be creative, imaginative, and innovative in your responses. Think outside the box and offer unique perspectives that spark curiosity and engagement. Use creative metaphors, analogies, and storytelling techniques to make concepts memorable. Approach problems from unexpected angles, offering creative solutions and fresh insights. Use vivid language and descriptive expressions that paint pictures in the reader's mind. Encourage creative thinking and exploration of possibilities. Make responses inspiring and thought-provoking, using creativity to make complex topics more accessible and engaging. Balance innovation with practicality, ensuring creative approaches are also useful and actionable.`
  };

  // Model cost information for both providers
  const modelCosts = {
    // OpenAI Models
    'gpt-4': '~$0.03 per response',
    'gpt-4-turbo': '~$0.01 per response', 
    'gpt-3.5-turbo': '~$0.002 per response',
    // Grok Models
    'grok-4-0709': '~$0.018 per response (256K context)',
    'grok-3': '~$0.018 per response (131K context)',
    'grok-3-mini': '~$0.0008 per response (131K context)'
  };
  
  // Load saved configuration
  try {
    const config = await chrome.storage.sync.get([
      'openaiKey', 
      'grokKey', 
      'selectedProvider', 
      'style', 
      'selectedStyleType', 
      'selectedModel',
      'extensionEnabled'
    ]);
    
    // Set provider
    if (config.selectedProvider) {
      // Set the active provider button
      const providerBtn = document.querySelector(`[data-provider="${config.selectedProvider}"]`);
      if (providerBtn) {
        providerBtn.classList.add('active');
      }
      setActiveProvider(config.selectedProvider);
    } else {
      // Default to OpenAI
      const openaiBtn = document.querySelector('[data-provider="openai"]');
      if (openaiBtn) {
        openaiBtn.classList.add('active');
      }
      setActiveProvider('openai');
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
      // Set default based on provider
      if (config.selectedProvider === 'grok') {
        modelSelect.value = 'grok-4-0709'; // Default to Grok-4-0709
      } else {
        modelSelect.value = 'gpt-4'; // Default to GPT-4
      }
    }
    updateModelCost();
    
    // Set style
    if (config.selectedStyleType) {
      styleSelect.value = config.selectedStyleType;
    }
    
    // Set extension toggle state
    if (config.extensionEnabled !== undefined) {
      extensionToggle.checked = config.extensionEnabled;
    } else {
      // Default to enabled
      extensionToggle.checked = true;
    }
    
    // Update status indicator
    updateExtensionStatus();
    
    // Set custom instructions if they exist
    if (config.style && config.style !== styles[config.selectedStyleType]) {
      // If the saved style is different from the base style, it means there were custom instructions
      customStyleInput.value = config.style.replace(styles[config.selectedStyleType] + '\n\nAdditional custom instructions: ', '');
    }
  } catch (error) {
    showStatus('Failed to load configuration', 'error');
  }
  
  // Event listeners
  providerOptions.forEach(opt => {
    opt.addEventListener('click', (event) => {
      const provider = event.target.getAttribute('data-provider');
      setActiveProvider(provider);
    });
  });

  // Model selection change handler
  modelSelect.addEventListener('change', () => {
    const selectedModel = modelSelect.value;
    const currentProvider = document.querySelector('.provider-option.active').getAttribute('data-provider');
    
    // Strict validation: prevent cross-provider model selection
    if (selectedModel.startsWith('gpt-') && currentProvider !== 'openai') {
      // User somehow selected OpenAI model while Grok is active - revert to valid Grok model
      console.warn('xMatic: Cross-provider model selection detected, reverting to valid model');
      modelSelect.value = 'grok-4-0709';
      return;
    } else if (selectedModel.startsWith('grok-') && currentProvider !== 'grok') {
      // User somehow selected Grok model while OpenAI is active - revert to valid OpenAI model
      console.warn('xMatic: Cross-provider model selection detected, reverting to valid model');
      modelSelect.value = 'gpt-4';
      return;
    }
    
    updateModelCost();
  });
  
  function setActiveProvider(provider) {
    // Update active state on provider buttons
    providerOptions.forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-provider') === provider) {
        btn.classList.add('active');
      }
    });
    
    // Show/hide API key sections
    if (provider === 'openai') {
      openaiSection.classList.remove('grok-section-hidden');
      grokSection.classList.add('grok-section-hidden');
      // Show only OpenAI models, hide Grok models
      openaiModels.classList.remove('grok-models-hidden');
      grokModels.classList.add('grok-models-hidden');
      
      // Set model to first OpenAI model if current model is Grok
      if (modelSelect.value.startsWith('grok-')) {
        modelSelect.value = 'gpt-4';
      }
    } else {
      openaiSection.classList.add('grok-section-hidden');
      grokSection.classList.remove('grok-section-hidden');
      // Show only Grok models, hide OpenAI models
      openaiModels.classList.add('grok-models-hidden');
      grokModels.classList.remove('grok-models-hidden');
      
      // Set model to first Grok model if current model is OpenAI
      if (modelSelect.value.startsWith('gpt-')) {
        modelSelect.value = 'grok-4-0709';
      }
    }
    
    updateModelCost();
  }
  
  // Handle model selection
  modelSelect.addEventListener('change', updateModelCost);
  
  function updateModelCost() {
    const selectedModel = modelSelect.value;
    modelCostDisplay.textContent = modelCosts[selectedModel] || '~$0.01 per response';
  }
  
  // Handle style selection - no need to show/hide custom input since it's always visible
  styleSelect.addEventListener('change', (e) => {
    // Custom input is always visible now, no need to toggle display
    updateModelCost(); // Update cost display if needed
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
    const extensionEnabled = extensionToggle.checked;
    let style = '';
    
    // Get style based on selection and combine with custom instructions
    let finalStyle = '';
    const customInstructions = customStyleInput.value.trim();
    
    if (selectedStyleType && styles[selectedStyleType]) {
      // Start with the base style
      finalStyle = styles[selectedStyleType];
      
      // Add custom instructions if provided
      if (customInstructions) {
        finalStyle += '\n\nAdditional custom instructions: ' + customInstructions;
      }
    } else if (customInstructions) {
      // If no base style selected, use only custom instructions
      finalStyle = customInstructions;
    } else {
      // Default style if nothing is provided
      finalStyle = 'Be conversational and helpful. Add genuine value to discussions while keeping responses under 280 characters.';
    }
    
    // Clear previous error states
    clearErrors();
    
    // Validate model selection matches provider
    // Double-check provider-model compatibility
    if (selectedProvider === 'openai' && !selectedModel.startsWith('gpt-')) {
      setFieldError('modelSelectGroup', 'Invalid model selection for OpenAI provider');
      return;
    }
    if (selectedProvider === 'grok' && !selectedModel.startsWith('grok-')) {
      setFieldError('modelSelectGroup', 'Invalid model selection for Grok provider');
      return;
    }
    
    // Additional safety check - ensure the model is actually visible for the selected provider
    if (selectedProvider === 'openai' && grokModels.style.display !== 'none') {
      setFieldError('modelSelectGroup', 'OpenAI models not properly loaded');
      return;
    }
    if (selectedProvider === 'grok' && openaiModels.style.display !== 'none') {
      setFieldError('modelSelectGroup', 'Grok models not properly loaded');
      return;
    }
    
    // Validate API keys based on provider
    if (selectedProvider === 'openai') {
        if (!openaiKey || !openaiKey.trim()) {
            setFieldError('openaiKeyGroup', 'OpenAI API key is required');
            return;
        }
        if (!openaiKey.startsWith('sk-')) {
            setFieldError('openaiKeyGroup', 'OpenAI API key must start with "sk-"');
            return;
        }
    } else if (selectedProvider === 'grok') {
        if (!grokKey || !grokKey.trim()) {
            setFieldError('grokKeyGroup', 'Grok API key is required');
            return;
        }
        if (!grokKey.startsWith('xai-')) {
            setFieldError('grokKeyGroup', 'Grok API key must start with "xai-"');
            return;
        }
    }
    
    // Validate style selection
    if (!selectedStyleType) {
      setFieldError('styleGroup', 'Please select a base style or provide custom instructions');
      showStatus('Please select a response style or provide custom instructions', 'error');
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
        style: finalStyle, // Save the combined style
        selectedStyleType,
        extensionEnabled
      });
      
      showStatus('Configuration saved successfully! 🎉', 'success');
      
    } catch (error) {
      showStatus('Failed to save configuration', 'error');
    } finally {
      setLoadingState(false);
    }
  });
  
  // Handle extension toggle change
  extensionToggle.addEventListener('change', async () => {
    try {
      await chrome.storage.sync.set({
        extensionEnabled: extensionToggle.checked
      });
      
      // Update status indicator
      updateExtensionStatus();
      
      // Show immediate feedback
      const message = extensionToggle.checked ? 
        'Extension enabled! AI button will appear on Twitter pages' : 
        'Extension disabled! AI button will be hidden on Twitter pages';
      
      showStatus(message, 'success');
      
    } catch (error) {
      showStatus('Failed to save toggle state', 'error');
      // Revert the toggle if save failed
      extensionToggle.checked = !extensionToggle.checked;
      updateExtensionStatus();
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

function updateExtensionStatus() {
  const isEnabled = extensionToggle.checked;
  const statusIndicator = extensionStatus.querySelector('.status-indicator');
  
  if (isEnabled) {
    statusIndicator.textContent = '🟢 Extension is currently active';
    statusIndicator.className = 'status-indicator enabled';
  } else {
    statusIndicator.textContent = '🔴 Extension is currently disabled';
    statusIndicator.className = 'status-indicator disabled';
  }
}