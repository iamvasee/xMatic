// xMatic - Storage Manager
class StorageManager {
    constructor() {
        this.listeners = new Set();
    }

    // Get configuration from storage
    async getConfig() {
        try {
            // Check if chrome.storage is available (extension context valid)
            if (!chrome || !chrome.storage || !chrome.storage.sync) {
                console.warn('xMatic: 🗄️ Chrome storage API not available - extension context may be invalid');
                return {};
            }
            
            return await chrome.storage.sync.get([
                'openaiKey', 
                'grokKey', 
                'selectedProvider', 
                'style', 
                'selectedModel', 
                'extensionEnabled'
            ]);
        } catch (error) {
            console.error('xMatic: 🗄️ Error accessing storage:', error);
            // Return empty config to prevent crashes
            return {};
        }
    }

    // Get specific configuration value
    async getConfigValue(key) {
        try {
            if (!chrome || !chrome.storage || !chrome.storage.sync) {
                console.warn('xMatic: 🗄️ Chrome storage API not available - extension context may be invalid');
                return null;
            }
            
            const result = await chrome.storage.sync.get([key]);
            return result[key];
        } catch (error) {
            console.error('xMatic: 🗄️ Error getting config value:', error);
            return null;
        }
    }

    // Set configuration value
    async setConfigValue(key, value) {
        try {
            if (!chrome || !chrome.storage || !chrome.storage.sync) {
                console.warn('xMatic: 🗄️ Chrome storage API not available - extension context may be invalid');
                return false;
            }
            
            await chrome.storage.sync.set({ [key]: value });
            return true;
        } catch (error) {
            console.error('xMatic: 🗄️ Error setting config value:', error);
            return false;
        }
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

// Export for use in browser environment
if (typeof window !== 'undefined') {
    window.StorageManager = StorageManager;
    console.log('xMatic: 🗄️ StorageManager exported to window object');
}
