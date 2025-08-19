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
        this.floatingPanel = null;
        this.isPanelOpen = false;
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
        await this.uiManager.addAIButtons();
        this.uiManager.addFloatingButton();
        this.setupEventListeners();
        this.observeChanges();
        this.setupStorageListener();
        
        // Initialize floating panel interface
        this.initializeFloatingPanel().catch(error => {
            console.error('xMatic: Failed to initialize floating panel:', error);
        });
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
        // Listen for AI button clicks from UI manager
        document.addEventListener('xmatic-ai-click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleAIClick();
        });

        // Listen for floating button clicks from UI manager
        document.addEventListener('xmatic-float-click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleFloatingButtonClick();
        });
    }

    setupStorageListener() {
        this.storageManager.setupStorageListener((extensionEnabled) => {
            if (extensionEnabled.newValue === false) {
                    // Extension disabled - remove all AI buttons and floating button
                this.uiManager.removeAllAIButtons();
                this.uiManager.removeFloatingButton();
                } else {
                    // Extension enabled - add AI buttons and floating button back
                    this.addAIButtons();
                    this.addFloatingButton();
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
        // Open the floating panel instead of showing alert
        if (this.floatingPanel) {
            this.openFloatingPanel();
        } else {
            // Fallback if panel not ready
            console.log('xMatic: Floating panel not ready yet');
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

    async initializeFloatingPanel() {
        try {
            // Inject CSS files first
            await this.injectFloatingPanelCSS();
            
            // Create floating panel directly in content script (no CSP issues)
            this.createFloatingPanel();
            
            console.log('xMatic: Floating panel initialized successfully');
        } catch (error) {
            console.error('xMatic: Failed to initialize floating panel:', error);
        }
    }

    async injectFloatingPanelCSS() {
        try {
            // Inject floating panel CSS
            const panelCSSUrl = chrome.runtime.getURL('src/styles/floating-panel.css');
            const panelResponse = await fetch(panelCSSUrl);
            const panelCSS = await panelResponse.text();
            
            const panelStyle = document.createElement('style');
            panelStyle.id = 'xmatic-floating-panel-css';
            panelStyle.textContent = panelCSS;
            document.head.appendChild(panelStyle);
            
            // Inject tabs CSS
            const tabsCSSUrl = chrome.runtime.getURL('src/styles/tabs.css');
            const tabsResponse = await fetch(tabsCSSUrl);
            const tabsCSS = await tabsResponse.text();
            
            const tabsStyle = document.createElement('style');
            tabsStyle.id = 'xmatic-tabs-css';
            tabsStyle.textContent = tabsCSS;
            document.head.appendChild(tabsStyle);
            
            console.log('xMatic: Floating panel CSS injected successfully');
        } catch (error) {
            console.error('xMatic: Failed to inject floating panel CSS:', error);
        }
    }

    createFloatingPanel() {
        // Create floating panel container
        const panelContainer = document.createElement('div');
        panelContainer.id = 'xmatic-panel-container';
        panelContainer.style.cssText = `
            position: fixed;
            top: 0;
            right: 0;
            width: 400px;
            height: 100vh;
            background: #ffffff;
            box-shadow: -2px 0 20px rgba(0, 0, 0, 0.1);
            z-index: 10001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            display: none;
        `;

        // Create panel content
        panelContainer.innerHTML = `
            <div class="panel-header">
                <div class="panel-logo">
                    <img src="${chrome.runtime.getURL('src/assets/xMatic.png')}" alt="xMatic" class="logo-image">
                    <span class="logo-text">xMatic</span>
                </div>
                <button class="close-button" id="xmaticClosePanel">×</button>
            </div>

            <div class="tab-navigation">
                <button class="tab-button active" data-tab="generate">🚀 Generate</button>
                <button class="tab-button" data-tab="drafts">📝 Drafts</button>
                <button class="tab-button" data-tab="style">🎭 Style</button>
                <button class="tab-button" data-tab="ai">🤖 AI</button>
            </div>

            <div class="tab-content">
                <div id="generate-tab" class="tab-pane active">
                    <div class="tab-header">
                        <h3>🚀 Generate AI Reply</h3>
                        <p>Create contextual AI-powered replies to tweets</p>
                    </div>
                    <div class="generate-content">
                        <div class="tab-content-placeholder">Generate tab content will be loaded here</div>
                    </div>
                </div>

                <div id="drafts-tab" class="tab-pane">
                    <div class="tab-header">
                        <h3>📝 Saved Drafts</h3>
                        <p>Manage your saved reply drafts</p>
                    </div>
                    <div class="drafts-content">
                        <div class="tab-content-placeholder">Drafts tab content will be loaded here</div>
                    </div>
                </div>

                <div id="style-tab" class="tab-pane">
                    <div class="tab-header">
                        <h3>🎭 Response Style</h3>
                        <p>Configure your AI response personality</p>
                    </div>
                    <div class="style-content">
                        <div class="tab-content-placeholder">Style tab content will be loaded here</div>
                    </div>
                </div>

                <div id="ai-tab" class="tab-pane">
                    <div class="tab-header">
                        <h3>🤖 AI Configuration</h3>
                        <p>Manage API keys and model settings</p>
                    </div>
                    <div class="ai-content">
                        <div class="tab-content-placeholder">AI configuration content will be loaded here</div>
                    </div>
                </div>
            </div>

            <div class="panel-footer">
                <div class="version-info">v1.3.2</div>
                <div class="status-indicator" id="xmaticPanelStatus">
                    <span class="status-dot"></span>
                    <span class="status-text">Ready</span>
                </div>
            </div>
        `;

        // Add panel to page
        document.body.appendChild(panelContainer);

        // Set up panel functionality
        this.setupPanelFunctionality(panelContainer);

        // Store reference
        this.floatingPanel = panelContainer;
    }

    setupPanelFunctionality(panel) {
        // Close button functionality
        const closeBtn = panel.querySelector('#xmaticClosePanel');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeFloatingPanel());
        }

        // Tab switching functionality
        const tabButtons = panel.querySelectorAll('.tab-button');
        const tabPanes = panel.querySelectorAll('.tab-pane');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                this.switchPanelTab(tabName, tabButtons, tabPanes);
            });
        });

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isPanelOpen && !e.target.closest('#xmatic-panel-container') && !e.target.closest('#xmatic-floating-button')) {
                this.closeFloatingPanel();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isPanelOpen) {
                this.closeFloatingPanel();
            }
        });
    }

    switchPanelTab(tabName, tabButtons, tabPanes) {
        // Update active tab button
        tabButtons.forEach(btn => btn.classList.remove('active'));
        const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Update active tab pane
        tabPanes.forEach(pane => pane.classList.remove('active'));
        const activePane = document.querySelector(`#${tabName}-tab`);
        if (activePane) {
            activePane.classList.add('active');
        }
    }

    openFloatingPanel() {
        if (!this.floatingPanel) return;

        this.floatingPanel.style.display = 'block';
        setTimeout(() => {
            this.floatingPanel.style.transform = 'translateX(0)';
        }, 10);
        
        this.isPanelOpen = true;
        console.log('xMatic: Floating panel opened');
    }

    closeFloatingPanel() {
        if (!this.floatingPanel) return;

        this.floatingPanel.style.transform = 'translateX(100%)';
        setTimeout(() => {
            this.floatingPanel.style.display = 'none';
        }, 300);
        
        this.isPanelOpen = false;
        console.log('xMatic: Floating panel closed');
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