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
                'customStyleInstructions',
                'selectedModel', 
                'extensionEnabled'
            ]);
        } catch (error) {
            // Return empty config to prevent crashes
            return {};
        }
    }

    // Get specific configuration value
    async getConfigValue(key) {
        try {
            if (!chrome || !chrome.storage) {
                console.warn('xMatic: 🗄️ Chrome storage API not available - extension context may be invalid');
                return null;
            }
            
            // For drafts, get from local storage (higher quota)
            if (key === 'drafts') {
                if (!chrome.storage.local) {
                    throw new Error('Local storage not available');
                }
                
                const result = await chrome.storage.local.get([key]);
                const drafts = result[key];
                
                // Check if drafts are chunked and reconstruct if needed
                if (drafts && Array.isArray(drafts) && drafts.length > 0 && drafts[0]._chunked) {
                    console.log('xMatic: 🗄️ Reconstructing chunked drafts...');
                    return await this.reconstructChunkedData(key);
                }
                
                return drafts;
            } else {
                // For config values, get from sync storage
                if (!chrome.storage.sync) {
                    throw new Error('Sync storage not available');
                }
                const result = await chrome.storage.sync.get([key]);
                return result[key];
            }
        } catch (error) {
            console.error('xMatic: 🗄️ Error getting config value:', error);
            return null;
        }
    }

    // Set configuration value
    async setConfigValue(key, value) {
        try {
            if (!chrome || !chrome.storage) {
                console.warn('xMatic: 🗄️ Chrome storage API not available - extension context may be invalid');
                return false;
            }
            
            // Use local storage for drafts (higher quota) and sync storage for config
            if (key === 'drafts') {
                // For drafts, use local storage which has much higher limits
                if (!chrome.storage.local) {
                    throw new Error('Local storage not available');
                }
                
                // Check if data is too large and chunk if needed
                const dataSize = JSON.stringify(value).length;
                console.log(`xMatic: 🗄️ Saving ${key} with size: ${dataSize} bytes`);
                
                if (dataSize > 5000000) { // 5MB limit for local storage
                    console.warn('xMatic: 🗄️ Data too large, attempting to chunk...');
                    return await this.saveChunkedData(key, value);
                }
                
                await chrome.storage.local.set({ [key]: value });
                console.log('xMatic: 🗄️ Drafts saved to local storage successfully');
            } else {
                // For config values, use sync storage
                if (!chrome.storage.sync) {
                    throw new Error('Sync storage not available');
                }
                await chrome.storage.sync.set({ [key]: value });
            }
            
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

    // Save response style configuration
    async saveResponseStyle(style) {
        try {
            await this.setConfigValue('style', style);
            console.log('xMatic: 🗄️ Style saved successfully:', style);
            return true;
        } catch (error) {
            console.error('xMatic: 🗄️ Error saving style:', error);
            return false;
        }
    }

    // Get custom style instructions
    async getCustomStyleInstructions() {
        const config = await this.getConfig();
        return config.customStyleInstructions || '';
    }

    // Save custom style instructions
    async saveCustomStyleInstructions(instructions) {
        try {
            await this.setConfigValue('customStyleInstructions', instructions);
            console.log('xMatic: 🗄️ Custom style instructions saved successfully');
            return true;
        } catch (error) {
            console.error('xMatic: 🗄️ Error saving custom style instructions:', error);
            return false;
        }
    }

    // Save large data in chunks to avoid quota limits
    async saveChunkedData(key, data) {
        try {
            console.log('xMatic: 🗄️ Chunking large data for storage...');
            
            // Split data into chunks of 1000 items
            const chunkSize = 1000;
            const chunks = [];
            
            for (let i = 0; i < data.length; i += chunkSize) {
                const chunk = data.slice(i, i + chunkSize);
                chunks.push({
                    _chunked: true,
                    _chunkIndex: i / chunkSize,
                    _totalChunks: Math.ceil(data.length / chunkSize),
                    data: chunk
                });
            }
            
            // Save chunks to local storage
            await chrome.storage.local.set({ [key]: chunks });
            console.log(`xMatic: 🗄️ Data chunked into ${chunks.length} pieces and saved successfully`);
            
            return true;
        } catch (error) {
            console.error('xMatic: 🗄️ Error saving chunked data:', error);
            return false;
        }
    }

    // Reconstruct chunked data
    async reconstructChunkedData(key) {
        try {
            const result = await chrome.storage.local.get([key]);
            const chunks = result[key];
            
            if (!chunks || !Array.isArray(chunks)) {
                return [];
            }
            
            // Sort chunks by index and reconstruct
            const sortedChunks = chunks.sort((a, b) => a._chunkIndex - b._chunkIndex);
            const reconstructedData = [];
            
            for (const chunk of sortedChunks) {
                if (chunk.data && Array.isArray(chunk.data)) {
                    reconstructedData.push(...chunk.data);
                }
            }
            
            console.log(`xMatic: 🗄️ Reconstructed ${reconstructedData.length} items from ${chunks.length} chunks`);
            return reconstructedData;
            
        } catch (error) {
            console.error('xMatic: 🗄️ Error reconstructing chunked data:', error);
            return [];
        }
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
