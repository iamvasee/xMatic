// xMatic - Simple Twitter AI Reply Tool

class XMatic {
    constructor() {
        this.config = null;
        this.robotSvg = null;
        this.timeSvg = null;
        this.aiHandler = null;
        this.uiManager = null;
        this.storageManager = null;
        this.contextExtractor = null;
        this.textInsertionManager = null;
        this.observer = null;
        this.addButtonsTimeout = null;

        this.init();
    }

    async init() {
        // Nuclear cleanup first - remove everything xMatic related
        this.nuclearCleanup();
        
        this.storageManager = new StorageManager();
        this.contextExtractor = new ContextExtractor();
        this.textInsertionManager = new TextInsertionManager();
        this.config = await this.storageManager.getConfig();
        this.aiHandler = new AIAPIHandler(this.config);
        await this.loadSvgIcons();
        this.uiManager = new UIManager(this.config, this.robotSvg, this.timeSvg);
        
        // Check if extension is enabled before adding UI elements
        const isEnabled = await this.checkExtensionState();
        
        if (isEnabled) {
            await this.uiManager.addAIButtons();
            this.uiManager.addFloatingButton();
        }
        
        this.setupEventListeners();
        this.observeChanges();
        this.setupStorageListener();
        
        // Initialize floating panel interface using the proper manager
        this.initializeFloatingPanel();
    }

    async checkExtensionState() {
        try {
            const result = await chrome.storage.sync.get(['extensionEnabled']);
            // Default to enabled if not set
            return result.extensionEnabled !== false;
        } catch (error) {
            console.log('xMatic: Could not check extension state, defaulting to enabled:', error);
            return true;
        }
    }

    nuclearCleanup() {
        // Use UI manager for cleanup if available, otherwise do basic cleanup
        if (this.uiManager) {
            this.uiManager.cleanupOrphanedButtons();
        } else {
            // Basic cleanup before UI manager is initialized
        const xmaticElements = document.querySelectorAll('[class*="xmatic"], [data-xmatic-active], [data-xmatic-id]');
            xmaticElements.forEach(element => element.remove());
        }

        // Cleanup storage manager if available
        if (this.storageManager) {
            this.storageManager.cleanup();
        }
    }

    async loadSvgIcons() {
        try {
            // Load robot SVG
            const robotResponse = await fetch(chrome.runtime.getURL('src/assets/robot.svg'));
            this.robotSvg = await robotResponse.text();

            // Load time SVG
            const timeResponse = await fetch(chrome.runtime.getURL('src/assets/time.svg'));
            this.timeSvg = await timeResponse.text();
        } catch (error) {
            console.error('xMatic: Failed to load SVG icons:', error);
            // Fallback to hardcoded SVGs if loading fails
            this.robotSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H9L3 7V9C3 10.1 3.9 11 5 11V16C5 17.1 5.9 18 7 18H9C9 19.1 9.9 20 11 20H13C14.1 20 15 19.1 15 18H17C18.1 18 19 17.1 19 16V11C20.1 11 21 10.1 21 9ZM11 16H13V14H11V16ZM7 14V11H17V14H15V16H17V18H7V16H9V14H7Z"/>
            </svg>`;
            this.timeSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity="0.25"/>
                <path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z">
                    <animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/>
                </path>
            </svg>`;
        }
    }

    observeChanges() {
        // Disconnect any existing observer first
        if (this.observer) {
            this.observer.disconnect();
        }

        this.observer = new MutationObserver((mutations) => {
            // Only react to specific changes that matter
            let shouldUpdate = false;
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && node.querySelector && node.querySelector('[data-testid="toolBar"]')) {
                            shouldUpdate = true;
                        }
                    });
                }
            });

            if (shouldUpdate) {
                // Debounce the button addition to prevent excessive calls
                clearTimeout(this.addButtonsTimeout);
                this.addButtonsTimeout = setTimeout(async () => {
                    await this.addAIButtons();
                    this.addFloatingButton();
                }, 200);
            }
        });
        
        this.observer.observe(document.body, { childList: true, subtree: true });
    }

    setupEventListeners() {
        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'toggleExtension') {
                this.handleExtensionToggle(message.enabled);
                sendResponse({ success: true });
            }
        });

        // Add click event listeners for AI buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-xmatic-ai-button]')) {
                this.handleAIClick(e);
            }
        });
    }

    async handleExtensionToggle(enabled) {
        console.log('xMatic: Extension toggle:', enabled);
        
        if (enabled) {
            // Show all UI elements
            await this.showUIElements();
        } else {
            // Hide all UI elements
            this.hideUIElements();
        }
    }

    async showUIElements() {
        // Show floating button
        const floatingButton = document.getElementById('xmatic-floating-button');
        if (floatingButton) {
            floatingButton.style.display = 'flex';
        } else {
            // Create floating button if it doesn't exist
            this.uiManager.addFloatingButton();
        }

        // Show all AI buttons
        const aiButtons = document.querySelectorAll('[data-xmatic-ai-button]');
        if (aiButtons.length > 0) {
            aiButtons.forEach(button => {
                button.style.display = 'flex';
            });
        } else {
            // Create AI buttons if they don't exist
            await this.uiManager.addAIButtons();
        }

        console.log('xMatic: UI elements shown');
    }

    hideUIElements() {
        // Hide floating button
        const floatingButton = document.getElementById('xmatic-floating-button');
        if (floatingButton) {
            floatingButton.style.display = 'none';
        }

        // Hide all AI buttons
        const aiButtons = document.querySelectorAll('[data-xmatic-ai-button]');
        aiButtons.forEach(button => {
            button.style.display = 'none';
        });

        console.log('xMatic: UI elements hidden');
    }

    setupStorageListener() {
        // Listen for storage changes
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'sync' && changes.extensionEnabled) {
                const newValue = changes.extensionEnabled.newValue;
                console.log('xMatic: Extension state changed to:', newValue);
                this.handleExtensionToggle(newValue !== false);
            }
        });
    }

    async addAIButtons() {
        // Get latest config from storage
        this.config = await this.storageManager.getConfig();
        
        // Update UI manager with latest config and SVGs
        this.uiManager.updateConfig(this.config);
        this.uiManager.updateSvgIcons(this.robotSvg, this.timeSvg);
        
        // Use UI manager to add AI buttons
        await this.uiManager.addAIButtons();
    }

    async addFloatingButton() {
        // Get latest config from storage
        this.config = await this.storageManager.getConfig();
        this.uiManager.updateConfig(this.config);
        this.uiManager.addFloatingButton();
    }

    handleFloatingButtonClick() {
        // Use the FloatingPanelManager to open the panel
        if (window.xMaticPanel && typeof window.xMaticPanel.openPanel === 'function') {
            window.xMaticPanel.openPanel();
        } else {
            console.log('xMatic: Floating panel manager not ready yet');
        }
    }

    async handleAIClick() {
        const selectedProvider = this.config.selectedProvider || 'openai';
        
        if (!(await this.storageManager.hasApiKey(selectedProvider))) {
            const providerName = selectedProvider === 'grok' ? 'Grok' : 'OpenAI';
            alert(`Please configure your ${providerName} API key first!`);
                return;
        }

        try {
            // Show loading state
            this.uiManager.showAILoading();

            // Get context and generate reply
            const context = this.getContext();
            const reply = await this.generateReply(context);

            // Insert reply using the text insertion manager
            await this.insertReply(reply);

            // Reset button
            this.uiManager.resetAIButton();

        } catch (error) {
            console.error('xMatic: Error:', error);
            alert('Error: ' + error.message);

            // Reset button
            this.uiManager.resetAIButton();
        }
    }

    getContext() {
        // Use the context extractor to get tweet context
        return this.contextExtractor.getContext();
    }

    async generateReply(context) {
        // Update AI handler config if needed
        this.aiHandler.updateConfig(this.config);
        
        // Use the AI handler to generate the reply
        return await this.aiHandler.generateReply(context);
    }

    async insertReply(text) {
        // Use the text insertion manager to insert reply
        await this.textInsertionManager.insertReply(text);
    }

    initializeFloatingPanel() {
        try {
            // Inject CSS files first
            this.injectFloatingPanelCSS();
            
            // The FloatingPanelManager will handle everything else
            console.log('xMatic: Floating panel manager initialized');
        } catch (error) {
            console.error('xMatic: Failed to initialize floating panel:', error);
        }
    }

    injectFloatingPanelCSS() {
        try {
            // Inject floating panel CSS
            const panelCSSUrl = chrome.runtime.getURL('src/styles/floating-panel.css');
            fetch(panelCSSUrl).then(response => response.text()).then(css => {
                const panelStyle = document.createElement('style');
                panelStyle.id = 'xmatic-floating-panel-css';
                panelStyle.textContent = css;
                document.head.appendChild(panelStyle);
            });
            
            // Inject tabs CSS
            const tabsCSSUrl = chrome.runtime.getURL('src/styles/tabs.css');
            fetch(tabsCSSUrl).then(response => response.text()).then(css => {
                const tabsStyle = document.createElement('style');
                tabsStyle.id = 'xmatic-tabs-css';
                tabsStyle.textContent = css;
                document.head.appendChild(tabsStyle);
            });
            
            console.log('xMatic: Floating panel CSS injected successfully');
        } catch (error) {
            console.error('xMatic: Failed to inject floating panel CSS:', error);
        }
    }
}

// Prevent multiple instances with aggressive cleanup
if (window.xMaticInstance) {
    if (window.xMaticInstance.observer) {
        window.xMaticInstance.observer.disconnect();
    }
    // Cleanup handled by UI manager if available
    if (window.xMaticInstance.uiManager) {
        window.xMaticInstance.uiManager.cleanupOrphanedButtons();
    }
    window.xMaticInstance = null;
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.xMaticInstance = new XMatic();
    });
} else {
    window.xMaticInstance = new XMatic();
}