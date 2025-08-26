// xMatic - AI Tab Script
// This file will handle AI configuration (API keys, models)

class AITab {
    constructor() {
        this.init();
    }

    init() {
        // Initialize AI tab functionality
        console.log('xMatic: 🎯 AI Tab - Initializing...');
        console.log('xMatic: 🎯 AI Tab - AIAPIHandler available:', !!window.AIAPIHandler);
        console.log('xMatic: 🎯 AI Tab - AIAPIHandler type:', typeof window.AIAPIHandler);
        if (window.AIAPIHandler) {
            console.log('xMatic: 🎯 AI Tab - AIAPIHandler constructor:', window.AIAPIHandler.toString().substring(0, 100) + '...');
        }
        console.log('xMatic: 🎯 AI Tab - Initialization complete');
    }

    render(container) {
        console.log('xMatic: 🎯 AI Tab - Starting render...', { container, containerExists: !!container });
        
        // Render the AI tab content with configuration from popup
        container.innerHTML = `
            <div class="tab-header">
                <div class="tab-header-content">
                    <h3>AI Configuration</h3>
                    <p>Manage API keys, models, and advanced settings</p>
                </div>
            </div>
            
            <div class="ai-content">
                <!-- Provider Selection -->
                <div class="simple-form-group">
                    <label>AI Provider</label>
                    <div class="provider-toggle">
                        <button type="button" class="provider-btn active" data-provider="openai">OpenAI</button>
                        <button type="button" class="provider-btn" data-provider="grok">Grok (xAI)</button>
                    </div>
                </div>

                <!-- OpenAI API Key -->
                <div class="simple-form-group" id="openaiSection">
                    <label>OpenAI API Key</label>
                    <div class="input-with-test">
                        <input type="password" id="openaiKey" class="simple-input" placeholder="sk-proj-..." autocomplete="off">
                        <button type="button" id="testOpenAIConnection" class="test-btn" title="Test Connection">
                            <svg viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                        </button>
                    </div>
                    <div id="openaiConnectionStatus" class="status-text"></div>
                </div>

                <!-- Grok API Key -->
                <div class="simple-form-group grok-hidden" id="grokSection">
                    <label>Grok API Key</label>
                    <div class="input-with-test">
                        <input type="password" id="grokKey" class="simple-input" placeholder="xai-..." autocomplete="off">
                        <button type="button" id="testGrokConnection" class="test-btn" title="Test Connection">
                            <svg viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                        </button>
                    </div>
                    <div id="grokConnectionStatus" class="status-text"></div>
                </div>

                <!-- AI Model -->
                <div class="simple-form-group">
                    <label>AI Model</label>
                    <select id="modelSelect" class="simple-select">
                        <!-- OpenAI Models -->
                        <optgroup label="OpenAI Models" id="openaiModels">
                            <option value="gpt-4">GPT-4 (Recommended)</option>
                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        </optgroup>
                        <!-- Grok Models -->
                        <optgroup label="Grok Models" id="grokModels" class="grok-models-hidden">
                            <option value="grok-4-0709">Grok-4-0709</option>
                            <option value="grok-3">Grok-3</option>
                            <option value="grok-3-mini">Grok-3-mini</option>
                        </optgroup>
                    </select>
                </div>

                <!-- Max Tokens -->
                <div class="simple-form-group">
                    <label>Max Tokens</label>
                    <input type="number" id="maxTokens" class="simple-input" placeholder="150" min="1" max="4000">
                    <small class="help-text">Maximum number of tokens in the AI response</small>
                </div>

                <!-- Temperature -->
                <div class="simple-form-group">
                    <label>Temperature</label>
                    <div class="temp-control">
                        <input type="range" id="temperature" class="simple-range" min="0" max="2" step="0.1" value="0.7">
                        <span id="tempValue">0.7</span>
                    </div>
                    <small class="help-text">Higher values make responses more creative, lower values more focused</small>
                </div>

                <!-- Save Button -->
                <div class="simple-form-group">
                    <div class="button-group">
                        <button type="button" id="saveConfig" class="ai-save-btn">
                            <span class="btn-text">Save Configuration</span>
                            <span class="btn-loading" style="display: none;">
                                <svg class="spinner" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                                        <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                                        <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                                    </circle>
                                </svg>
                                Saving...
                            </span>
                        </button>
                        <button type="button" id="resetConfig" class="ai-reset-btn">
                            <span class="btn-text">Reset to Defaults</span>
                            <span class="btn-loading" style="display: none;">
                                <svg class="spinner" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                                        <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                                        <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                                    </circle>
                                </svg>
                                Resetting...
                            </span>
                        </button>
                    </div>
                    <div id="configStatus" class="config-status"></div>
                </div>
                
                <!-- Bottom Spacing for Footer -->
                <div class="bottom-spacing"></div>
            </div>
        `;
        
        console.log('xMatic: 🎯 AI Tab - HTML rendered, setting up event listeners...');
        this.setupEventListeners(container);
        console.log('xMatic: 🎯 AI Tab - Event listeners set up, loading current config...');
        this.loadCurrentConfig();
        console.log('xMatic: 🎯 AI Tab - Render complete!');
    }

    setupEventListeners(container) {
        console.log('xMatic: 🎯 AI Tab - Setting up event listeners...', { container });
        
        // Setup event listeners for the AI tab
        const saveBtn = container.querySelector('#saveConfig');
        const resetBtn = container.querySelector('#resetConfig');
        const providerBtns = container.querySelectorAll('.provider-btn');
        const temperatureRange = container.querySelector('#temperature');
        const apiKeyInput = container.querySelector('#openaiKey');
        const grokKeyInput = container.querySelector('#grokKey');
        const modelSelect = container.querySelector('#modelSelect');
        const maxTokensInput = container.querySelector('#maxTokens');
        
        // Test connection buttons
        const testOpenAIBtn = container.querySelector('#testOpenAIConnection');
        const testGrokBtn = container.querySelector('#testGrokConnection');
        
        console.log('xMatic: 🎯 AI Tab - Found elements:', {
            saveBtn: !!saveBtn,
            resetBtn: !!resetBtn,
            providerBtns: providerBtns.length,
            temperatureRange: !!temperatureRange,
            apiKeyInput: !!apiKeyInput,
            grokKeyInput: !!grokKeyInput,
            modelSelect: !!modelSelect,
            maxTokensInput: !!maxTokensInput,
            testOpenAIBtn: !!testOpenAIBtn,
            testGrokBtn: !!testGrokBtn
        });
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.handleSave());
            console.log('xMatic: 🎯 AI Tab - Save button event listener added');
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.handleReset());
            console.log('xMatic: 🎯 AI Tab - Reset button event listener added');
        }
        
        if (temperatureRange) {
            temperatureRange.addEventListener('input', (e) => this.handleTemperatureChange(e));
            console.log('xMatic: 🎯 AI Tab - Temperature range event listener added');
        }
        
        if (apiKeyInput) {
            apiKeyInput.addEventListener('input', () => this.handleApiKeyChange());
            console.log('xMatic: 🎯 AI Tab - OpenAI API key event listener added');
        }
        
        if (grokKeyInput) {
            grokKeyInput.addEventListener('input', () => this.handleGrokKeyChange());
            console.log('xMatic: 🎯 AI Tab - Grok API key event listener added');
        }
        
        if (modelSelect) {
            modelSelect.addEventListener('change', () => this.handleModelChange());
            console.log('xMatic: 🎯 AI Tab - Model select event listener added');
        }
        
        if (maxTokensInput) {
            maxTokensInput.addEventListener('input', () => this.handleMaxTokensChange());
            console.log('xMatic: 🎯 AI Tab - Max tokens input event listener added');
        }
        
        // Test connection buttons
        if (testOpenAIBtn) {
            testOpenAIBtn.addEventListener('click', () => this.testOpenAIConnection());
            console.log('xMatic: 🎯 AI Tab - Test OpenAI button event listener added');
        }
        
        if (testGrokBtn) {
            testGrokBtn.addEventListener('click', () => this.testGrokConnection());
            console.log('xMatic: 🎯 AI Tab - Test Grok button event listener added');
        }
        
        // Setup provider selection
        providerBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => this.handleProviderSelection(btn));
            console.log(`xMatic: 🎯 AI Tab - Provider button ${index} event listener added`);
        });
        
        console.log('xMatic: 🎯 AI Tab - All event listeners set up successfully');
    }

    loadCurrentConfig() {
        // Load current AI configuration from storage
        console.log('xMatic: 🎯 AI Tab - Loading current AI config from storage...');
        chrome.storage.sync.get([
            'selectedProvider',
            'selectedModel',
            'openaiKey',
            'grokKey',
            'maxTokens',
            'temperature'
        ], (result) => {
            console.log('xMatic: 🎯 AI Tab - Storage result:', result);
            
            // Set provider selection
            if (result.selectedProvider) {
                console.log('xMatic: 🎯 AI Tab - Setting selected provider:', result.selectedProvider);
                const providerButton = document.querySelector(`[data-provider="${result.selectedProvider}"]`);
                if (providerButton) {
                    this.handleProviderSelection(providerButton);
                } else {
                    console.log('xMatic: 🎯 AI Tab - Provider button not found for:', result.selectedProvider);
                }
            }
            
            // Set API keys
            if (result.openaiKey) {
                console.log('xMatic: 🎯 AI Tab - Setting OpenAI API key');
                const openaiKeyInput = document.querySelector('#openaiKey');
                if (openaiKeyInput) openaiKeyInput.value = result.openaiKey;
            }
            
            if (result.grokKey) {
                console.log('xMatic: 🎯 AI Tab - Setting Grok API key');
                const grokKeyInput = document.querySelector('#grokKey');
                if (grokKeyInput) grokKeyInput.value = result.grokKey;
            }
            
            // Set model selection
            if (result.selectedModel) {
                console.log('xMatic: 🎯 AI Tab - Setting selected model:', result.selectedModel);
                const modelSelect = document.querySelector('#modelSelect');
                if (modelSelect) {
                    setTimeout(() => {
                        modelSelect.value = result.selectedModel;
                        console.log('xMatic: 🎯 AI Tab - Model value set to:', result.selectedModel);
                    }, 100);
                }
            }
            
            // Set advanced settings
            if (result.maxTokens) {
                console.log('xMatic: 🎯 AI Tab - Setting max tokens:', result.maxTokens);
                const maxTokensInput = document.querySelector('#maxTokens');
                if (maxTokensInput) maxTokensInput.value = result.maxTokens;
            }
            
            if (result.temperature) {
                console.log('xMatic: 🎯 AI Tab - Setting temperature:', result.temperature);
                const temperatureRange = document.querySelector('#temperature');
                const tempValue = document.querySelector('#tempValue');
                if (temperatureRange) temperatureRange.value = result.temperature;
                if (tempValue) tempValue.textContent = result.temperature;
            }
            
            console.log('xMatic: 🎯 AI Tab - Updating model options...');
            this.updateModelOptions();
            console.log('xMatic: 🎯 AI Tab - Configuration loading complete');
        });
    }

    handleProviderSelection(selectedBtn) {
        console.log('xMatic: 🎯 AI Tab - Handling provider selection:', selectedBtn.getAttribute('data-provider'));
        
        // Handle provider selection
        const allBtns = document.querySelectorAll('.provider-btn');
        allBtns.forEach(btn => btn.classList.remove('active'));
        selectedBtn.classList.add('active');
        
        const selectedProvider = selectedBtn.getAttribute('data-provider');
        console.log('xMatic: 🎯 AI Tab - Selected provider:', selectedProvider);
        
        // Show/hide provider sections
        const openaiSection = document.querySelector('#openaiSection');
        const grokSection = document.querySelector('#grokSection');
        const grokModels = document.querySelector('#grokModels');
        
        if (selectedProvider === 'openai') {
            console.log('xMatic: 🎯 AI Tab - Showing OpenAI section, hiding Grok section');
            if (openaiSection) openaiSection.style.display = 'block';
            if (grokSection) grokSection.style.display = 'none';
            if (grokModels) grokModels.style.display = 'none';
        } else if (selectedProvider === 'grok') {
            console.log('xMatic: 🎯 AI Tab - Showing Grok section, hiding OpenAI section');
            if (openaiSection) openaiSection.style.display = 'none';
            if (grokSection) grokSection.style.display = 'block';
            if (grokModels) grokModels.style.display = 'block';
        }
        
        this.updateModelOptions();
        
        // Save selection
        chrome.storage.sync.set({ selectedProvider: selectedProvider }, () => {
            console.log('xMatic: 🎯 AI Tab - Provider selection saved to storage');
        });
    }

    updateModelOptions() {
        // Update model options based on selected provider
        const selectedProvider = document.querySelector('.provider-btn.active')?.getAttribute('data-provider');
        const modelSelect = document.querySelector('#modelSelect');
        const openaiModels = document.querySelector('#openaiModels');
        const grokModels = document.querySelector('#grokModels');
        
        if (!modelSelect) return;
        
        if (selectedProvider === 'openai') {
            if (openaiModels) openaiModels.style.display = 'block';
            if (grokModels) grokModels.style.display = 'none';
        } else if (selectedProvider === 'grok') {
            if (openaiModels) openaiModels.style.display = 'none';
            if (grokModels) grokModels.style.display = 'block';
        }
    }

    handleTemperatureChange(event) {
        // Handle temperature range change
        const value = event.target.value;
        const tempValue = document.querySelector('#tempValue');
        if (tempValue) {
            tempValue.textContent = value;
        }
    }

    handleApiKeyChange() {
        // Handle OpenAI API key input change
        console.log('xMatic: 🎯 AI Tab - OpenAI API key changed...');
    }

    handleGrokKeyChange() {
        // Handle Grok API key input change
        console.log('xMatic: 🎯 AI Tab - Grok API key changed...');
    }

    handleModelChange() {
        // Handle model selection change
        console.log('xMatic: 🎯 AI Tab - Model changed...');
    }

    handleStyleChange() {
        // Handle style selection change
        console.log('xMatic: Style changed...');
    }

    handleCustomStyleChange() {
        // Handle custom style input change
        console.log('xMatic: Custom style changed...');
    }

    handleMaxTokensChange() {
        // Handle max tokens input change
        console.log('xMatic: Max tokens changed...');
    }

    handleReset() {
        // Handle resetting AI configuration to defaults
        console.log('xMatic: �� AI Tab - Resetting AI config to defaults...');
        chrome.storage.sync.get([
            'selectedProvider',
            'selectedModel',
            'openaiKey',
            'grokKey',
            'maxTokens',
            'temperature'
        ], (result) => {
            if (result.selectedProvider) {
                const providerButton = document.querySelector(`[data-provider="${result.selectedProvider}"]`);
                if (providerButton) {
                    this.handleProviderSelection(providerButton);
                }
            }
            if (result.openaiKey) {
                const openaiKeyInput = document.querySelector('#openaiKey');
                if (openaiKeyInput) openaiKeyInput.value = '';
            }
            if (result.grokKey) {
                const grokKeyInput = document.querySelector('#grokKey');
                if (grokKeyInput) grokKeyInput.value = '';
            }
            if (result.selectedModel) {
                const modelSelect = document.querySelector('#modelSelect');
                if (modelSelect) {
                    setTimeout(() => {
                        modelSelect.value = 'gpt-4'; // Default OpenAI model
                    }, 100);
                }
            }
            if (result.maxTokens) {
                const maxTokensInput = document.querySelector('#maxTokens');
                if (maxTokensInput) maxTokensInput.value = '150'; // Default max tokens
            }
            if (result.temperature) {
                const temperatureRange = document.querySelector('#temperature');
                const tempValue = document.querySelector('#tempValue');
                if (temperatureRange) temperatureRange.value = '0.7'; // Default temperature
                if (tempValue) tempValue.textContent = '0.7';
            }
            this.updateModelOptions();
            this.showConfigStatus('Configuration reset to defaults.', 'success');
            console.log('xMatic: 🎯 AI Tab - Configuration reset to defaults.');
        });
    }


    async testOpenAIConnection() {
        // Test OpenAI connection
        console.log('xMatic: 🎯 AI Tab - Testing OpenAI connection...');
        const apiKey = document.querySelector('#openaiKey')?.value;
        const statusElement = document.querySelector('#openaiConnectionStatus');
        
        console.log('xMatic: 🎯 AI Tab - OpenAI API key found:', !!apiKey);
        console.log('xMatic: 🎯 AI Tab - Status element found:', !!statusElement);
        
        if (!apiKey) {
            console.log('xMatic: 🎯 AI Tab - No OpenAI API key provided');
            this.showConnectionStatus(statusElement, 'Please enter API key', 'error');
            return;
        }
        
        console.log('xMatic: 🎯 AI Tab - OpenAI API key found, testing connection...');
        this.showConnectionStatus(statusElement, 'Testing...', 'warning');
        
        try {
            // Use AIAPIHandler to test connection
            if (!window.AIAPIHandler) {
                console.error('xMatic: 🎯 AI Tab - AIAPIHandler not available');
                this.showConnectionStatus(statusElement, 'AI Handler not available', 'error');
                return;
            }
            
            console.log('xMatic: 🎯 AI Tab - Creating AIAPIHandler instance...');
            const aiHandler = new window.AIAPIHandler({
                openaiKey: apiKey,
                selectedProvider: 'openai',
                selectedModel: 'gpt-3.5-turbo'
            });
            
            // Test with a simple prompt
            console.log('xMatic: 🎯 AI Tab - Sending test request...');
            const response = await aiHandler.generateReply({
                mainTweet: 'Hello, this is a test tweet.',
                authorName: 'Test User',
                engagementData: { likes: 0, retweets: 0, replies: 0, quotes: 0 }
            });
            
            if (response) {
                console.log('xMatic: 🎯 AI Tab - OpenAI test successful, response:', response);
                this.showConnectionStatus(statusElement, 'Connection successful!', 'success');
            } else {
                console.log('xMatic: 🎯 AI Tab - OpenAI test failed - no response');
                this.showConnectionStatus(statusElement, 'Connection failed', 'error');
            }
        } catch (error) {
            console.error('xMatic: 🎯 AI Tab - OpenAI test failed with error:', error);
            this.showConnectionStatus(statusElement, `Test failed: ${error.message}`, 'error');
        }
    }

    async testGrokConnection() {
        // Test Grok connection
        console.log('xMatic: 🎯 AI Tab - Testing Grok connection...');
        const apiKey = document.querySelector('#grokKey')?.value;
        const statusElement = document.querySelector('#grokConnectionStatus');
        
        console.log('xMatic: 🎯 AI Tab - Grok API key found:', !!apiKey);
        console.log('xMatic: 🎯 AI Tab - Status element found:', !!statusElement);
        console.log('xMatic: 🎯 AI Tab - AIAPIHandler available:', !!window.AIAPIHandler);
        console.log('xMatic: 🎯 AI Tab - AIAPIHandler type:', typeof window.AIAPIHandler);
        
        if (!apiKey) {
            console.log('xMatic: 🎯 AI Tab - No Grok API key provided');
            this.showConnectionStatus(statusElement, 'Please enter API key', 'error');
            return;
        }
        
        if (!window.AIAPIHandler) {
            console.error('xMatic: 🎯 AI Tab - AIAPIHandler not available');
            this.showConnectionStatus(statusElement, 'AI Handler not available', 'error');
            return;
        }
        
        console.log('xMatic: 🎯 AI Tab - Grok API key found, testing connection...');
        this.showConnectionStatus(statusElement, 'Testing...', 'warning');
        
        try {
            // Use AIAPIHandler to test connection
            console.log('xMatic: 🎯 AI Tab - Creating AIAPIHandler instance for Grok...');
            const aiHandler = new window.AIAPIHandler({
                grokKey: apiKey,
                selectedProvider: 'grok',
                selectedModel: 'grok-3'
            });
            
            // Test with a simple prompt
            console.log('xMatic: 🎯 AI Tab - Sending Grok test request...');
            const response = await aiHandler.generateReply({
                mainTweet: 'Hello, this is a test tweet.',
                authorName: 'Test User',
                engagementData: { likes: 0, retweets: 0, replies: 0, quotes: 0 }
            });
            
            if (response) {
                console.log('xMatic: 🎯 AI Tab - Grok test successful, response:', response);
                this.showConnectionStatus(statusElement, 'Connection successful!', 'success');
            } else {
                console.log('xMatic: 🎯 AI Tab - Grok test failed - no response');
                this.showConnectionStatus(statusElement, 'Connection failed', 'error');
            }
        } catch (error) {
            console.error('xMatic: 🎯 AI Tab - Grok test failed with error:', error);
            this.showConnectionStatus(statusElement, `Test failed: ${error.message}`, 'error');
        }
    }

    showConnectionStatus(statusElement, message, type) {
        if (!statusElement) return;
        
        statusElement.textContent = message;
        statusElement.className = `connection-status show ${type}`;
        
        // Hide after 5 seconds
        setTimeout(() => {
            statusElement.className = 'connection-status';
        }, 5000);
    }

    async handleSave() {
        // Handle saving AI configuration
        console.log('xMatic: 🎯 AI Tab - Saving AI config...');
        
        const saveBtn = document.querySelector('#saveConfig');
        const saveBtnText = saveBtn?.querySelector('.btn-text');
        const saveBtnLoading = saveBtn?.querySelector('.btn-loading');
        
        // Show loading state
        if (saveBtn && saveBtnText && saveBtnLoading) {
            saveBtn.disabled = true;
            saveBtnText.style.display = 'none';
            saveBtnLoading.style.display = 'inline-flex';
        }
        
        const config = {
            selectedProvider: document.querySelector('.provider-btn.active')?.getAttribute('data-provider'),
            openaiKey: document.querySelector('#openaiKey')?.value,
            grokKey: document.querySelector('#grokKey')?.value,
            selectedModel: document.querySelector('#modelSelect')?.value,
            maxTokens: document.querySelector('#maxTokens')?.value,
            temperature: document.querySelector('#temperature')?.value
        };
        
        // Validate required fields
        if (!config.selectedProvider) {
            this.showConfigStatus('Please select an AI provider.', 'error');
            this.resetSaveButton(saveBtn, saveBtnText, saveBtnLoading);
            return;
        }
        
        if (config.selectedProvider === 'openai' && !config.openaiKey) {
            this.showConfigStatus('Please enter your OpenAI API key.', 'error');
            this.resetSaveButton(saveBtn, saveBtnText, saveBtnLoading);
            return;
        }
        
        if (config.selectedProvider === 'grok' && !config.grokKey) {
            this.showConfigStatus('Please enter your Grok API key.', 'error');
            this.resetSaveButton(saveBtn, saveBtnText, saveBtnLoading);
            return;
        }
        
        // Save to storage
        chrome.storage.sync.set(config, () => {
            if (chrome.runtime.lastError) {
                console.error('xMatic: 🎯 AI Tab - Error saving config:', chrome.runtime.lastError);
                this.showConfigStatus('Failed to save configuration. Please try again.', 'error');
                console.log('xMatic: 🎯 AI Tab - Configuration save failed');
            } else {
                console.log('xMatic: 🎯 AI Tab - Configuration saved successfully!');
                this.showConfigStatus('Configuration saved successfully!', 'success');
            }
            
            // Reset button state
            this.resetSaveButton(saveBtn, saveBtnText, saveBtnLoading);
        });
    }
    
    resetSaveButton(saveBtn, saveBtnText, saveBtnLoading) {
        if (saveBtn && saveBtnText && saveBtnLoading) {
            saveBtn.disabled = false;
            saveBtnText.style.display = 'inline';
            saveBtnLoading.style.display = 'none';
        }
    }

    showConfigStatus(message, type) {
        const configStatus = document.querySelector('#configStatus');
        if (configStatus) {
            configStatus.textContent = message;
            configStatus.className = `config-status show ${type}`;
            setTimeout(() => {
                configStatus.className = 'config-status';
            }, 3000); // Hide after 3 seconds
        }
    }

}

// Export for use in floating panel
if (typeof window !== 'undefined') {
    window.AITab = AITab;
}
