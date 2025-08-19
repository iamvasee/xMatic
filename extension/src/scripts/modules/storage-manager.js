// xMatic - Storage Manager
class StorageManager {
    constructor() {
        this.listeners = new Set();
    }

    // Get configuration from storage
    async getConfig() {
        return await chrome.storage.sync.get([
            'openaiKey', 
            'grokKey', 
            'selectedProvider', 
            'style', 
            'selectedModel', 
            'extensionEnabled'
        ]);
    }

    // Get specific configuration value
    async getConfigValue(key) {
        const result = await chrome.storage.sync.get([key]);
        return result[key];
    }

    // Set configuration value
    async setConfigValue(key, value) {
        await chrome.storage.sync.set({ [key]: value });
    }

    // Set multiple configuration values
    async setConfig(config) {
        await chrome.storage.sync.set(config);
    }

    // Setup storage change listener
    setupStorageListener(callback) {
        const listener = (changes, namespace) => {
            if (namespace === 'sync' && changes.extensionEnabled) {
                callback(changes.extensionEnabled);
            }
        };

        chrome.storage.onChanged.addListener(listener);
        this.listeners.add(listener);

        return listener;
    }

    // Remove storage change listener
    removeStorageListener(listener) {
        if (listener) {
            chrome.storage.onChanged.removeListener(listener);
            this.listeners.delete(listener);
        }
    }

    // Cleanup all listeners
    cleanup() {
        this.listeners.forEach(listener => {
            chrome.storage.onChanged.removeListener(listener);
        });
        this.listeners.clear();
    }

    // Check if extension is enabled
    async isExtensionEnabled() {
        const config = await this.getConfigValue('extensionEnabled');
        return config !== false; // Default to true if not set
    }

    // Get API key for selected provider
    async getApiKey(provider = null) {
        if (!provider) {
            const config = await this.getConfig();
            provider = config.selectedProvider || 'openai';
        }

        if (provider === 'grok') {
            return await this.getConfigValue('grokKey');
        } else {
            return await this.getConfigValue('openaiKey');
        }
    }

    // Check if API key is configured for provider
    async hasApiKey(provider = null) {
        const apiKey = await this.getApiKey(provider);
        return !!apiKey;
    }

    // Get AI model configuration
    async getAIModel() {
        const config = await this.getConfig();
        return config.selectedModel || 'gpt-4';
    }

    // Get response style configuration
    async getResponseStyle() {
        const config = await this.getConfig();
        return config.style || 'conversational and helpful';
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}
