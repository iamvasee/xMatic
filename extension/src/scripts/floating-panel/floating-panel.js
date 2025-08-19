// xMatic - Floating Panel Manager
class FloatingPanelManager {
    constructor() {
        this.isOpen = false;
        this.currentTab = 'generate';
        this.panel = null;
        this.floatingButton = null;
        this.init();
    }

    init() {
        this.createFloatingButton();
        this.setupEventListeners();
        this.loadTabContent();
    }

    createFloatingButton() {
        // Create floating button using the float.svg
        this.floatingButton = document.createElement('div');
        this.floatingButton.id = 'xmatic-floating-button';
        this.floatingButton.className = 'xmatic-floating-button';
        this.floatingButton.innerHTML = `
            <img src="${chrome.runtime.getURL('src/assets/float.svg')}" 
                 alt="xMatic" 
                 class="floating-icon">
        `;
        
        // Position the button
        this.floatingButton.style.cssText = `
            position: fixed;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 10000;
            cursor: pointer;
            transition: all 0.3s ease;
        `;

        // Add to page
        document.body.appendChild(this.floatingButton);
    }

    setupEventListeners() {
        // Floating button click
        this.floatingButton.addEventListener('click', () => {
            this.togglePanel();
        });

        // Close button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'closePanel') {
                this.closePanel();
            }
        });

        // Tab navigation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-button')) {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            }
        });

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !e.target.closest('#xmatic-panel') && !e.target.closest('#xmatic-floating-button')) {
                this.closePanel();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closePanel();
            }
        });
    }

    togglePanel() {
        if (this.isOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }

    openPanel() {
        if (this.isOpen) return;

        // Create panel if it doesn't exist
        if (!this.panel) {
            this.createPanel();
        }

        // Show panel
        this.panel.style.display = 'block';
        this.panel.style.transform = 'translateX(0)';
        this.isOpen = true;

        // Update floating button
        this.floatingButton.style.transform = 'translateY(-50%) scale(0.9)';
        
        // Load current tab content
        this.loadTabContent();
    }

    closePanel() {
        if (!this.isOpen) return;

        // Hide panel
        this.panel.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (this.panel) {
                this.panel.style.display = 'none';
            }
        }, 300);

        this.isOpen = false;

        // Reset floating button
        this.floatingButton.style.transform = 'translateY(-50%) scale(1)';
    }

    createPanel() {
        // Create panel container
        this.panel = document.createElement('div');
        this.panel.id = 'xmatic-panel-container';
        this.panel.style.cssText = `
            position: fixed;
            top: 0;
            right: 0;
            width: 50vw;
            min-width: 600px;
            max-width: 800px;
            height: 100vh;
            background: white;
            box-shadow: -2px 0 20px rgba(0, 0, 0, 0.1);
            z-index: 10001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            overflow: hidden;
        `;

        // Load panel content
        this.loadPanelHTML();

        // Add to page
        document.body.appendChild(this.panel);
    }

    loadPanelHTML() {
        // Create panel HTML directly to avoid CSP issues
        this.panel.innerHTML = `
            <div class="panel-header">
                <div class="panel-logo">
                    <img src="${chrome.runtime.getURL('src/assets/xMatic.png')}" alt="xMatic" class="logo-image">
                    <span class="logo-text">xMatic</span>
                </div>
                <button class="close-button" id="closePanel">×</button>
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
                <div class="status-indicator" id="panelStatus">
                    <span class="status-dot"></span>
                    <span class="status-text">Ready</span>
                </div>
            </div>
        `;
        
        // Initialize tab functionality
        this.initializeTabs();
    }

    initializeTabs() {
        // Set up tab switching
        const tabButtons = this.panel.querySelectorAll('.tab-button');
        const tabPanes = this.panel.querySelectorAll('.tab-pane');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Update active tab button
        const tabButtons = this.panel.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => btn.classList.remove('active'));
        
        const activeButton = this.panel.querySelector(`[data-tab="${tabName}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Update active tab pane
        const tabPanes = this.panel.querySelectorAll('.tab-pane');
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        const activePane = this.panel.querySelector(`#${tabName}-tab`);
        if (activePane) {
            activePane.classList.add('active');
        }

        this.currentTab = tabName;
        this.loadTabContent();
    }

    loadTabContent() {
        // Load specific tab content based on current tab
        switch (this.currentTab) {
            case 'generate':
                this.loadGenerateTab();
                break;
            case 'drafts':
                this.loadDraftsTab();
                break;
            case 'style':
                this.loadStyleTab();
                break;
            case 'ai':
                this.loadAITab();
                break;
        }
    }

    loadGenerateTab() {
        // Load generate tab content
        const generateContent = this.panel.querySelector('.generate-content');
        if (generateContent) {
            generateContent.innerHTML = '<div class="tab-content-placeholder">Generate tab content will be loaded here</div>';
        }
    }

    loadDraftsTab() {
        // Load drafts tab content
        const draftsContent = this.panel.querySelector('.drafts-content');
        if (draftsContent) {
            draftsContent.innerHTML = '<div class="tab-content-placeholder">Drafts tab content will be loaded here</div>';
        }
    }

    loadStyleTab() {
        // Load style tab content
        const styleContent = this.panel.querySelector('.style-content');
        if (styleContent) {
            styleContent.innerHTML = '<div class="tab-content-placeholder">Style tab content will be loaded here</div>';
        }
    }

    loadAITab() {
        // Load AI tab content
        const aiContent = this.panel.querySelector('.ai-content');
        if (aiContent) {
            aiContent.innerHTML = '<div class="tab-content-placeholder">AI configuration content will be loaded here</div>';
        }
    }

    // Public methods for external access
    getCurrentTab() {
        return this.currentTab;
    }

    isPanelOpen() {
        return this.isOpen;
    }

    updateStatus(status, type = 'info') {
        const statusIndicator = this.panel?.querySelector('#panelStatus');
        if (statusIndicator) {
            const statusText = statusIndicator.querySelector('.status-text');
            const statusDot = statusIndicator.querySelector('.status-dot');
            
            if (statusText) statusText.textContent = status;
            if (statusDot) {
                statusDot.className = `status-dot ${type}`;
            }
        }
    }
}

// Initialize floating panel when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.xMaticPanel = new FloatingPanelManager();
    });
} else {
    window.xMaticPanel = new FloatingPanelManager();
}
