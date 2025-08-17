// Main App JavaScript
class xMaticApp {
    constructor() {
        this.components = {};
        this.init();
    }

    async init() {
        try {
            this.initializeComponents();
            this.bindEvents();
            this.loadConfiguration();
        } catch (error) {
            console.error('Failed to initialize app:', error);
        }
    }

    initializeComponents() {
        // Initialize Header component
        if (typeof Header !== 'undefined') {
            this.components.header = new Header();
        }
        
        // Initialize Sidebar component
        if (typeof Sidebar !== 'undefined') {
            this.components.sidebar = new Sidebar();
        }
        
        // Initialize Settings Section functionality
        this.initializeSettingsSection();
        
        // Initialize Keys Section functionality
        this.initializeKeysSection();
    }

    initializeSettingsSection() {
        // Initialize Settings section functionality
        this.initializeStyleConfiguration();
        this.initializeModelConfiguration();
    }

    initializeKeysSection() {
        // Initialize Keys section functionality
        this.initializeAPIKeyConfiguration();
    }

    initializeStyleConfiguration() {
        const styleSelect = document.getElementById('styleSelect');
        const customStyleInput = document.getElementById('customStyleInput');
        const customStyleGroup = document.getElementById('customStyleGroup');
        const stylePreview = document.getElementById('stylePreview');
        const saveStyleConfigBtn = document.getElementById('saveStyleConfig');

        if (styleSelect && customStyleInput && customStyleGroup && stylePreview && saveStyleConfigBtn) {
            // Style selection change handler
            styleSelect.addEventListener('change', () => {
                const selectedStyle = styleSelect.value;
                if (selectedStyle === 'custom') {
                    customStyleGroup.style.display = 'block';
                } else {
                    customStyleGroup.style.display = 'none';
                    this.updateStylePreview(selectedStyle);
                }
            });

            // Custom style input handler
            customStyleInput.addEventListener('input', () => {
                this.updateCustomStylePreview();
            });

            // Save style configuration
            saveStyleConfigBtn.addEventListener('click', () => {
                this.saveStyleConfiguration();
            });
        }
    }

    initializeModelConfiguration() {
        const modelSelect = document.getElementById('modelSelect');
        const saveModelConfigBtn = document.getElementById('saveModelConfig');

        if (modelSelect && saveModelConfigBtn) {
            // Model selection change handler
            modelSelect.addEventListener('change', () => {
                this.updateModelCost();
            });

            // Save model configuration
            saveModelConfigBtn.addEventListener('click', () => {
                this.saveModelConfiguration();
            });
        }
    }

    initializeAPIKeyConfiguration() {
        const saveConfigBtn = document.getElementById('saveConfig');
        const testConnectionBtn = document.getElementById('testConnection');

        if (saveConfigBtn) {
            saveConfigBtn.addEventListener('click', () => {
                this.saveConfiguration();
            });
        }

        if (testConnectionBtn) {
            testConnectionBtn.addEventListener('click', () => {
                this.testConnection();
            });
        }
    }

    updateStylePreview(styleType) {
        const stylePreview = document.getElementById('stylePreview');
        if (stylePreview) {
            const styles = {
                professional: "Professional and business-focused responses with industry expertise and formal communication style.",
                casual: "Warm, friendly responses that feel natural and conversational while being genuinely helpful.",
                sarcastic: "Witty and clever responses with playful sarcasm that entertains while adding value.",
                unhinged: "Bold, energetic responses with wild creativity that grab attention and stand out.",
                technical: "Technical and precise responses with actionable advice for developers and tech professionals.",
                creative: "Imaginative and memorable responses that spark curiosity and creative thinking.",
                supportive: "Encouraging and empathetic responses that offer genuine support and positive reinforcement."
            };
            
            stylePreview.textContent = styles[styleType] || "Select a style above to see a preview.";
        }
    }

    updateCustomStylePreview() {
        const customStyleInput = document.getElementById('customStyleInput');
        const stylePreview = document.getElementById('stylePreview');
        
        if (customStyleInput && stylePreview) {
            const customStyle = customStyleInput.value.trim();
            if (customStyle) {
                stylePreview.textContent = `Custom style: ${customStyle}`;
            } else {
                stylePreview.textContent = "Enter your custom style instructions above.";
            }
        }
    }

    updateModelCost() {
        const modelSelect = document.getElementById('modelSelect');
        const modelCost = document.getElementById('modelCost');
        
        if (modelSelect && modelCost) {
            const modelCosts = {
                'gpt-4': '~$0.03 per response',
                'gpt-4-turbo': '~$0.01 per response',
                'gpt-3.5-turbo': '~$0.002 per response'
            };
            
            const selectedModel = modelSelect.value;
            modelCost.textContent = modelCosts[selectedModel] || '$0.01 per response';
        }
    }

    async saveStyleConfiguration() {
        const styleSelect = document.getElementById('styleSelect');
        const customStyleInput = document.getElementById('customStyleInput');
        const saveStyleConfigBtn = document.getElementById('saveStyleConfig');
        
        if (!styleSelect || !customStyleInput || !saveStyleConfigBtn) return;
        
        const selectedStyleType = styleSelect.value;
        const customStyle = customStyleInput.value.trim();
        
        if (selectedStyleType === 'custom' && !customStyle) {
            this.showStatus('Please enter custom style instructions', 'error');
            return;
        }
        
        try {
            let styleToSave;
            if (selectedStyleType === 'custom') {
                styleToSave = customStyle;
            } else {
                const styles = {
                    professional: "Write professional, insightful responses that add value to business discussions. Use industry terminology appropriately and maintain a formal tone. Keep responses under 280 characters.",
                    casual: "Be conversational and friendly. Use a warm, approachable tone that feels natural and engaging. Add personality while staying helpful. Keep responses under 280 characters.",
                    sarcastic: "Be witty and sarcastic, but not mean-spirited. Use clever humor and playful jabs. Make responses memorable and entertaining while still adding value. Keep responses under 280 characters.",
                    unhinged: "Be bold, chaotic, and unpredictable! Use wild analogies, unexpected comparisons, and energetic language. Stand out with creative, attention-grabbing responses. Keep responses under 280 characters.",
                    technical: "Provide technical insights and detailed explanations. Use precise terminology and offer actionable advice for developers and tech professionals. Keep responses under 280 characters.",
                    creative: "Be imaginative and memorable. Use creative metaphors, ask thought-provoking questions, and make responses that spark curiosity and engagement. Keep responses under 280 characters.",
                    supportive: "Be encouraging and empathetic. Offer genuine support, positive reinforcement, and helpful advice. Create a welcoming, uplifting tone in all responses. Keep responses under 280 characters."
                };
                styleToSave = styles[selectedStyleType];
            }
            
            const configToSave = {
                selectedStyleType: selectedStyleType,
                style: styleToSave
            };
            
            await chrome.storage.sync.set(configToSave);
            this.showStatus('✅ Style configuration saved successfully!', 'success');
            
            // Update save button temporarily
            const originalText = saveStyleConfigBtn.textContent;
            saveStyleConfigBtn.textContent = 'Saved!';
            saveStyleConfigBtn.style.background = '#16a34a';
            
            setTimeout(() => {
                saveStyleConfigBtn.textContent = originalText;
                saveStyleConfigBtn.style.background = '';
            }, 2000);
            
        } catch (error) {
            this.showStatus('❌ Failed to save style configuration', 'error');
        }
    }

    async saveModelConfiguration() {
        const modelSelect = document.getElementById('modelSelect');
        const saveModelConfigBtn = document.getElementById('saveModelConfig');
        
        if (!modelSelect || !saveModelConfigBtn) return;
        
        const selectedModel = modelSelect.value;
        
        try {
            const configToSave = {
                selectedModel: selectedModel
            };
            
            await chrome.storage.sync.set(configToSave);
            this.showStatus('✅ Model configuration saved successfully!', 'success');
            
            // Update save button temporarily
            const originalText = saveModelConfigBtn.textContent;
            saveModelConfigBtn.textContent = 'Saved!';
            saveModelConfigBtn.style.background = '#16a34a';
            
            setTimeout(() => {
                saveModelConfigBtn.textContent = originalText;
                saveModelConfigBtn.style.background = '';
            }, 2000);
            
        } catch (error) {
            this.showStatus('❌ Failed to save model configuration', 'error');
        }
    }

    async saveConfiguration() {
        const apiKey = document.getElementById('openaiKey')?.value?.trim();
        
        if (!apiKey) {
            this.showStatus('Please enter your OpenAI API key', 'error');
            return;
        }
        
        if (!apiKey.startsWith('sk-')) {
            this.showStatus('Please enter a valid OpenAI API key', 'error');
            return;
        }
        
        try {
            const configToSave = {
                openaiKey: apiKey
            };
            
            await chrome.storage.sync.set(configToSave);
            this.showStatus('✅ API configuration saved successfully!', 'success');
            
        } catch (error) {
            this.showStatus('❌ Failed to save configuration', 'error');
        }
    }

    async testConnection() {
        const testButton = document.getElementById('testConnection');
        const connectionStatus = document.getElementById('connectionStatus');
        
        if (!testButton || !connectionStatus) return;
        
        // Get API key
        const config = await chrome.storage.sync.get(['openaiKey']);
        if (!config.openaiKey) {
            this.showStatus('Please save your API key first', 'error');
            return;
        }
        
        // Show loading state
        testButton.disabled = true;
        testButton.querySelector('.btn-text').style.display = 'none';
        testButton.querySelector('.btn-loading').style.display = 'inline-flex';
        
        try {
            // Test API connection
            const response = await fetch('https://api.openai.com/v1/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${config.openaiKey}`
                }
            });
            
            if (response.ok) {
                connectionStatus.textContent = '✅ Connection successful!';
                connectionStatus.className = 'status-message success';
                connectionStatus.style.display = 'block';
                this.showStatus('✅ Connection test successful!', 'success');
            } else {
                throw new Error(`API request failed: ${response.status}`);
            }
            
        } catch (error) {
            connectionStatus.textContent = `❌ Connection failed: ${error.message}`;
            connectionStatus.className = 'status-message error';
            connectionStatus.style.display = 'block';
            this.showStatus(`❌ Connection test failed: ${error.message}`, 'error');
        } finally {
            // Reset button state
            testButton.disabled = false;
            testButton.querySelector('.btn-text').style.display = 'inline';
            testButton.querySelector('.btn-loading').style.display = 'none';
        }
    }

    async loadConfiguration() {
        try {
            const config = await chrome.storage.sync.get([
                'openaiKey', 'style', 'selectedStyleType', 'selectedModel'
            ]);
            
            // Load API key
            if (config.openaiKey) {
                const openaiKeyInput = document.getElementById('openaiKey');
                if (openaiKeyInput) {
                    openaiKeyInput.value = config.openaiKey;
                }
            }
            
            // Load selected model
            if (config.selectedModel) {
                const modelSelect = document.getElementById('modelSelect');
                if (modelSelect) {
                    modelSelect.value = config.selectedModel;
                    this.updateModelCost();
                }
            }
            
            // Load selected style
            if (config.selectedStyleType) {
                const styleSelect = document.getElementById('styleSelect');
                const customStyleInput = document.getElementById('customStyleInput');
                const customStyleGroup = document.getElementById('customStyleGroup');
                
                if (styleSelect) {
                    styleSelect.value = config.selectedStyleType;
                    
                    if (config.selectedStyleType === 'custom' && customStyleInput && customStyleGroup) {
                        customStyleGroup.style.display = 'block';
                        customStyleInput.value = config.style || '';
                    }
                }
                
                this.updateStylePreview(config.selectedStyleType);
            }
            
        } catch (error) {
            console.error('Failed to load configuration:', error);
        }
    }

    showStatus(message, type) {
        // Create a temporary status message
        const statusElement = document.createElement('div');
        statusElement.className = `status-message ${type}`;
        statusElement.textContent = message;
        statusElement.style.position = 'fixed';
        statusElement.style.top = '20px';
        statusElement.style.right = '20px';
        statusElement.style.zIndex = '1000';
        statusElement.style.maxWidth = '300px';
        statusElement.style.boxShadow = 'var(--shadow-lg)';
        
        document.body.appendChild(statusElement);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (statusElement.parentNode) {
                statusElement.parentNode.removeChild(statusElement);
            }
        }, 5000);
    }

    bindEvents() {
        // Global event listeners
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveConfiguration();
            }
            
            // Ctrl/Cmd + T to test connection
            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                this.testConnection();
            }
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.xMaticApp = new xMaticApp();
});
