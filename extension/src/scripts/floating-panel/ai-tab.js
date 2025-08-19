// xMatic - AI Tab Script
// This file will handle AI configuration (API keys, models)

class AITab {
    constructor() {
        this.init();
    }

    init() {
        // Initialize AI tab functionality
        console.log('xMatic: AI tab initialized');
    }

    render(container) {
        // Render the AI tab content
        container.innerHTML = `
            <div class="tab-header">
                <div class="tab-header-content">
                    <h3>AI Configuration</h3>
                    <p>Manage API keys and model settings</p>
                </div>
                <div class="tab-actions">
                    <button class="action-button secondary" id="testConnection">Test</button>
                    <button class="action-button primary" id="saveConfig">Save</button>
                </div>
            </div>
            
            <div class="ai-content">
                <div class="config-section">
                    <h4>Provider Selection</h4>
                    <div class="provider-toggle">
                        <button class="provider-option active" data-provider="openai">OpenAI</button>
                        <button class="provider-option" data-provider="grok">Grok (xAI)</button>
                        <button class="provider-option" data-provider="perplexity">Perplexity</button>
                    </div>
                </div>
                
                <div class="config-section">
                    <h4>API Configuration</h4>
                    <div class="input-group">
                        <label for="apiKey">API Key</label>
                        <input 
                            type="password" 
                            id="apiKey" 
                            class="config-input" 
                            placeholder="sk-..."
                        >
                    </div>
                    <div class="input-group">
                        <label for="modelSelect">Model</label>
                        <select id="modelSelect" class="config-select">
                            <option value="gpt-4">GPT-4</option>
                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label for="maxTokens">Max Tokens</label>
                        <input 
                            type="number" 
                            id="maxTokens" 
                            class="config-input" 
                            placeholder="150"
                            min="1"
                            max="4000"
                        >
                    </div>
                </div>
                
                <div class="config-section">
                    <h4>Advanced Settings</h4>
                    <div class="input-group">
                        <label for="temperature">Temperature</label>
                        <input 
                            type="range" 
                            id="temperature" 
                            class="config-range" 
                            min="0" 
                            max="2" 
                            step="0.1" 
                            value="0.7"
                        >
                        <div class="range-value">
                            <span id="tempValue">0.7</span>
                            <small>Lower = More focused, Higher = More creative</small>
                        </div>
                    </div>
                    <div class="input-group">
                        <label for="customPrompt">Custom System Prompt</label>
                        <textarea 
                            id="customPrompt" 
                            class="config-input" 
                            placeholder="Enter custom system prompt..."
                            rows="3"
                        ></textarea>
                    </div>
                </div>
                
                <div class="config-section">
                    <h4>Connection Status</h4>
                    <div class="connection-status" id="connectionStatus">
                        <div class="status-indicator">
                            <span class="status-dot"></span>
                            <span class="status-text">Not tested</span>
                        </div>
                        <button class="action-button secondary" id="testNow">Test Now</button>
                    </div>
                </div>
            </div>
        `;
        
        this.setupEventListeners(container);
        this.loadCurrentConfig();
    }

    setupEventListeners(container) {
        // Setup event listeners for the AI tab
        const saveBtn = container.querySelector('#saveConfig');
        const testBtn = container.querySelector('#testConnection');
        const testNowBtn = container.querySelector('#testNow');
        const providerOptions = container.querySelectorAll('.provider-option');
        const temperatureRange = container.querySelector('#temperature');
        const apiKeyInput = container.querySelector('#apiKey');
        const modelSelect = container.querySelector('#modelSelect');
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.handleSave());
        }
        
        if (testBtn) {
            testBtn.addEventListener('click', () => this.handleTest());
        }
        
        if (testNowBtn) {
            testNowBtn.addEventListener('click', () => this.handleTestNow());
        }
        
        if (temperatureRange) {
            temperatureRange.addEventListener('input', (e) => this.handleTemperatureChange(e));
        }
        
        if (apiKeyInput) {
            apiKeyInput.addEventListener('input', () => this.handleApiKeyChange());
        }
        
        if (modelSelect) {
            modelSelect.addEventListener('change', () => this.handleModelChange());
        }
        
        // Setup provider selection
        providerOptions.forEach(option => {
            option.addEventListener('click', () => this.handleProviderSelection(option));
        });
    }

    loadCurrentConfig() {
        // Load current AI configuration
        console.log('xMatic: Loading current AI config...');
        // TODO: Load from storage manager
        this.updateModelOptions();
    }

    handleProviderSelection(selectedOption) {
        // Handle provider selection
        const allOptions = document.querySelectorAll('.provider-option');
        allOptions.forEach(option => option.classList.remove('active'));
        selectedOption.classList.add('active');
        
        const selectedProvider = selectedOption.getAttribute('data-provider');
        console.log('xMatic: Selected provider:', selectedProvider);
        
        this.updateModelOptions();
        this.updateConnectionStatus('Not tested');
    }

    updateModelOptions() {
        // Update model options based on selected provider
        const selectedProvider = document.querySelector('.provider-option.active')?.getAttribute('data-provider');
        const modelSelect = document.querySelector('#modelSelect');
        
        if (!modelSelect) return;
        
        let models = [];
        switch (selectedProvider) {
            case 'openai':
                models = [
                    { value: 'gpt-4', label: 'GPT-4' },
                    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
                    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
                ];
                break;
            case 'grok':
                models = [
                    { value: 'grok-beta', label: 'Grok Beta' },
                    { value: 'grok-1', label: 'Grok-1' }
                ];
                break;
            case 'perplexity':
                models = [
                    { value: 'llama-3.1-8b', label: 'Llama 3.1 8B' },
                    { value: 'llama-3.1-70b', label: 'Llama 3.1 70B' }
                ];
                break;
        }
        
        modelSelect.innerHTML = models.map(model => 
            `<option value="${model.value}">${model.label}</option>`
        ).join('');
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
        // Handle API key input change
        console.log('xMatic: API key changed...');
        this.updateConnectionStatus('Not tested');
    }

    handleModelChange() {
        // Handle model selection change
        console.log('xMatic: Model changed...');
        this.updateConnectionStatus('Not tested');
    }

    updateConnectionStatus(status, type = 'info') {
        const statusElement = document.querySelector('#connectionStatus');
        if (!statusElement) return;
        
        const statusText = statusElement.querySelector('.status-text');
        const statusDot = statusElement.querySelector('.status-dot');
        
        if (statusText) statusText.textContent = status;
        if (statusDot) {
            statusDot.className = `status-dot ${type}`;
        }
    }

    handleSave() {
        // Handle saving AI configuration
        console.log('xMatic: Saving AI config...');
        // TODO: Save to storage manager
        this.updateConnectionStatus('Configuration saved', 'success');
    }

    handleTest() {
        // Handle testing connection
        console.log('xMatic: Testing connection...');
        this.handleTestNow();
    }

    handleTestNow() {
        // Handle testing connection now
        console.log('xMatic: Testing connection now...');
        this.updateConnectionStatus('Testing...', 'warning');
        
        // Simulate test (replace with actual API test)
        setTimeout(() => {
            this.updateConnectionStatus('Connection successful', 'success');
        }, 2000);
    }
}

// Export for use in floating panel
if (typeof window !== 'undefined') {
    window.AITab = AITab;
}
