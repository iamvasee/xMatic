// xMatic - Generate Tab Script
// This file will handle AI reply generation functionality

class GenerateTab {
    constructor() {
        this.init();
    }

    init() {
        // Initialize generate tab functionality
        console.log('xMatic: 🚀 Generate tab initialized');
        
        // Check configuration status after a short delay
        setTimeout(() => {
            this.checkConfigurationStatus();
        }, 1000);
    }

    render(container) {
        // Render the generate tab content
        container.innerHTML = `
            <div class="tab-header">
                <div class="tab-header-content">
                    <h3>Generate Original Tweets</h3>
                    <p>Create unique AI-powered tweets from your context</p>
                </div>
            </div>
            
            <div class="generate-content">
                <!-- Context Input -->
                <div class="simple-form-group">
                    <label>Context for Tweet Generation</label>
                    <textarea 
                        id="contextInput" 
                        class="simple-textarea large" 
                        placeholder="Enter the topic, idea, or context you want AI to create original tweets about..."
                        rows="6"
                    ></textarea>
                </div>

                <!-- Tweet Count Selection -->
                <div class="simple-form-group">
                    <label>Number of Tweets to Generate</label>
                    <div class="count-selector">
                        <input 
                            type="number" 
                            id="tweetCount" 
                            class="simple-input count-input" 
                            min="1" 
                            max="10" 
                            value="3"
                        >
                        <span class="count-label">tweets (1-10)</span>
                    </div>
                </div>

                <!-- Generate Button -->
                <div class="simple-form-group">
                    <button type="button" id="generateTweets" class="generate-btn">
                        <span class="btn-text">Generate Original Tweets</span>
                        <span class="btn-loading" style="display: none;">
                            <svg class="spinner" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                                    <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                                    <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                                </circle>
                            </svg>
                            Generating...
                        </span>
                    </button>
                </div>
                
                <!-- Bottom Spacing for Footer -->
                <div class="bottom-spacing"></div>
            </div>
        `;
        
        this.setupEventListeners(container);
    }

    setupEventListeners(container) {
        // Setup event listeners for the generate tab
        const generateBtn = container.querySelector('#generateTweets');
        const contextInput = container.querySelector('#contextInput');
        const tweetCount = container.querySelector('#tweetCount');
        
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.handleGenerate());
            console.log('xMatic: 🚀 Generate button event listener added');
        }
        
        if (contextInput) {
            contextInput.addEventListener('input', () => this.handleContextChange());
            console.log('xMatic: 🚀 Context input event listener added');
        }
        
        if (tweetCount) {
            tweetCount.addEventListener('change', () => this.handleCountChange());
            console.log('xMatic: 🚀 Tweet count event listener added');
        }
        
        console.log('xMatic: 🚀 All generate tab event listeners set up successfully');
    }

    handleGenerate() {
        // Handle AI tweet generation
        console.log('xMatic: 🚀 Starting AI tweet generation...');
        
        const contextInput = document.querySelector('#contextInput');
        const tweetCount = document.querySelector('#tweetCount');
        const generateBtn = document.querySelector('#generateTweets');
        
        if (!contextInput || !tweetCount || !generateBtn) {
            console.error('xMatic: 🚀 Required elements not found');
            return;
        }
        
        const context = contextInput.value.trim();
        const count = parseInt(tweetCount.value);
        
        if (!context) {
            console.log('xMatic: 🚀 No context provided');
            // TODO: Show error message to user
            return;
        }
        
        if (count < 1 || count > 10) {
            console.log('xMatic: 🚀 Invalid tweet count');
            // TODO: Show error message to user
            return;
        }
        
        // Show loading state
        this.showLoadingState(generateBtn, true);
        
        // Generate tweets using AI API
        this.generateTweetsWithAI(context, count);
    }

    handleContextChange() {
        // Handle context input changes
        console.log('xMatic: 🚀 Context input changed');
    }

    handleCountChange() {
        // Handle tweet count changes
        console.log('xMatic: 🚀 Tweet count changed to:', document.querySelector('#tweetCount')?.value);
    }

    showLoadingState(button, isLoading) {
        const btnText = button.querySelector('.btn-text');
        const btnLoading = button.querySelector('.btn-loading');
        
        if (isLoading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline-flex';
            button.disabled = true;
            button.classList.add('loading');
        } else {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            button.disabled = false;
            button.classList.remove('loading');
        }
    }

    async generateTweetsWithAI(context, count) {
        try {
            console.log('xMatic: 🚀 Calling AI API for', count, 'tweets...');
            
                    // Get user's AI configuration
        const config = await this.getUserConfig();
        
        if (!config) {
            throw new Error('Please configure your AI settings in the AI tab first. You need to select a provider, add an API key, and choose a model.');
        }
            
            // Create AI handler instance
            const aiHandler = new window.AIAPIHandler(config);
            
            // Generate tweets
            const tweets = await aiHandler.generateMultipleReplies(context, count);
            
            console.log('xMatic: 🚀 Generated tweets:', tweets);
            
            // Save to drafts tab
            await this.saveToDrafts(tweets, context);
            
            // Clear context and show success
            this.clearContext();
            this.showSuccessMessage(count);
            
            // Auto-switch to drafts tab to show generated content
            this.switchToDraftsTab();
            
        } catch (error) {
            console.error('xMatic: 🚀 AI generation failed:', error);
            this.showErrorMessage(error.message);
        } finally {
            // Hide loading state
            const generateBtn = document.querySelector('#generateTweets');
            if (generateBtn) {
                this.showLoadingState(generateBtn, false);
            }
        }
    }

    async getUserConfig() {
        try {
            console.log('xMatic: 🚀 Getting user configuration...');
            
            return new Promise((resolve) => {
                chrome.storage.sync.get([
                    'selectedProvider',
                    'selectedModel',
                    'openaiKey',
                    'grokKey',
                    'maxTokens',
                    'temperature',
                    'style',
                    'customStyleInstructions'
                ], (result) => {
                    console.log('xMatic: 🚀 Retrieved config from storage:', result);
                    
                    // Check if we have the minimum required config
                    if (!result.selectedProvider || !result.selectedModel) {
                        console.warn('xMatic: 🚀 Missing required config: provider or model');
                        resolve(null);
                        return;
                    }
                    
                    // Check if we have API key for selected provider
                    const apiKey = result.selectedProvider === 'grok' ? result.grokKey : result.openaiKey;
                    if (!apiKey) {
                        console.warn('xMatic: 🚀 Missing API key for provider:', result.selectedProvider);
                        resolve(null);
                        return;
                    }
                    
                    console.log('xMatic: 🚀 Configuration validation passed');
                    resolve(result);
                });
            });
        } catch (error) {
            console.error('xMatic: 🚀 Error getting user config:', error);
            return null;
        }
    }

    checkConfigurationStatus() {
        // Check if user has configured AI settings
        chrome.storage.sync.get([
            'selectedProvider',
            'selectedModel',
            'openaiKey',
            'grokKey'
        ], (result) => {
            const hasProvider = !!result.selectedProvider;
            const hasModel = !!result.selectedModel;
            const hasOpenAIKey = !!result.openaiKey;
            const hasGrokKey = !!result.grokKey;
            
            console.log('xMatic: 🚀 Configuration status:', {
                hasProvider,
                hasModel,
                hasOpenAIKey,
                hasGrokKey
            });
            
            // Show configuration status to user
            if (!hasProvider || !hasModel) {
                this.showConfigurationWarning('Please select an AI provider and model in the AI tab.');
            } else if (result.selectedProvider === 'openai' && !hasOpenAIKey) {
                this.showConfigurationWarning('Please add your OpenAI API key in the AI tab.');
            } else if (result.selectedProvider === 'grok' && !hasGrokKey) {
                this.showConfigurationWarning('Please add your Grok API key in the AI tab.');
            }
        });
    }

    showConfigurationWarning(message) {
        console.warn('xMatic: 🚀 Configuration warning:', message);
        
        // Show warning notification
        const notification = document.createElement('div');
        notification.className = 'warning-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">⚠️</span>
                <span class="notification-text">${message}</span>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 8 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 8000);
    }

    async saveToDrafts(tweets, context) {
        // Save generated tweets to drafts
        console.log('xMatic: 🚀 Saving', tweets.length, 'tweets to drafts...');
        
        const drafts = tweets.map((tweet, index) => ({
            id: `generated-${Date.now()}-${index}`,
            text: tweet,
            context: context.substring(0, 200) + (context.length > 200 ? '...' : ''), // Truncate context
            createdAt: new Date().toISOString(),
            style: 'AI Generated',
            type: 'generated'
        }));
        
        // Try to use StorageManager if available, but skip it if we know it has quota issues
        if (window.StorageManager && !this.storageManagerQuotaExceeded) {
            try {
                const storageManager = new window.StorageManager();
                await this.saveDraftsWithStorageManager(storageManager, drafts);
            } catch (error) {
                console.warn('xMatic: 🚀 StorageManager failed, marking as quota exceeded and using direct storage:', error);
                this.storageManagerQuotaExceeded = true; // Remember this for future calls
                await this.saveDraftsDirectly(drafts);
            }
        } else {
            // Use direct storage (either no StorageManager or quota exceeded)
            if (this.storageManagerQuotaExceeded) {
                console.log('xMatic: 🚀 Skipping StorageManager due to previous quota issues, using direct storage');
            }
            await this.saveDraftsDirectly(drafts);
        }
    }

    async saveDraftsWithStorageManager(storageManager, drafts) {
        console.log('xMatic: 🚀 Using StorageManager to save drafts...');
        
        // Get existing drafts
        const existingDrafts = await storageManager.getConfigValue('drafts') || [];
        const updatedDrafts = [...drafts, ...existingDrafts];
        
        // Save using StorageManager
        await storageManager.setConfigValue('drafts', updatedDrafts);
        
        console.log('xMatic: 🚀 Drafts saved successfully using StorageManager');
        
        // Trigger custom event to refresh drafts tab
        window.dispatchEvent(new CustomEvent('draftsUpdated', { 
            detail: { newDrafts: drafts } 
        }));
    }

    saveDraftsDirectly(drafts) {
        return new Promise((resolve) => {
            console.log('xMatic: 🚀 Direct storage fallback - saving', drafts.length, 'drafts...');
            
            // Try sync storage first for maximum persistence across sessions
            chrome.storage.sync.get(['drafts'], (syncResult) => {
                const existingSyncDrafts = syncResult.drafts || [];
                const updatedSyncDrafts = [...drafts, ...existingSyncDrafts];
                
                console.log('xMatic: 🚀 Trying sync storage first for persistence across sessions...');
                
                chrome.storage.sync.set({ drafts: updatedSyncDrafts }, (syncStorageResult) => {
                    if (chrome.runtime.lastError) {
                        console.warn('xMatic: 🚀 Sync storage failed, falling back to local storage:', chrome.runtime.lastError);
                        this.saveToLocalStorage(drafts, resolve);
                    } else {
                        console.log('xMatic: 🚀 Drafts saved to sync storage successfully! Will persist across browser sessions. Total drafts now:', updatedSyncDrafts.length);
                        
                        // Also save to local storage as backup
                        this.saveToLocalStorage(drafts, () => {
                            // Trigger custom event to refresh drafts tab
                            window.dispatchEvent(new CustomEvent('draftsUpdated', { 
                                detail: { newDrafts: drafts } 
                            }));
                            resolve(true);
                        });
                    }
                });
            });
        });
    }

    saveToLocalStorage(drafts, callback) {
        // Use local storage as backup for large content
        chrome.storage.local.get(['drafts'], (result) => {
            const existingLocalDrafts = result.drafts || [];
            const updatedLocalDrafts = [...drafts, ...existingLocalDrafts];
            
            console.log('xMatic: 🚀 Saving backup to local storage with', existingLocalDrafts.length, 'existing drafts');
            
            chrome.storage.local.set({ drafts: updatedLocalDrafts }, (storageResult) => {
                if (chrome.runtime.lastError) {
                    console.warn('xMatic: 🚀 Local storage failed, trying localStorage as last resort:', chrome.runtime.lastError);
                    this.saveToLocalStorageFallback(drafts, callback);
                } else {
                    console.log('xMatic: 🚀 Backup saved to local storage successfully. Total local drafts now:', updatedLocalDrafts.length);
                    callback();
                }
            });
        });
    }

    saveToLocalStorageFallback(drafts, callback) {
        // Last resort: use browser's localStorage
        try {
            const existingDrafts = JSON.parse(localStorage.getItem('xMatic_drafts') || '[]');
            const updatedDrafts = [...drafts, ...existingDrafts];
            
            localStorage.setItem('xMatic_drafts', JSON.stringify(updatedDrafts));
            console.log('xMatic: 🚀 Drafts saved to localStorage as last resort. Total drafts now:', updatedDrafts.length);
            
            callback();
        } catch (error) {
            console.error('xMatic: 🚀 All storage methods failed:', error);
            callback();
        }
    }

    saveMinimalDrafts(tweets, context) {
        // Save minimal draft data to avoid storage issues
        console.log('xMatic: 🚀 Attempting minimal draft save...');
        
        const minimalDrafts = tweets.map((tweet, index) => ({
            id: `generated-${Date.now()}-${index}`,
            text: tweet.substring(0, 100) + (tweet.length > 100 ? '...' : ''), // Truncate tweet
            context: context.substring(0, 100) + (context.length > 100 ? '...' : ''), // Truncate context
            createdAt: new Date().toISOString(),
            style: 'AI Generated',
            type: 'generated'
        }));
        
        // Try to save to sync storage with minimal data
        chrome.storage.sync.get(['drafts'], (result) => {
            const existingDrafts = result.drafts || [];
            const updatedDrafts = [...minimalDrafts, ...existingDrafts];
            
            chrome.storage.sync.set({ drafts: updatedDrafts }, () => {
                console.log('xMatic: 🚀 Minimal drafts saved to sync storage');
                
                // Trigger custom event to refresh drafts tab
                window.dispatchEvent(new CustomEvent('draftsUpdated', { 
                    detail: { newDrafts: minimalDrafts } 
                }));
            });
        });
    }

    clearContext() {
        const contextInput = document.querySelector('#contextInput');
        if (contextInput) {
            contextInput.value = '';
        }
    }

    showSuccessMessage(count) {
        console.log('xMatic: 🚀 Successfully generated', count, 'tweets');
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✅</span>
                <span class="notification-text">Successfully generated ${count} original tweets! Check the Drafts tab.</span>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    showErrorMessage(message) {
        console.error('xMatic: 🚀 Error:', message);
        
        // Show error notification
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">❌</span>
                <span class="notification-text">Error: ${message}</span>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    switchToDraftsTab() {
        // Switch to drafts tab after successful generation
        console.log('xMatic: 🚀 Auto-switching to drafts tab...');
        
        // Check if the floating panel is available
        if (window.xMaticPanel && typeof window.xMaticPanel.switchTab === 'function') {
            // Use the panel's built-in tab switching method
            window.xMaticPanel.switchTab('drafts');
            console.log('xMatic: 🚀 Successfully switched to drafts tab');
        } else {
            // Fallback: manually trigger tab switching
            console.log('xMatic: 🚀 Using fallback tab switching method');
            this.triggerTabSwitch('drafts');
        }
    }

    triggerTabSwitch(tabName) {
        // Fallback method to switch tabs if panel method is not available
        try {
            // Find the tab button and click it
            const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
            if (tabButton) {
                console.log('xMatic: 🚀 Found tab button, clicking to switch...');
                tabButton.click();
            } else {
                console.warn('xMatic: 🚀 Tab button not found for:', tabName);
            }
        } catch (error) {
            console.error('xMatic: 🚀 Error switching tabs:', error);
        }
    }
}

// Export for use in floating panel
if (typeof window !== 'undefined') {
    window.GenerateTab = GenerateTab;
}
